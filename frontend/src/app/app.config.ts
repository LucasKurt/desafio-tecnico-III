import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const PT_BR_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy'
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS }
  ]
};
