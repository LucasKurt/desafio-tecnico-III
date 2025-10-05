import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListDianosticsComponent } from './list-dianostics.component';
import { provideRouter } from '@angular/router';
import { DiagnosticService } from '../../services/diagnostic.service';
import { of, throwError } from 'rxjs';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NetworkErrorMessageComponent } from '../../../../shared/components/network-error-message/network-error-message.component';
import { By } from '@angular/platform-browser';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('ListDianosticsComponent', () => {
  let component: ListDianosticsComponent;
  let fixture: ComponentFixture<ListDianosticsComponent>;

  const diagnosticsSvcMock = {
    list: jasmine.createSpy('list')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDianosticsComponent],
      providers: [provideRouter([]), { provide: DiagnosticService, useValue: diagnosticsSvcMock }]
    }).compileComponents();

    diagnosticsSvcMock.list.and.returnValue(
      of({
        items: [{ id: '1', patientName: 'Ana', modalityLabel: 'Ressonância Magnética (RM)' }],
        total: 1,
        page: 1,
        pageSize: 5,
        totalPages: 1
      })
    );

    fixture = TestBed.createComponent(ListDianosticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar corretamente', () => {
    expect(component).toBeTruthy();

    expect(diagnosticsSvcMock.list).toHaveBeenCalledWith({ page: 1, pageSize: 5 });

    expect(component.length).toBe(1);
    expect(component.pageSize).toBe(5);
    expect(component.pageIndex).toBe(0);
    expect(component.loading).toBeFalse();
    expect(component.networkError).toBeFalse();

    expect(component.dataSource.data[0]).toEqual({
      id: '1',
      patientName: 'Ana',
      modalityLabel: 'Ressonância Magnética (RM)'
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

    expect(diagnosticsSvcMock.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(onPageSpy).toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro quando ocorrer erro de rede', () => {
    diagnosticsSvcMock.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
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
