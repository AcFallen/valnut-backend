export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code: number;
}

export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error?: string;
  details?: any;
}