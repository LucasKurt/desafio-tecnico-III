import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { PatientService } from '../../../patient/service/patient-service';
import { ImagingModality } from '../../models/diagnostic.model';
import { DiagnosticService } from '../../services/diagnostic.service';
import { CreateDiagnosticComponent } from './create-diagnostic.component';

describe('CreateDiagnosticComponent', () => {
  let component: CreateDiagnosticComponent;
  let fixture: ComponentFixture<CreateDiagnosticComponent>;
  let router: Router;
  let loader: HarnessLoader;
  let docLoader: HarnessLoader;

  const diagnosticApiMock = { create: jasmine.createSpy('create') };

  const ALL = [
    { id: 'p1', name: 'Ana Paula', birthDate: '1990-01-10', cpf: '...' },
    { id: 'p2', name: 'Bruno Silva', birthDate: '1988-06-03', cpf: '...' },
    { id: 'p3', name: 'Carlos Souza', birthDate: '1979-09-21', cpf: '...' }
  ];
  const patientApiMock = {
    list: jasmine.createSpy('list').and.callFake(({ name }: { name?: string }) => {
      const items = name
        ? ALL.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()))
        : ALL;
      return of({ items, page: 1, pageSize: 10, total: items.length });
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDiagnosticComponent],
      providers: [
        provideRouter([]),
        { provide: DiagnosticService, useValue: diagnosticApiMock },
        { provide: PatientService, useValue: patientApiMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateDiagnosticComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    docLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    diagnosticApiMock.create.calls.reset();
    fixture.detectChanges();
  });

  it('deve inicializar corretamente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com form inválido e required nos 3 campos', () => {
    expect(component.form.invalid).toBeTrue();

    component.form.markAllAsTouched();
    fixture.detectChanges();

    const patient = component.form.get('patient')!;
    const patientId = component.form.get('patientId')!;
    const modality = component.form.get('modality')!;

    expect(patient.hasError('required')).toBeTrue();
    expect(patientId.hasError('required')).toBeTrue();
    expect(modality.hasError('required')).toBeTrue();
  });

  it('não deve chamar API se o form estiver inválido', () => {
    component.save();
    expect(diagnosticApiMock.create).not.toHaveBeenCalled();
  });

  it('deve criar um novo exame quando os dados estiverem corretos', () => {
    const patientId = 'dac8acce-c9c2-4ddf-96a9-8f0fa11dd6bb';
    component.form.setValue({
      patient: {
        id: patientId,
        name: 'Ana',
        cpf: '12345678901',
        birthDate: '1990-01-10'
      },
      patientId,
      modality: ImagingModality.MR
    });

    diagnosticApiMock.create.and.returnValue(
      of({
        id: '9a186d40-f70e-4389-9386-e425b6d0195e',
        patientName: 'Ana',
        modalityLabel: 'Ressonância Magnética (MR)'
      })
    );

    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.save();

    expect(diagnosticApiMock.create).toHaveBeenCalledTimes(1);
    const payload = diagnosticApiMock.create.calls.mostRecent().args[0];
    expect(payload).toEqual({
      patientId,
      modality: ImagingModality.MR
    });

    expect(navigateSpy).toHaveBeenCalled();
  });

  it('deve mostrar a lista de pacientes reativa no auto completar', async () => {
    const input = await loader.getHarness(
      MatInputHarness.with({ selector: 'input[formControlName="patient"]' })
    );

    await input.focus();
    await input.setValue('an');

    const ac = await docLoader.getHarness(MatAutocompleteHarness);
    expect(await ac.isOpen()).toBeTrue();

    const options = await ac.getOptions();
    const texts = await Promise.all(options.map((o) => o.getText()));

    expect(texts).toContain('Ana Paula');
    expect(texts.some((t) => t.includes('Bruno'))).toBeFalse();
  });
});
