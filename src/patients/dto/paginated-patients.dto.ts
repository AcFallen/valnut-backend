import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../entities/patient.entity';

export class PaginatedPatientsDto {
  @ApiProperty({
    description: 'List of patients',
    type: [Patient],
  })
  data: Patient[];

  @ApiProperty({
    description: 'Total number of patients',
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