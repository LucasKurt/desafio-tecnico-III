import { ApiProperty } from '@nestjs/swagger';
import { Diagnostic } from '../entities/diagnostic.entity';
import { ImagingModalityPtLabel } from '../enums/imaging-modality.enum';

export class DiagnosticResponseDto {
  @ApiProperty({ example: '9a186d40-f70e-4389-9386-e425b6d0195e' }) id: string;
  @ApiProperty({ example: 'Paciente 1' }) patientName: string;
  @ApiProperty({ example: 'Ressonância Magnética (RM)' }) modalityLabel: string;

  constructor({ id, modality, patient }: Diagnostic) {
    this.id = id;
    this.patientName = patient.name;
    this.modalityLabel = ImagingModalityPtLabel[modality];
  }

  static from(diagnostic: Diagnostic) {
    return new DiagnosticResponseDto(diagnostic);
  }
}
