import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PatientService } from '../../service/patient-service';
import { CreatePatientComponent } from './create-patient.component';

describe('CreatePatientComponent', () => {
  let component: CreatePatientComponent;
  let fixture: ComponentFixture<CreatePatientComponent>;
  let router: Router;

  const apiMock = { create: jasmine.createSpy('create') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePatientComponent],
      providers: [provideRouter([]), { provide: PatientService, useValue: apiMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePatientComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    apiMock.create.calls.reset();
    fixture.detectChanges();
  });

  it('deve inicializar corretamente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com form inválido e required nos 3 campos', () => {
    expect(component.form.invalid).toBeTrue();

    component.form.markAllAsTouched();
    fixture.detectChanges();

    const name = component.form.get('name')!;
    const cpf = component.form.get('cpf')!;
    const birth = component.form.get('birthDate')!;

    expect(name.hasError('required')).toBeTrue();
    expect(cpf.hasError('required')).toBeTrue();
    expect(birth.hasError('required')).toBeTrue();
  });

  it('não deve chamar API se o form estiver inválido', () => {
    component.save();
    expect(apiMock.create).not.toHaveBeenCalled();
  });

  it('deve montar payload com cpf só dígitos e birthDate em YYYY-MM-DD', () => {
    component.form.setValue({
      name: 'Fulano',
      cpf: '529.982.247-25',
      birthDate: new Date(1990, 0, 10)
    });

    apiMock.create.and.returnValue(of({ id: '1' } as { id: string }));

    component.save();

    expect(apiMock.create).toHaveBeenCalledTimes(1);
    const arg = apiMock.create.calls.mostRecent().args[0];
    expect(arg).toEqual({
      name: 'Fulano',
      cpf: '52998224725',
      birthDate: '1990-01-10'
    });
  });

  it('ao salvar com sucesso deve navegar para "../"', () => {
    component.form.setValue({
      name: 'Fulano',
      cpf: '529.982.247-25',
      birthDate: new Date(1990, 0, 10)
    });

    spyOn(router, 'navigate').and.resolveTo(true);
    apiMock.create.and.returnValue(of({ id: 'abc123' } as { id: string }));

    component.save();

    expect(router.navigate).toHaveBeenCalledWith(['../']);
  });

  it('deve marcar erro "duplicated" no CPF quando backend retornar "cpf já cadastrado"', () => {
    component.form.setValue({
      name: 'Fulano',
      cpf: '529.982.247-25',
      birthDate: new Date(1990, 0, 10)
    });

    const err = new HttpErrorResponse({
      status: 409,
      error: { message: 'cpf já cadastrado' }
    });

    apiMock.create.and.returnValue(throwError(() => err));

    component.save();
    fixture.detectChanges();

    const cpfCtrl = component.form.get('cpf')!;
    expect(cpfCtrl.hasError('duplicated')).toBeTrue();
    expect(cpfCtrl.touched).toBeTrue();
  });
});
