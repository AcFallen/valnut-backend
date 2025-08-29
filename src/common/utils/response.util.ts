import { HttpStatus } from '@nestjs/common';
import { ApiSuccessResponse, ApiErrorResponse } from '../interfaces/api-response.interface';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';

export class ResponseUtil {
  static success<T>(
    data: T,
    code: number = HttpStatus.OK,
    message?: string,
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      code,
      message,
    };
  }

  static error(
    error: string,
    code: number = HttpStatus.BAD_REQUEST,
    message?: string,
    details?: any,
  ): ApiErrorResponse {
    return {
      success: false,
      error,
      code,
      message,
      details,
    };
  }

  static created<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return this.success(data, HttpStatus.CREATED, message);
  }

  static noContent(message?: string): ApiSuccessResponse<null> {
    return this.success(null, HttpStatus.NO_CONTENT, message);
  }

  static notFound(message = 'Resource not found', details?: any): ApiErrorResponse {
    return this.error(message, HttpStatus.NOT_FOUND, undefined, details);
  }

  static unauthorized(message = 'Unauthorized', details?: any): ApiErrorResponse {
    return this.error(message, HttpStatus.UNAUTHORIZED, undefined, details);
  }

  static forbidden(message = 'Forbidden', details?: any): ApiErrorResponse {
    return this.error(message, HttpStatus.FORBIDDEN, undefined, details);
  }

  static validation(message = 'Validation failed', details?: any): ApiErrorResponse {
    return this.error(message, HttpStatus.BAD_REQUEST, undefined, details);
  }

  static internalError(message = 'Internal server error', details?: any): ApiErrorResponse {
    return this.error(message, HttpStatus.INTERNAL_SERVER_ERROR, undefined, details);
  }
}