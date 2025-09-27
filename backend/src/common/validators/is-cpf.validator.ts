import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function cleanCpf(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}

function isValidCPF(raw: string): boolean {
  const s = cleanCpf(raw);
  if (!/^\d{11}$/.test(s)) return false;
  if (/^(\d)\1{10}$/.test(s)) return false;

  const calc = (len: number) => {
    const sum = Array.from(s.slice(0, len)).reduce((acc, ch, i) => {
      return acc + Number(ch) * (len + 1 - i);
    }, 0);
    return ((sum * 10) % 11) % 10;
  };

  return calc(9) === Number(s[9]) && calc(10) === Number(s[10]);
}

/**
 * Checks if a given value is a real cpf.
 */
export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsCPF',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'cpf inválido',
        ...validationOptions,
      },
      validator: {
        validate(value: string): boolean {
          return isValidCPF(value);
        },
        defaultMessage(args?: ValidationArguments): string {
          const message = validationOptions?.message;

          if (typeof message === 'function') {
            return message(args as ValidationArguments);
          }

          return message ?? `${args?.property ?? 'cpf'} inválido`;
        },
      },
    });
  };
}
