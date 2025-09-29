import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyModule } from 'src/common/modules/idempotency/idempotency.module';
import { Patient } from 'src/patients/entities/patient.entity';
import { DiagnosticController } from './controllers/diagnostic.controller';
import { Diagnostic } from './entities/diagnostic.entity';
import { DiagnosticService } from './services/diagnostic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnostic, Patient]), IdempotencyModule],
  controllers: [DiagnosticController],
  providers: [DiagnosticService],
})
export class DiagnosticsModule {}
