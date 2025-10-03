import { Routes } from '@angular/router';
import { PatientService } from './modules/patient/service/patient-service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'patients?page=1&pageSize=5' },
  {
    path: 'patients',
    providers: [PatientService],
    loadChildren: () => import('./modules/patient/patient.routes').then((m) => m.patientRoutes)
  },
  { path: '**', redirectTo: 'patients' }
];
