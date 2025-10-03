import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list-patients/list-patients.component').then((m) => m.ListPatientsComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-patient/create-patient.component').then(
        (m) => m.CreatePatientComponent
      )
  }
];
