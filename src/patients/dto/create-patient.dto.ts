import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient first name',
    example: 'Juan',
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'Patient email address',
    example: 'juan.perez@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Patient phone number',
    example: '+1234567890',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Patient date of birth',
    example: '1990-01-15',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Patient gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @ApiProperty({
    description: 'Patient address',
    example: '123 Main St, City, Country',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({
    description: 'Patient medical history',
    example: 'Hypertension, diabetes type 2',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  medicalHistory?: string;

  @ApiProperty({
    description: 'Patient allergies',
    example: 'Penicillin, peanuts',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  allergies?: string;

  @ApiProperty({
    description: 'Additional notes about the patient',
    example: 'Patient prefers morning appointments',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
