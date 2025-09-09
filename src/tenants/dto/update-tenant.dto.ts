import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';
import { TenantStatus } from '../../common/enums';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiProperty({
    description: 'Tenant status',
    enum: TenantStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiProperty({
    description: 'Tenant expiration date',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: Date;
}
