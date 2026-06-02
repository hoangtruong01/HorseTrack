import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const obj = exResponse as Record<string, unknown>;
        const raw = obj.message ?? exception.message;
        message = Array.isArray(raw)
          ? raw.join('; ')
          : typeof raw === 'object' && raw !== null
            ? JSON.stringify(raw)
            : // eslint-disable-next-line @typescript-eslint/no-base-to-string
              String(raw);
      }
    } else if (exception instanceof Error) {
      console.error('AllExceptionsFilter caught exception:', exception);
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
    });
  }
}
