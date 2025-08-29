import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ required: false })
  message?: string;

  constructor(data: T, code = 200, message?: string) {
    this.success = true;
    this.data = data;
    this.code = code;
    this.message = message;
  }
}