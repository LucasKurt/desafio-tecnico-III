import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../service/patient-service';
import { NetworkErrorMessageComponent } from '../../../../shared/components/network-error-message/network-error-message.component';

@Component({
  selector: 'app-list-patients',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    NetworkErrorMessageComponent,
    RouterLink
  ],
  templateUrl: './list-patients.component.html',
  styleUrl: './list-patients.component.scss'
})
export class ListPatientsComponent implements OnInit, AfterViewInit {
  private api = inject(PatientService);

  displayedColumns: string[] = ['name', 'cpf', 'birthDate'];
  dataSource = new MatTableDataSource<Patient>(RAW_PATIENTS);

  length = 0;
  pageIndex = 0;
  pageSize = 5;
  loading!: boolean;
  networkError!: boolean;

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.fetchPage();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.fetchPage();
  }

  onRetry() {
    this.fetchPage();
  }

  private fetchPage() {
    this.loading = true;
    this.networkError = false;

    return this.api
      .list({
        page: this.pageIndex + 1,
        pageSize: this.pageSize
      })
      .pipe(
        tap((p) => {
          this.length = p.total;
          this.dataSource.data = p.items.map(({ id, cpf, name, birthDate }) => ({
            id,
            name,
            cpf: this.formatCPF(cpf),
            birthDate: this.formatDate(birthDate)
          }));
        }),
        catchError((err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 0) this.networkError = true;
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  private formatCPF(value?: string): string {
    //istanbul ignore next
    if (!value) return '';
    return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
  }

  private formatDate(value?: string | null): string {
    //istanbul ignore next
    if (!value) return '';
    return new Date(value + 'T00:00:00').toLocaleDateString();
  }
}

const RAW_PATIENTS: Patient[] = [
  { id: '', name: '', birthDate: '', cpf: '' },
  { id: '', name: '', birthDate: '', cpf: '' },
  { id: '', name: '', birthDate: '', cpf: '' },
  { id: '', name: '', birthDate: '', cpf: '' },
  { id: '', name: '', birthDate: '', cpf: '' }
];
