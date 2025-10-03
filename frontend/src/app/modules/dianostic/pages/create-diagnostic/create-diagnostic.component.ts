import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CreateDiagnostic,
  ImagingModality,
  ImagingModalityPtLabel
} from '../../models/diagnostic.model';
import { DiagnosticService } from '../../services/diagnostic.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  switchMap
} from 'rxjs';
import { Patient } from '../../../patient/models/patient.model';
import { AsyncPipe } from '@angular/common';
import { PatientService } from '../../../patient/service/patient-service';

@Component({
  selector: 'app-create-diagnostic',
  imports: [
    AsyncPipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInput,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-diagnostic.component.html',
  styleUrl: './create-diagnostic.component.scss'
})
export class CreateDiagnosticComponent implements OnInit {
  form!: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(DiagnosticService);
  private patientApi = inject(PatientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patients: Patient[] = [
    { id: 'p1', name: 'Ana Paula', birthDate: '1990-01-10', cpf: '...' },
    { id: 'p2', name: 'Bruno Silva', birthDate: '1988-06-03', cpf: '...' },
    { id: 'p3', name: 'Carlos Souza', birthDate: '1979-09-21', cpf: '...' }
  ];

  filteredPatients$!: Observable<Patient[]>;
  modalities = Object.keys(ImagingModalityPtLabel) as ImagingModality[];
  modalityLabel = ImagingModalityPtLabel;

  ngOnInit(): void {
    this.form = this.fb.group({
      patient: [null as Patient | null, Validators.required],
      patientId: ['', Validators.required],
      modality: ['', Validators.required]
    });

    this.filteredPatients$ = this.form.get('patient')!.valueChanges.pipe(
      startWith(''),
      map((v) => (typeof v === 'string' ? v : v?.name) ?? ''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((name) =>
        this.patientApi.list({ pageSize: 10, name: name.trim() || undefined }).pipe(
          map((page) => page.items),
          catchError(() => of([] as Patient[]))
        )
      )
    );
  }

  displayPatient = (p?: Patient | string | null): string =>
    typeof p === 'string' ? p : (p?.name ?? '');

  onPatientSelected(p: Patient | null) {
    this.form.patchValue({ patientId: p?.id ?? '' });
  }

  save() {
    if (this.form.invalid) return;

    const { modality, patientId }: CreateDiagnostic = this.form.value;

    this.api.create({ modality, patientId }).subscribe({
      next: () => this.router.navigate(['../'], { relativeTo: this.route }),
      error: (err: HttpErrorResponse) => {
        //istanbul ignore next
        console.error(err);
      }
    });
  }
}
