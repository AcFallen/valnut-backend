import {
  IsString,
  IsEmail,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Consultorio Nutricional ABC',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Tenant email',
    example: 'contacto@consultorio.com',
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Tenant phone',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Tenant address',
    example: '123 Main St, City, Country',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Tenant settings (JSON object)',
    example: { timezone: 'America/New_York' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
