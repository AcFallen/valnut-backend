import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'User ID to assign role to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsUUID()
  roleId: string;
}