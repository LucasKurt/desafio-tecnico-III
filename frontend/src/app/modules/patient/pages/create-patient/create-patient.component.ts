import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { PatientService } from '../../service/patient-service';
import { HttpErrorResponse } from '@angular/common/http';
import { cpfValidator } from '../../../../shared/validators/cpf.validator';

@Component({
  selector: 'app-create-patient',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-patient.component.html',
  styleUrl: './create-patient.component.scss'
})
export class CreatePatientComponent implements OnInit {
  form!: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(PatientService);
  private router = inject(Router);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', [Validators.required, cpfValidator]],
      birthDate: [null as Date | null, Validators.required]
    });
  }

  save() {
    if (this.form.invalid) return;

    const values = this.form.value;
    const cpf = (values.cpf as string).replace(/\D/g, '');

    const d = values.birthDate as Date;
    const birthDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

    this.api
      .create({
        name: values.name!,
        cpf,
        birthDate
      })
      .subscribe({
        next: () => this.router.navigate(['../']),
        error: (err: HttpErrorResponse) => {
          console.log(err);
          if (err.error.message === 'cpf já cadastrado') {
            const ctrl = this.form.get('cpf');
            const current = ctrl?.errors ?? {};
            ctrl?.setErrors({ ...current, duplicated: true });
            ctrl?.markAsTouched();
          } else {
            console.error(err);
          }
        }
      });
  }
}
