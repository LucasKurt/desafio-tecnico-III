export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
}

export type CreatePatient = Omit<Patient, 'id'>;
export type UpdatePatient = Partial<CreatePatient>;
