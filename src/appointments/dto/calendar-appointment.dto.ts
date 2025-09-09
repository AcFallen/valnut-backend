import { ApiProperty } from '@nestjs/swagger';
import {
  ConsultationType,
  AppointmentStatus,
} from '../entities/appointment.entity';

export class CalendarPatientDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'patient_456',
  })
  id: string;

  @ApiProperty({
    description: 'Patient first name',
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Patient email',
    example: 'juan.perez@email.com',
  })
  email: string;
}

export class CalendarNutritionistProfileDto {
  @ApiProperty({
    description: 'Nutritionist first name',
    example: 'María',
  })
  firstName: string;

  @ApiProperty({
    description: 'Nutritionist last name',
    example: 'García',
  })
  lastName: string;
}

export class CalendarNutritionistDto {
  @ApiProperty({
    description: 'Nutritionist ID',
    example: 'nutritionist_789',
  })
  id: string;

  @ApiProperty({
    description: 'Nutritionist profile',
    type: CalendarNutritionistProfileDto,
  })
  profile: CalendarNutritionistProfileDto;
}

export class CalendarAppointmentDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'appointment_123',
  })
  id: string;

  @ApiProperty({
    description: 'Appointment date',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  appointmentDate: string;

  @ApiProperty({
    description: 'Appointment time',
    example: '09:00:00',
    type: 'string',
    format: 'time',
  })
  appointmentTime: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Type of consultation',
    enum: ConsultationType,
    example: ConsultationType.INITIAL,
  })
  consultationType: ConsultationType;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Appointment notes',
    example: 'Primera consulta nutricional',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Patient information',
    type: CalendarPatientDto,
  })
  patient: CalendarPatientDto;

  @ApiProperty({
    description: 'Nutritionist information',
    type: CalendarNutritionistDto,
    nullable: true,
  })
  nutritionist: CalendarNutritionistDto | null;
}

export class CalendarResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Calendar appointments data',
    type: [CalendarAppointmentDto],
  })
  data: CalendarAppointmentDto[];

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Calendar events retrieved successfully',
  })
  message: string;
}