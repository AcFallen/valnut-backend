import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConsultationType,
  AppointmentStatus,
} from '../entities/appointment.entity';

export class QueryAppointmentsDto {
  @ApiProperty({
    description: 'Filter by appointment date',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({
    description: 'Filter by date range - start date',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by date range - end date',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by consultation type',
    enum: ConsultationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConsultationType)
  consultationType?: ConsultationType;

  @ApiProperty({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Filter by patient ID',
    example: 'uuid-patient-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiProperty({
    description: 'Filter by nutritionist ID',
    example: 'uuid-nutritionist-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  nutritionistId?: string;

  @ApiProperty({
    description: 'Search in notes',
    example: 'dietary',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
