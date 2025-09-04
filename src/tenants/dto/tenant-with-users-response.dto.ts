import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { UserType, TenantStatus } from '../../common/enums';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'Roberto' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Apaza' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'roberto@consultorio.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @Expose()
  phone?: string;
}

export class UserRoleResponseDto {
  @ApiProperty({ example: 'Nutricionista' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'Control total del consultorio y pacientes' })
  @Expose()
  description: string;

  @ApiProperty({ example: true })
  @Expose()
  isTenantAdmin: boolean;
}

export class TenantUserResponseDto {
  @ApiProperty({ example: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'roberto.apaza' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'tenant_owner', enum: UserType })
  @Expose()
  userType: UserType;

  @ApiProperty({ type: UserProfileResponseDto })
  @Expose()
  @Type(() => UserProfileResponseDto)
  profile: UserProfileResponseDto;

  @ApiProperty({ type: [UserRoleResponseDto] })
  @Expose()
  @Type(() => UserRoleResponseDto)
  @Transform(({ obj }) => {
    return obj.userRoles?.map(userRole => ({
      name: userRole.role?.name,
      description: userRole.role?.description,
      isTenantAdmin: userRole.role?.isTenantAdmin
    })) || [];
  })
  roles: UserRoleResponseDto[];
}

export class TenantWithUsersResponseDto {
  @ApiProperty({ example: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Consultorio Nutricional Demo' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'demo@consultorio.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'active', enum: TenantStatus })
  @Expose()
  status: TenantStatus;

  @ApiProperty({ example: '+1234567890', required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @Expose()
  address?: string;

  @ApiProperty({ type: [TenantUserResponseDto] })
  @Expose()
  @Type(() => TenantUserResponseDto)
  users: TenantUserResponseDto[];
}