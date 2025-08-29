import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  error: string;

  @ApiProperty({ example: 400 })
  code: number;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  details?: any;

  constructor(error: string, code = 400, message?: string, details?: any) {
    this.success = false;
    this.error = error;
    this.code = code;
    this.message = message;
    this.details = details;
  }
}