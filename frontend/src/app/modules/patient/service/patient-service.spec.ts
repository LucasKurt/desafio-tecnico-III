import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreatePatient, Patient } from '../models/patient.model';
import { PatientService } from './patient-service';
import { Page } from '../../../shared/models/page.model';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/patients`;

describe('PatientService', () => {
  let service: PatientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PatientService]
    });
    service = TestBed.inject(PatientService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('deve listar todos os pacientes (GET /api/patient)', () => {
    const mock: Page<Patient> = {
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      items: [{ id: '1', name: 'Ana', cpf: '123', birthDate: '01/01/1990' }]
    };

    service.list({}).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deve listar todos os pacientes (GET /api/patient?page=3&pageSize=3)', () => {
    const mock: Page<Patient> = {
      total: 15,
      page: 3,
      pageSize: 3,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
      items: [
        { id: '1', name: 'Ana', cpf: '123', birthDate: '01/01/1990' },
        { id: '1', name: 'Ana', cpf: '123', birthDate: '01/01/1990' },
        { id: '1', name: 'Ana', cpf: '123', birthDate: '01/01/1990' }
      ]
    };

    service.list({ page: 3, pageSize: 3 }).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(
      (r) =>
        r.method === 'GET' &&
        r.url.endsWith('/patients') &&
        r.params.get('page') === '3' &&
        r.params.get('pageSize') === '3'
    );
    req.flush(mock);
  });

  it('deve criar um paciente (POST /api/patient)', () => {
    const payload: CreatePatient = {
      name: 'Ana',
      cpf: '123.456.789-09',
      birthDate: '01/01/1990'
    };

    const mockResponse: Patient = {
      id: 'abc123',
      ...payload
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
