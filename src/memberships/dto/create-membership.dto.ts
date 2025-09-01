import { IsString, IsOptional, IsNumber, IsPositive, IsInt, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMembershipDto {
  @ApiProperty({ description: 'Membership name', example: 'Plan Básico' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Membership description', 
    example: 'Plan básico para consultorios pequeños',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Membership price', example: 29.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Duration in months', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  durationMonths: number;

  @ApiProperty({ description: 'Maximum number of users', example: 5 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxUsers: number;

  @ApiProperty({ description: 'Maximum number of patients', example: 100 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxPatients: number;

  @ApiProperty({ 
    description: 'Membership features (JSON object)', 
    example: { reports: true, exportData: false },
    required: false 
  })
  @IsOptional()
  @IsObject()
  features?: Record<string, any>;
}