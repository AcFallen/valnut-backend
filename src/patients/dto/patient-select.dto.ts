import { ApiProperty } from '@nestjs/swagger';

export class PatientSelectDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'uuid-patient-id',
  })
  id: string;

  @ApiProperty({
    description: 'Patient full name',
    example: 'María González',
  })
  name: string;
}