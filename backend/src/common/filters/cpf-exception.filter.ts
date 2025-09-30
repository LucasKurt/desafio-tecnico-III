import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

type PgErr = { driverError?: { code?: string; constraint?: string } };

@Catch(QueryFailedError)
export class CpfExceptionFilter implements ExceptionFilter {
  catch(exception: PgErr, host: ArgumentsHost) {
    // istanbul ignore next
    if (exception.driverError?.code !== '23505') {
      throw exception;
    }
    const constraint = exception.driverError?.constraint;

    // istanbul ignore next
    if (constraint !== 'UQ_patients_cpf') {
      throw exception;
    }

    const res = host.switchToHttp().getResponse();
    res.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      error: 'Conflict',
      message: 'cpf já cadastrado',
    });
  }
}
