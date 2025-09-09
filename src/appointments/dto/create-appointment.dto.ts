import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import {
  ConsultationType,
  AppointmentStatus,
} from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Appointment date',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    description: 'Appointment time',
    example: '14:30',
    type: 'string',
    format: 'time',
  })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'appointmentTime must be in HH:MM format (24-hour)',
  })
  appointmentTime: string;

  @ApiProperty({
    description: 'Type of consultation',
    enum: ConsultationType,
    example: ConsultationType.INITIAL,
  })
  @IsEnum(ConsultationType)
  consultationType: ConsultationType;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Additional notes for the appointment',
    example: 'Patient needs dietary assessment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
    minimum: 15,
    maximum: 480,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @ApiProperty({
    description: 'Patient ID',
    example: 'uuid-patient-id',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Nutritionist ID',
    example: 'uuid-nutritionist-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  nutritionistId?: string;
}
