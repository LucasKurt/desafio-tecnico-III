import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';

@Component({ template: '<p>Patients Works</p>' })
class PatientsStub {}

@Component({ template: '<p>Diagnostics Works</p>' })
class DiagnosticsStub {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, PatientsStub, DiagnosticsStub],
      providers: [
        provideRouter([
          { path: 'patients', component: PatientsStub },
          { path: 'diagnostics', component: DiagnosticsStub },
          { path: '', redirectTo: 'patients', pathMatch: 'full' }
        ]),
        provideLocationMocks()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('deve criar o app', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar a barra de navegação', () => {
    const buttons = fixture.debugElement.queryAll(By.css('mat-toolbar button'));
    const labels = buttons.map((b) => (b.nativeElement as HTMLButtonElement).textContent?.trim());
    expect(labels).toEqual(['Pacientes', 'Exames']);
  });

  it('deve conter os botões com as rotas corretas', () => {
    const [btnPatients, btnDiagnostics] = fixture.debugElement.queryAll(
      By.css('mat-toolbar button')
    );
    expect(btnPatients.attributes['ng-reflect-router-link']).toBe('patients');
    expect(btnDiagnostics.attributes['ng-reflect-router-link']).toBe('diagnostics');
  });

  it('deve navegar para a rota de paciente ou exames como a classe active ativa', async () => {
    await router.navigateByUrl('/patients');
    fixture.detectChanges();
    let [btnPatients, btnDiagnostics] = fixture.debugElement.queryAll(By.css('mat-toolbar button'));
    expect(btnPatients.nativeElement.classList).toContain('active');
    expect(btnDiagnostics.nativeElement.classList).not.toContain('active');

    await router.navigateByUrl('/diagnostics');
    fixture.detectChanges();

    [btnPatients, btnDiagnostics] = fixture.debugElement.queryAll(By.css('mat-toolbar button'));
    expect(btnPatients.nativeElement.classList).not.toContain('active');
    expect(btnDiagnostics.nativeElement.classList).toContain('active');
  });

  it('deve exibir o componente patients na pagina corretamente', async () => {
    await router.navigateByUrl('/patients');
    expect(fixture.nativeElement.textContent).toContain('Patients Works');
  });

  it('deve exibir o componente patients na pagina corretamente', async () => {
    await router.navigateByUrl('/diagnostics');
    expect(fixture.nativeElement.textContent).toContain('Diagnostics Works');
  });
});
