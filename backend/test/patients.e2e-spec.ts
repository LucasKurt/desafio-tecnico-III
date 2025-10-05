import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpfExceptionFilter } from 'src/common/filters/cpf-exception.filter';
import { baseTypeOrmOptions } from 'src/database/typeorm.options';
import { Patient } from 'src/patients/entities/patient.entity';
import { PatientsModule } from 'src/patients/patients.module';
import request from 'supertest';
import { DataSource, DataSourceOptions } from 'typeorm';

const schema = `test_${process.env.JEST_WORKER_ID ?? '1'}`;

describe('Patients (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            ...baseTypeOrmOptions(),
            entities: [Patient],
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
        PatientsModule,
      ],
    }).compile();

    app = modRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new CpfExceptionFilter());
    await app.init();
  });

  beforeEach(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it('POST /patients 201', async () => {
    const { body: patient } = await http()
      .post('/patients')
      .send({ name: 'Alice', birthDate: '1990-08-11', cpf: '29645684056' })
      .expect(201);

    expect(patient).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
        name: 'Alice',
        cpf: '29645684056',
        birthDate: '1990-08-11',
      }),
    );
  });

  it('POST /patients 409 - cpf já cadastrado', async () => {
    const validCpf = '29645684056';

    await http()
      .post('/patients')
      .send({ name: 'Alice', birthDate: '1990-08-11', cpf: validCpf })
      .expect(201);

    const {
      body: { message },
    } = await http()
      .post('/patients')
      .send({ name: 'Bob', birthDate: '1995-01-01', cpf: validCpf })
      .expect(409);

    const msgs = Array.isArray(message) ? message.join(' | ') : String(message ?? '');
    expect(msgs).toMatch(/cpf já cadastrado/i);
  });

  it('POST /patients 409 - requisições concorrentes', async () => {
    const payload = { name: 'Alice', birthDate: '1990-08-11', cpf: '29645684056' };
    const calls = Array.from({ length: 100 }, () => http().post('/patients').send(payload));

    const settled = await Promise.allSettled(calls);

    let status201 = 0;
    for (const r of settled) {
      const res = r.status === 'fulfilled' ? r.value : r.reason;
      expect([201, 409]).toContain(res.status);

      if (res.status === 201) status201++;
      if (res.status === 409) {
        const msg = Array.isArray(res.body?.message)
          ? res.body.message.join(' | ')
          : String(res.body?.message ?? '');
        expect(msg).toMatch(/cpf já cadastrado/i);
      }
    }

    expect(status201).toBe(1);
  });

  it.each(['11111111111', '12345678900', '123456789'])(
    'POST /patients 400 - cpf inválido (%s)',
    async (badCpf) => {
      const {
        body: { message },
      } = await http()
        .post('/patients')
        .send({ name: 'Alice', birthDate: '1990-08-11', cpf: badCpf })
        .expect(400);

      const msgs = Array.isArray(message) ? message.join(' | ') : String(message);
      expect(msgs).toMatch(/CPF inválido/i);
    },
  );

  it('GET /patients 200 - retorna página padrão (page=1, pageSize=10)', async () => {
    const patients = [
      { name: 'Alice', birthDate: '1990-08-11', cpf: '29645684056' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '66833262071' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '91935915002' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '68040926009' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '65839899054' },
    ];

    await Promise.all(patients.map((p) => http().post('/patients').send(p).expect(201)));

    const { body: patientsPage } = await http().get('/patients').expect(200);

    expect(patientsPage).toEqual(
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

    for (const patient of patientsPage.items) {
      expect(patient).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          name: expect.any(String),
          cpf: expect.any(String),
          birthDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
        }),
      );
    }
  });

  it('GET /patients (page=1, pageSize=2, name=Al) paginação 200', async () => {
    const patients = [
      { name: 'Alice', birthDate: '1990-08-11', cpf: '29645684056' },
      { name: 'Marcos', birthDate: '1990-08-11', cpf: '66833262071' },
      { name: 'Marcos', birthDate: '1990-08-11', cpf: '91935915002' },
      { name: 'Marcos', birthDate: '1990-08-11', cpf: '68040926009' },
      { name: 'Bruno', birthDate: '1990-08-11', cpf: '65839899054' },
    ];

    await Promise.all(patients.map((p) => http().post('/patients').send(p).expect(201)));

    const { body: patientsPage } = await http()
      .get('/patients?page=1&pageSize=2&name=Al')
      .expect(200);

    expect(patientsPage).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: 1,
        page: 1,
        pageSize: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }),
    );

    for (const patient of patientsPage.items) {
      expect(patient).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          name: expect.stringContaining('Alice'),
          cpf: expect.stringContaining('29645684056'),
          birthDate: expect.stringContaining('1990-08-11'),
        }),
      );
    }
  });
});
