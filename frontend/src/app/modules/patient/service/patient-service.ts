import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, QueryParamns } from '../../../shared/models/page.model';
import { CreatePatient, Patient } from '../models/patient.model';

const BASE = `${environment.apiUrl}/patients`;

export class PatientService {
  private http = inject(HttpClient);

  list({ page, pageSize }: QueryParamns): Observable<Page<Patient>> {
    let params = new HttpParams();
    if (page) params = params.set('page', String(page));
    if (pageSize) params = params.set('pageSize', String(pageSize));

    return this.http.get<Page<Patient>>(BASE, { params });
  }

  create(dto: CreatePatient): Observable<Patient> {
    return this.http.post<Patient>(BASE, dto);
  }
}
