import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response already has a success property, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract meta if present
        const meta = data?.meta;
        const responseData = data?.meta ? data.data ?? data : data;

        return {
          success: true,
          message: 'Success',
          data: meta ? responseData : data,
          ...(meta && { meta }),
        };
      }),
    );
  }
}
