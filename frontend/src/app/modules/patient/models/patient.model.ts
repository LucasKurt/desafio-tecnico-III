import { QueryParamns } from '../../../shared/models/page.model';

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
}

export interface QueryPatient extends QueryParamns {
  name?: string;
}

export type CreatePatient = Omit<Patient, 'id'>;
export type UpdatePatient = Partial<CreatePatient>;
