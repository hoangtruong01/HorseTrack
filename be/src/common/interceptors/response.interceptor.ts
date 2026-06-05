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

interface WithToJSON {
  toJSON(): unknown;
}

function hasToJSON(val: unknown): val is WithToJSON {
  return (
    val !== null &&
    typeof val === 'object' &&
    'toJSON' in val &&
    typeof (val as WithToJSON).toJSON === 'function'
  );
}

function toPlainObject(val: unknown): unknown {
  if (!val) return val;

  // If it's a Mongoose Document, convert to JSON
  if (hasToJSON(val)) {
    return val.toJSON();
  }

  // If it's an array, map over its elements
  if (Array.isArray(val)) {
    return val.map(toPlainObject);
  }

  // If it's a plain object, recursively map its keys
  if (val && typeof val === 'object' && val.constructor === Object) {
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(val)) {
      res[key] = toPlainObject((val as Record<string, unknown>)[key]);
    }
    return res;
  }

  return val;
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
            const keys = Object.keys(obj);
            const isPlainPaginatedResponse = keys.every((key) =>
              ['data', 'meta'].includes(key),
            );

            if (isPlainPaginatedResponse) {
              meta = obj.meta as Record<string, unknown>;
              responseData = 'data' in obj ? obj.data : obj;
            }
          }
        }

        return {
          success: true,
          message: 'Success',
          data: toPlainObject(responseData) as T,
          ...(meta ? { meta } : {}),
        };
      }),
    );
  }
}
