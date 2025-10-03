import { Routes } from '@angular/router';
import { PatientService } from '../patient/service/patient-service';

export const diagnosticRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list-dianostics/list-dianostics.component').then(
        (m) => m.ListDianosticsComponent
      )
  },
  {
    path: 'create',
    providers: [PatientService],
    loadComponent: () =>
      import('./pages/create-diagnostic/create-diagnostic.component').then(
        (m) => m.CreateDiagnosticComponent
      )
  }
];
