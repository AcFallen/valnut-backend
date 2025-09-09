import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, Matches } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'New appointment date (YYYY-MM-DD format)',
    example: '2024-01-20',
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  newAppointmentDate: string;

  @ApiProperty({
    description: 'New appointment time (HH:MM format, 24-hour)',
    example: '15:30',
    type: 'string',
    format: 'time',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'newAppointmentTime must be in HH:MM format (24-hour)',
  })
  newAppointmentTime: string;
}