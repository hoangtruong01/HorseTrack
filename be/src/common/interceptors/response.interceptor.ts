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
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: unknown): ApiResponse<T> => {
        // If the response already has a success property, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as unknown as ApiResponse<T>;
        }

        // Extract meta if present
        let meta: Record<string, unknown> | undefined;
        let responseData: unknown = data;

        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>;
          if ('meta' in obj && obj.meta && typeof obj.meta === 'object') {
            meta = obj.meta as Record<string, unknown>;
            responseData = 'data' in obj ? obj.data : obj;
          }
        }

        return {
          success: true,
          message: 'Success',
          data: responseData as T,
          ...(meta ? { meta } : {}),
        };
      }),
    );
  }
}
