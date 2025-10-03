import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page, QueryParamns } from '../../../shared/models/page.model';
import { Observable } from 'rxjs';
import { CreateDiagnostic, Diagnostic } from '../models/diagnostic.model';

const BASE = `${environment.apiUrl}/diagnostics`;

export class DiagnosticService {
  private http = inject(HttpClient);

  list({ page, pageSize }: QueryParamns): Observable<Page<Diagnostic>> {
    let params = new HttpParams();
    if (page) params = params.set('page', String(page));
    if (pageSize) params = params.set('pageSize', String(pageSize));

    return this.http.get<Page<Diagnostic>>(BASE, { params });
  }

  create(dto: CreateDiagnostic, idemKey?: string): Observable<Diagnostic> {
    const key = idemKey ?? crypto.randomUUID();
    const headers = new HttpHeaders().set('Idempotency-Key', key);

    return this.http.post<Diagnostic>(BASE, dto, { headers });
  }
}
