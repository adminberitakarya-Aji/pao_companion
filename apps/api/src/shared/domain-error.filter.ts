import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { DomainError } from "../../../../core/shared/errors/domain-error";

// Menerjemahkan DomainError (dari core/domain & core/application) jadi
// response HTTP dengan status code yang BENAR (409, 404, 400, dst) —
// sesuai properti `httpStatus` yang sudah didefinisikan tiap error class.
// Tanpa filter ini, semua DomainError akan jatuh ke 500 generic karena
// NestJS tidak tahu cara membaca properti custom di Error biasa.
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.httpStatus).json({
      statusCode: exception.httpStatus,
      error: exception.code,
      message: exception.message,
    });
  }
}
