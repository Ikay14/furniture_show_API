import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const { method, url } = request;

    return next.handle().pipe(
      map(data => ({
        success: true,
        statusCode: 200,
        message: 'Request successful',
        method,
        path: url,
        timestamp: new Date().toISOString(),
        data,
      }))
    );
  }
}
