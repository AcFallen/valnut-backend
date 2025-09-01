import { IsString, IsOptional, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../common/constants';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'Nutricionista' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Role description', 
    example: 'Control total del consultorio y pacientes',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Array of permissions', 
    example: ['user:create', 'patient:read'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  permissions: Permission[];

  @ApiProperty({ 
    description: 'Whether this role grants system admin privileges',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isSystemAdmin?: boolean;

  @ApiProperty({ 
    description: 'Whether this role grants tenant admin privileges',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isTenantAdmin?: boolean;
}