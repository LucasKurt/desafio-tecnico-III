import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';
import { ImagingModality } from '../enums/imaging-modality.enum';

export class CreateDiagnosticDto {
  @ApiProperty({
    example: '9a186d40-f70e-4389-9386-e425b6d0195e',
    description: 'Id do paciente',
    format: 'uuid',
  })
  @IsUUID('4')
  patientId: string;

  @ApiProperty({ enum: ImagingModality, enumName: 'ImagingModality' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(ImagingModality, {
    message: 'modality inválida. Use: CR, CT, DX, MG, MR, NM, OT, PT, RF, US, XA',
  })
  modality: ImagingModality;
}
