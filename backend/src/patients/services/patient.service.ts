import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { buildPage, Page } from 'src/common/pagination/page';
import { Repository } from 'typeorm';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { ListPatientsQueryDto } from '../dtos/list-patients-query.dto';
import { PatientResponseDto } from '../dtos/patient-response.dto';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create({ name, birthDate, cpf }: CreatePatientDto): Promise<PatientResponseDto> {
    const exists = await this.patientRepository.exists({ where: { cpf } });

    if (exists) throw new ConflictException('cpf já cadastrado');

    const entity = this.patientRepository.create({
      name,
      birthDate,
      cpf,
    });

    const saved = await this.patientRepository.save(entity);

    return new PatientResponseDto(saved);
  }

  async list({ page = 1, pageSize = 10 }: ListPatientsQueryDto): Promise<Page<PatientResponseDto>> {
    const currentPage = Math.max(page, 1);
    const limit = Math.min(pageSize, 100);
    const skip = (currentPage - 1) * limit;

    const [rows, total] = await this.patientRepository.findAndCount({
      select: { id: true, name: true, cpf: true, birthDate: true },
      order: { name: 'ASC', id: 'ASC' },
      skip,
      take: limit,
    });

    const items = rows.map(PatientResponseDto.from);

    return buildPage(items, total, currentPage, limit);
  }
}
