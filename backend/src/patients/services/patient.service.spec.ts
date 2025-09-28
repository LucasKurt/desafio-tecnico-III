import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientService } from './patient.service';

describe('PatientService (unit)', () => {
  let service: PatientService;
  let repo: jest.Mocked<Repository<Patient>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Patient),
          useValue: {
            exists: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(PatientService);
    repo = moduleRef.get(getRepositoryToken(Patient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const dto = {
    name: 'Paciente Teste',
    cpf: '29645684056',
    birthDate: '1990-08-11',
  };

  it('deve criar paciente quando CPF não existe', async () => {
    repo.exists.mockResolvedValue(false);

    const entity: Patient = {
      id: '',
      name: dto.name,
      cpf: dto.cpf,
      birthDate: dto.birthDate,
    };

    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue({
      ...entity,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });

    const out = await service.create(dto);

    expect(repo.exists).toHaveBeenCalledWith({ where: { cpf: dto.cpf } });
    expect(repo.create).toHaveBeenCalledWith({
      name: dto.name,
      birthDate: dto.birthDate,
      cpf: dto.cpf,
    });
    expect(repo.save).toHaveBeenCalled();

    expect(out).toEqual(
      expect.objectContaining({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: dto.name,
        cpf: dto.cpf,
        birthDate: dto.birthDate,
      }),
    );
  });

  it('não deve criar paciente quando CPF existe', async () => {
    repo.exists.mockResolvedValue(true);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('deve listar com paginação padrão', async () => {
    const rows: Patient[] = [
      {
        id: '3f6c2a06-8b0d-4d9a-9236-4f0f1a2d7e8b',
        name: 'Alice',
        cpf: '39053344705',
        birthDate: '1991-01-01',
      },
      {
        id: 'a12e4b9f-2c73-4c16-b6a5-9f3f2e1d4c0a',
        name: 'Bruno',
        cpf: '34661533880',
        birthDate: '1992-02-02',
      },
    ];

    repo.findAndCount.mockResolvedValue([rows, 2]);

    const out = await service.list({});

    expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));

    expect(out).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }),
    );

    for (const it of out.items) {
      expect(it).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          name: expect.any(String),
          cpf: expect.stringMatching(/^\d{11}$/),
          birthDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
        }),
      );
    }
  });

  it('deve listar com paginação (page/pageSize)', async () => {
    const page = 2;
    const pageSize = 2;

    const rows: Patient[] = [
      {
        id: '3f6c2a06-8b0d-4d9a-9236-4f0f1a2d7e8b',
        name: 'Alice',
        cpf: '39053344705',
        birthDate: '1991-01-01',
      },
      {
        id: 'a12e4b9f-2c73-4c16-b6a5-9f3f2e1d4c0a',
        name: 'Bruno',
        cpf: '34661533880',
        birthDate: '1992-02-02',
      },
    ];

    repo.findAndCount.mockResolvedValue([rows, 7]);

    const out = await service.list({ page, pageSize });

    expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 2, take: 2 }));

    expect(out).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: 7,
        page: 2,
        pageSize: 2,
        totalPages: 4,
        hasNext: true,
        hasPrev: true,
      }),
    );

    for (const it of out.items) {
      expect(it).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          name: expect.any(String),
          cpf: expect.stringMatching(/^\d{11}$/),
          birthDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
        }),
      );
    }
  });
});
