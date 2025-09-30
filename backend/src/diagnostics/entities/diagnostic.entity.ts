import { Patient } from 'src/patients/entities/patient.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ImagingModality } from '../enums/imaging-modality.enum';

@Entity('diagnostics')
export class Diagnostic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { nullable: false, onDelete: 'RESTRICT', eager: true })
  @Index()
  patient: Patient;

  @Column({ type: 'enum', enum: ImagingModality })
  modality: ImagingModality;
}
