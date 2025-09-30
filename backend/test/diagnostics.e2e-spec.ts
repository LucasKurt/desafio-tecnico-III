import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { RequestIntent } from 'src/common/modules/idempotency/entities/request-intent.entity';
import { baseTypeOrmOptions } from 'src/database/typeorm.options';
import { DiagnosticsModule } from 'src/diagnostics/diagnostics.module';
import { Diagnostic } from 'src/diagnostics/entities/diagnostic.entity';
import { ImagingModalityPtLabel } from 'src/diagnostics/enums/imaging-modality.enum';
import { Patient } from 'src/patients/entities/patient.entity';
import { PatientsModule } from 'src/patients/patients.module';
import request from 'supertest';
import { DataSource, DataSourceOptions } from 'typeorm';

const schema = `test_${process.env.JEST_WORKER_ID ?? '1'}`;

describe('Diagnostics (e2e)', () => {
  let app: INestApplication;
  let patientId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            ...baseTypeOrmOptions(),
            entities: [Diagnostic, Patient, RequestIntent],
            schema,
            retryAttempts: 0,
          }),
          async dataSourceFactory(options?: DataSourceOptions) {
            const ds = new DataSource(options!);
            await ds.initialize();
            await ds.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
            await ds.synchronize();
            return ds;
          },
        }),
        DiagnosticsModule,
        PatientsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  beforeEach(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);

    const { body: patient } = await http()
      .post('/patients')
      .send({
        name: 'Alice',
        birthDate: '1990-08-11',
        cpf: '90725530049',
      })
      .expect(201);
    patientId = patient.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it('POST /diagnostics 201', async () => {
    const key = randomUUID();

    const { body: diagnostic } = await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId, modality: 'CR' })
      .expect(201);

    expect(diagnostic).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
        patientName: expect.any(String),
        modalityLabel: expect.any(String),
      }),
    );

    const labels = Object.values(ImagingModalityPtLabel);
    expect(labels).toContain(diagnostic.modalityLabel);
  });

  it('POST /diagnostics 200', async () => {
    const key = randomUUID();

    const { body: firstDiagnostic } = await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId, modality: 'CR' })
      .expect(201);

    const { body: secondDiagnostic } = await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId, modality: 'CR' })
      .expect(200);

    expect(secondDiagnostic).toStrictEqual(firstDiagnostic);
  });

  it('POST /diagnostics multiplas vezes, apenas um persistido', async () => {
    const key = randomUUID();
    const sameDiagnostics = [
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
    ];

    const results = await Promise.all(
      sameDiagnostics.map((diagnostic) =>
        http().post('/diagnostics').set('Idempotency-Key', key).send(diagnostic),
      ),
    );

    const statuses = results.map((r) => r.status);
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 200)).toHaveLength(4);

    const { body: page } = await http().get('/diagnostics').expect(200);

    expect(page).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }),
    );
  });

  it('POST /diagnostics 400 - a idempotencyKey não foi informada', async () => {
    const {
      body: { message },
    } = await http()
      .post('/diagnostics')
      .send({ patientId: randomUUID(), modality: 'CR' })
      .expect(400);

    const msgs = Array.isArray(message) ? message.join(' | ') : String(message ?? '');
    expect(msgs).toMatch(/Idempotency-Key obrigatória/i);
  });

  it('POST /diagnostics 409 - a idempotencyKey foi utilizada em outra request', async () => {
    const key = randomUUID();

    await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId, modality: 'CR' })
      .expect(201);

    const { body: secondDiagnostic } = await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId, modality: 'MG' })
      .expect(409);

    const msgs = Array.isArray(secondDiagnostic.message)
      ? secondDiagnostic.message.join(' | ')
      : String(secondDiagnostic.message ?? '');
    expect(msgs).toMatch(/Idempotency-Key já usada com payload diferente/i);
  });

  it('POST /diagnostics 400 - paciente não encontrado', async () => {
    const key = randomUUID();

    const { body: diagnostic } = await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId: key, modality: 'CR' })
      .expect(400);

    const msgs = Array.isArray(diagnostic.message)
      ? diagnostic.message.join(' | ')
      : String(diagnostic.message ?? '');
    expect(msgs).toMatch(/paciente não encontrado/i);
  });

  it('POST /diagnostics 400 - enum inválido', async () => {
    const key = randomUUID();

    const { body: diagnostic } = await http()
      .post('/diagnostics')
      .set('Idempotency-Key', key)
      .send({ patientId, modality: 'AA' })
      .expect(400);

    const msgs = Array.isArray(diagnostic.message)
      ? diagnostic.message.join(' | ')
      : String(diagnostic.message ?? '');
    expect(msgs).toMatch(/modalidade inválida. Use: CR, CT, DX, MG, MR, NM, OT, PT, RF, US, XA/i);
  });

  it('GET /diagnostics 200 - retorna página padrão (page=1, pageSize=10)', async () => {
    const diagnostics = [
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
    ];

    await Promise.all(
      diagnostics.map((diagnostic) =>
        http()
          .post('/diagnostics')
          .set('Idempotency-Key', randomUUID())
          .send(diagnostic)
          .expect(201),
      ),
    );

    const { body: diagnosticsPage } = await http().get('/diagnostics').expect(200);

    expect(diagnosticsPage).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: 5,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }),
    );

    for (const diagnostic of diagnosticsPage.items) {
      expect(diagnostic).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          patientName: expect.any(String),
          modalityLabel: expect.any(String),
        }),
      );

      const labels = Object.values(ImagingModalityPtLabel);
      expect(labels).toContain(diagnostic.modalityLabel);
    }
  });

  it('GET /diagnostics 200 - retorna página padrão (page=2, pageSize=2)', async () => {
    const diagnostics = [
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
      { patientId, modality: 'CR' },
    ];

    await Promise.all(
      diagnostics.map((diagnostic) =>
        http()
          .post('/diagnostics')
          .set('Idempotency-Key', randomUUID())
          .send(diagnostic)
          .expect(201),
      ),
    );

    const { body: diagnosticsPage } = await http()
      .get('/diagnostics?page=2&pageSize=2')
      .expect(200);

    expect(diagnosticsPage).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: 5,
        page: 2,
        pageSize: 2,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      }),
    );

    for (const diagnostic of diagnosticsPage.items) {
      expect(diagnostic).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          patientName: expect.any(String),
          modalityLabel: expect.any(String),
        }),
      );

      const labels = Object.values(ImagingModalityPtLabel);
      expect(labels).toContain(diagnostic.modalityLabel);
    }
  });
});
