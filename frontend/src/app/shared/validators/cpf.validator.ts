import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const v = (control.value ?? '') as string;
  const cpf = v.replace(/\D/g, '');
  if (cpf.length !== 11) return { cpfInvalid: 'CPF inválido' };
  if (/^(\d)\1{10}$/.test(cpf)) return { cpfInvalid: 'CPF inválido' };

  const calc = (base: string, factor: number) =>
    base.split('').reduce((sum, n) => sum + Number(n) * factor--, 0);

  const d1 = ((calc(cpf.slice(0, 9), 10) * 10) % 11) % 10;
  const d2 = ((calc(cpf.slice(0, 10), 11) * 10) % 11) % 10;

  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]) ? null : { cpfInvalid: 'CPF inválido' };
};
