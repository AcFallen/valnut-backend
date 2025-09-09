import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class QueryCalendarDto {
  @ApiProperty({
    description: 'Start date of the range (YYYY-MM-DD format)',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiProperty({
    description: 'End date of the range (YYYY-MM-DD format)',
    example: '2024-01-31',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end?: string;

  @ApiProperty({
    description: 'Filter by nutritionist ID',
    example: 'uuid-nutritionist-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  nutritionistId?: string;

  @ApiProperty({
    description: 'Filter by patient ID',
    example: 'uuid-patient-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;
}