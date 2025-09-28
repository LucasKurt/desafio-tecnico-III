import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { PatientsModule } from 'src/patients/patients.module';
import request from 'supertest';

describe('Patients (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [Patient],
          logging: false,
        }),
        PatientsModule,
      ],
    }).compile();

    app = modRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it('POST /patients 201', async () => {
    const res = await http()
      .post('/patients')
      .send({ name: 'Alice', birthDate: '1990-08-11', cpf: '29645684056' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
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

    const res = await http()
      .post('/patients')
      .send({ name: 'Bob', birthDate: '1995-01-01', cpf: validCpf });

    expect(res.status).toBe(409);
    const msgs = Array.isArray(res.body?.message)
      ? res.body.message.join(' | ')
      : String(res.body?.message ?? '');
    expect(msgs).toMatch(/cpf já cadastrado/i);
  });

  it.each(['11111111111', '12345678900', '123456789'])(
    'POST /patients 400 - cpf inválido (%s)',
    async (badCpf) => {
      const res = await http()
        .post('/patients')
        .send({ name: 'Alice', birthDate: '1990-08-11', cpf: badCpf });

      expect(res.status).toBe(400);
      const msgs = Array.isArray(res.body.message)
        ? res.body.message.join(' | ')
        : String(res.body.message);
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

    patients.forEach(async (patient) => await http().post('/patients').send(patient).expect(201));

    const res = await http().get('/patients').expect(200);

    expect(res.body).toEqual(
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

    for (const item of res.body.items) {
      expect(item).toEqual(
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

  it('GET /patients 200', async () => {
    const patients = [
      { name: 'Alice', birthDate: '1990-08-11', cpf: '29645684056' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '66833262071' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '91935915002' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '68040926009' },
      { name: 'Alice', birthDate: '1990-08-11', cpf: '65839899054' },
    ];

    patients.forEach(async (patient) => await http().post('/patients').send(patient).expect(201));

    const res = await http().get('/patients?page=2&pageSize=2').expect(200);

    expect(res.body).toEqual(
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

    for (const item of res.body.items) {
      expect(item).toEqual(
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
});
