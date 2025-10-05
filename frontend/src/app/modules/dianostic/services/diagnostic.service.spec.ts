import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import {
  CreateDiagnostic,
  Diagnostic,
  ImagingModality,
  ImagingModalityPtLabel
} from '../models/diagnostic.model';
import { DiagnosticService } from './diagnostic.service';

const BASE = `${environment.apiUrl}/diagnostics`;

describe('DiagnosticService', () => {
  let service: DiagnosticService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DiagnosticService]
    });
    service = TestBed.inject(DiagnosticService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('deve listar todos os exames (GET /api/diagnostic)', () => {
    const mock: Page<Diagnostic> = {
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      items: [{ id: '1', patientName: 'Ana', modalityLabel: 'Ressonância Magnética (RM)' }]
    };

    service.list({}).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deve listar todos os exames (GET /api/diagnostic?page=3&pageSize=3)', () => {
    const mock: Page<Diagnostic> = {
      total: 15,
      page: 3,
      pageSize: 3,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
      items: [
        { id: '1', patientName: 'Ana', modalityLabel: 'Ressonância Magnética (RM)' },
        { id: '1', patientName: 'Ana', modalityLabel: 'Ressonância Magnética (RM)' },
        { id: '1', patientName: 'Ana', modalityLabel: 'Ressonância Magnética (RM)' }
      ]
    };

    service.list({ page: 3, pageSize: 3 }).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(
      (r) =>
        r.method === 'GET' &&
        r.url.endsWith('/diagnostics') &&
        r.params.get('page') === '3' &&
        r.params.get('pageSize') === '3'
    );
    req.flush(mock);
  });

  it('deve criar um paciente (POST /api/diagnostics)', () => {
    const payload: CreateDiagnostic = {
      patientId: '1',
      modality: ImagingModality.DX
    };

    const mockResponse: Diagnostic = {
      id: 'abc123',
      patientName: 'Ana',
      modalityLabel: ImagingModalityPtLabel.MR
    };

    service.create(payload).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.id).toBe('abc123');
    });

    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(mockResponse, { status: 201, statusText: 'Created' });
  });
});
