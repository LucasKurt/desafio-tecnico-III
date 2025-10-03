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
import { NetworkErrorMessageComponent } from '../../../../shared/components/network-error-message/network-error-message.component';
import { DiagnosticService } from '../../services/diagnostic.service';
import { Diagnostic } from '../../models/diagnostic.model';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-dianostics',
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
  templateUrl: './list-dianostics.component.html',
  styleUrl: './list-dianostics.component.scss'
})
export class ListDianosticsComponent implements OnInit, AfterViewInit {
  private api = inject(DiagnosticService);

  displayedColumns: string[] = ['patientName', 'modalityLabel'];
  dataSource = new MatTableDataSource<Diagnostic>(RAW_DIAGNOSTICS);

  length = 0;
  pageIndex = 0;
  pageSize = 5;
  loading!: boolean;
  networkError!: boolean;

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.fetchPage();
  }

  ngAfterViewInit(): void {
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
        tap((d) => {
          this.length = d.total;
          this.dataSource.data = d.items;
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
}

const RAW_DIAGNOSTICS: Diagnostic[] = [
  { id: '', patientName: '', modalityLabel: '' },
  { id: '', patientName: '', modalityLabel: '' },
  { id: '', patientName: '', modalityLabel: '' },
  { id: '', patientName: '', modalityLabel: '' },
  { id: '', patientName: '', modalityLabel: '' }
];
