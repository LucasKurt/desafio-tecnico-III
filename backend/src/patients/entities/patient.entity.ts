import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: string;

  @Index({ unique: true })
  @Column({ length: 11 })
  cpf: string;
}
