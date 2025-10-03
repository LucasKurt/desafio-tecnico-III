import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';

@Component({ template: '<p>Patients Works</p>' })
class PatientsStub {}

// TODO: habilitar quando a rota de diagnostics estiver pronta
// @Component({ template: '<p>Diagnostics Works</p>' })
// class DiagnosticsStub {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        PatientsStub
        // DiagnosticsStub,
      ],
      providers: [
        provideRouter([
          { path: 'patients', component: PatientsStub },
          // { path: 'diagnostics', component: DiagnosticsStub }, // TODO
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

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render toolbar buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('mat-toolbar button'));
    const labels = buttons.map((b) => (b.nativeElement as HTMLButtonElement).textContent?.trim());
    expect(labels).toEqual(['Pacientes', 'Exames']);
  });

  it('buttons should have correct routerLinks', () => {
    const [btnPatients, btnDiagnostics] = fixture.debugElement.queryAll(
      By.css('mat-toolbar button')
    );
    expect(btnPatients.attributes['ng-reflect-router-link']).toBe('patients');
    expect(btnDiagnostics.attributes['ng-reflect-router-link']).toBe('diagnostics');
  });

  // TODO: habilitar depois — depende da rota /diagnostics existir
  // it('should navigate and toggle active class for diagnostics', async () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const router = TestBed.inject(Router);

  //   await router.navigateByUrl('/patients');
  //   fixture.detectChanges();
  //   let [btnPatients, btnDiagnostics] = fixture.debugElement.queryAll(By.css('mat-toolbar button'));
  //   expect(btnPatients.nativeElement.classList).toContain('active');
  //   expect(btnDiagnostics.nativeElement.classList).not.toContain('active');

  //   await router.navigateByUrl('/diagnostics'); // precisa da rota pronta
  //   fixture.detectChanges();

  //   [btnPatients, btnDiagnostics] = fixture.debugElement.queryAll(By.css('mat-toolbar button'));
  //   expect(btnPatients.nativeElement.classList).not.toContain('active');
  //   expect(btnDiagnostics.nativeElement.classList).toContain('active');
  // });

  it('should render routed component in the outlet (patients)', async () => {
    await router.navigateByUrl('/patients');
    expect(fixture.nativeElement.textContent).toContain('Patients Works');
  });

  // TODO: habilitar depois — depende da rota /diagnostics existir
  // it('should render routed component in the outlet (diagnostics)', async () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const router = TestBed.inject(Router);
  //   await router.navigateByUrl('/diagnostics');
  //   fixture.detectChanges();
  //   expect(fixture.nativeElement.textContent).toContain('Diagnostics Works');
  // });
});
