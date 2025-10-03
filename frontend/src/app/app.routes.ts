import { Routes } from '@angular/router';
import { PatientService } from './modules/patient/service/patient-service';
import { DiagnosticService } from './modules/dianostic/services/diagnostic.service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'patients?page=1&pageSize=5' },
  {
    path: 'patients',
    providers: [PatientService],
    loadChildren: () => import('./modules/patient/patient.routes').then((m) => m.patientRoutes)
  },
  {
    path: 'diagnostics',
    providers: [DiagnosticService],
    loadChildren: () =>
      import('./modules/dianostic/diagnostic.routes').then((m) => m.diagnosticRoutes)
  },
  { path: '**', redirectTo: 'patients' }
];
