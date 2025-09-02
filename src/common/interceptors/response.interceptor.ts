import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        
        // Si ya es una respuesta estructurada (tiene success), no la modificamos
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        
        // Obtener el status code actual
        const statusCode = response.statusCode || HttpStatus.OK;
        
        // Generar mensaje automático basado en el método HTTP
        const request = ctx.getRequest();
        const method = request.method;
        let defaultMessage = 'Operation successful';
        
        switch (method) {
          case 'POST':
            defaultMessage = 'Resource created successfully';
            break;
          case 'PUT':
          case 'PATCH':
            defaultMessage = 'Resource updated successfully';
            break;
          case 'DELETE':
            defaultMessage = 'Resource deleted successfully';
            break;
          case 'GET':
            defaultMessage = 'Resource retrieved successfully';
            break;
        }

        return {
          success: true,
          data: data,
          code: statusCode,
          message: defaultMessage,
        };
      }),
    );
  }
}