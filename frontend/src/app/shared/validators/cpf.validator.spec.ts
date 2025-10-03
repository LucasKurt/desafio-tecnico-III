import { AbstractControl } from '@angular/forms';
import { cpfValidator } from './cpf.validator';

const ctrl = (value: unknown) => ({ value }) as AbstractControl;

describe('cpfValidator', () => {
  it('deve aceitar CPF válido sem máscara', () => {
    expect(cpfValidator(ctrl('52998224725'))).toBeNull();
  });

  it('deve aceitar CPF válido com máscara', () => {
    expect(cpfValidator(ctrl('111.444.777-35'))).toBeNull();
  });

  it('deve rejeitar CPF com tamanho inválido', () => {
    expect(cpfValidator(ctrl('123'))).toEqual({ cpfInvalid: 'CPF inválido' });
  });

  it('deve rejeitar CPF com todos dígitos iguais', () => {
    expect(cpfValidator(ctrl('000.000.000-00'))).toEqual({ cpfInvalid: 'CPF inválido' });
  });

  it('deve rejeitar CPF com dígitos verificadores incorretos (sem máscara)', () => {
    expect(cpfValidator(ctrl('52998224724'))).toEqual({ cpfInvalid: 'CPF inválido' });
  });

  it('deve rejeitar CPF com dígitos verificadores incorretos (com máscara)', () => {
    expect(cpfValidator(ctrl('111.444.777-34'))).toEqual({ cpfInvalid: 'CPF inválido' });
  });

  it('deve rejeitar vazio como inválido', () => {
    expect(cpfValidator(ctrl(''))).toEqual({ cpfInvalid: 'CPF inválido' });
  });
});
