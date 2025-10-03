import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/page';

export class PatientPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ maxLength: 120, example: 'Paciente 1', description: 'Nome do paciente' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;
}
