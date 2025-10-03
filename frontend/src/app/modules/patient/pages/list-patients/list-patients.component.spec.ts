import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NetworkErrorMessageComponent } from '../../../../shared/components/network-error-message/network-error-message.component';
import { PatientService } from '../../service/patient-service';
import { ListPatientsComponent } from './list-patients.component';

describe('ListPatientsComponent', () => {
  let component: ListPatientsComponent;
  let fixture: ComponentFixture<ListPatientsComponent>;

  const patientSvcMock = {
    list: jasmine.createSpy('list')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPatientsComponent],
      providers: [provideRouter([]), { provide: PatientService, useValue: patientSvcMock }]
    }).compileComponents();

    patientSvcMock.list.and.returnValue(
      of({
        items: [{ id: '1', name: 'Ana', cpf: '12345678901', birthDate: '1990-01-10' }],
        total: 1,
        page: 1,
        pageSize: 5,
        totalPages: 1
      })
    );

    fixture = TestBed.createComponent(ListPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar corretamente', () => {
    expect(component).toBeTruthy();

    expect(patientSvcMock.list).toHaveBeenCalledWith({ page: 1, pageSize: 5 });

    expect(component.length).toBe(1);
    expect(component.pageSize).toBe(5);
    expect(component.pageIndex).toBe(0);
    expect(component.loading).toBeFalse();
    expect(component.networkError).toBeFalse();

    expect(component.dataSource.data[0]).toEqual({
      id: '1',
      name: 'Ana',
      cpf: '123.456.789-01',
      birthDate: '10/01/1990'
    });
  });

  it('deve renderizar spinner quando loading = true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('deve ter paginação', async () => {
    const onPageSpy = spyOn(component, 'onPage').and.callThrough();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const paginator = await loader.getHarness(MatPaginatorHarness);

    await paginator.setPageSize(20);
    await paginator.goToNextPage();
    fixture.detectChanges();

    expect(patientSvcMock.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(onPageSpy).toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro quando ocorrer erro de rede', () => {
    patientSvcMock.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.onRetry();
    fixture.detectChanges();
    expect(component.networkError).toBeTrue();

    const errCmp = fixture.debugElement.query(By.directive(NetworkErrorMessageComponent));
    expect(errCmp).toBeTruthy();
  });

  it('deve clicar em "Tentar novamente" e chamar onRetry', waitForAsync(async () => {
    component.networkError = true;
    fixture.detectChanges();

    const onRetrySpy = spyOn(component, 'onRetry').and.callThrough();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const retryBtn = await loader.getHarness(MatButtonHarness.with({ text: /tentar novamente/i }));

    await retryBtn.click();
    fixture.detectChanges();

    expect(onRetrySpy).toHaveBeenCalledTimes(1);
  }));
});
