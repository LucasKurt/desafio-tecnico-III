import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { IdempotencyService } from 'src/common/modules/idempotency/services/idempotency.service';
import { buildPage, Page, PageOptionsDto } from 'src/common/pagination/page';
import { Patient } from 'src/patients/entities/patient.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateDiagnosticDto } from '../dtos/create-diagnostic.dto';
import { DiagnosticResponseDto } from '../dtos/diagnostic-response.dto';
import { Diagnostic } from '../entities/diagnostic.entity';

@Injectable()
export class DiagnosticService {
  constructor(
    private readonly ds: DataSource,
    private readonly idempotencyService: IdempotencyService,
    @InjectRepository(Diagnostic)
    private readonly diagnosticRepository: Repository<Diagnostic>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(
    idempotencyKey: string,
    { patientId, modality }: CreateDiagnosticDto,
  ): Promise<{ created: boolean; body: DiagnosticResponseDto }> {
    if (!idempotencyKey) throw new BadRequestException('Idempotency-Key obrigatória');

    const patientExists = await this.patientRepository.existsBy({ id: patientId });
    if (!patientExists) throw new NotFoundException('paciente não encontrado');

    const requestHash = createHash('sha256')
      .update(JSON.stringify({ patientId, modality }))
      .digest('hex');

    return this.ds.transaction('READ COMMITTED', async (em: EntityManager) => {
      const requestIntent = await this.idempotencyService.ensureAndLockTx(em, idempotencyKey);

      if (requestIntent.requestHash && requestIntent.requestHash !== requestHash) {
        throw new ConflictException('Idempotency-Key já usada com payload diferente');
      }
      const diagnosticRepository = em.getRepository(Diagnostic);

      if (requestIntent.entityId) {
        const entity = await diagnosticRepository.findOneOrFail({
          where: { id: requestIntent.entityId },
          relations: { patient: true },
        });

        return { created: false, body: new DiagnosticResponseDto(entity) };
      }
      const entity = diagnosticRepository.create({ patient: { id: patientId }, modality });
      const saved = await diagnosticRepository.save(entity);

      await this.idempotencyService.finalizeTx(em, idempotencyKey, {
        requestHash,
        entityId: saved.id,
      });
      saved.patient = await em.findOneByOrFail(Patient, { id: patientId });

      return { created: true, body: new DiagnosticResponseDto(saved) };
    });
  }

  async list({ page = 1, pageSize = 10 }: PageOptionsDto): Promise<Page<DiagnosticResponseDto>> {
    const currentPage = Math.max(page, 1);
    const limit = Math.min(pageSize, 100);
    const skip = (currentPage - 1) * limit;

    const [rows, total] = await this.diagnosticRepository.findAndCount({
      relations: { patient: true },
      order: { patient: { name: 'ASC' }, id: 'ASC' },
      skip,
      take: limit,
    });

    const items = rows.map(DiagnosticResponseDto.from);

    return buildPage(items, total, currentPage, limit);
  }
}
