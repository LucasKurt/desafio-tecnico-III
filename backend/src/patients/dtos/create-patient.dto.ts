import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsString, Length } from 'class-validator';
import { cleanCpf, IsCPF } from 'src/common/validators/is-cpf.validator';

export class CreatePatientDto {
  @ApiProperty({ maxLength: 120, example: 'Paciente 1', description: 'Nome do paciente' })
  @IsString()
  @Length(1, 120)
  name: string;

  @ApiProperty({ example: '1990-08-11', description: 'YYYY-MM-DD' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: '29645684056', description: '11 dígitos' })
  @Transform(({ value }) => cleanCpf(value))
  @IsCPF()
  cpf: string;
}
