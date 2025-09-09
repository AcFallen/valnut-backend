import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '../entities/appointment.entity';

export class PaginatedAppointmentsDto {
  @ApiProperty({
    description: 'Array of appointments',
    type: [Appointment],
  })
  data: Appointment[];

  @ApiProperty({
    description: 'Total number of appointments',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}
