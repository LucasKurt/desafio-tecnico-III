import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../entities/patient.entity';

export class PatientResponseDto {
  @ApiProperty({ example: '9a186d40-f70e-4389-9386-e425b6d0195e' }) id: string;
  @ApiProperty({ example: 'Paciente 1' }) name: string;
  @ApiProperty({ example: '29645684056' }) cpf: string;
  @ApiProperty({ example: '2025-01-31' }) birthDate: string;

  constructor({ id, birthDate, cpf, name }: Patient) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.birthDate = birthDate;
  }

  static from(patient: Patient) {
    return new PatientResponseDto(patient);
  }
}
