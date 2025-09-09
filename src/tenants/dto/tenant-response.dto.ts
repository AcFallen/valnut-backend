import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TenantStatus } from '../../common/enums';

export class TenantResponseDto {
  @ApiProperty({ description: 'Tenant ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Tenant name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Tenant email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Tenant phone', required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ description: 'Tenant address', required: false })
  @Expose()
  address?: string;

  @ApiProperty({ description: 'Tenant status', enum: TenantStatus })
  @Expose()
  status: TenantStatus;

  @ApiProperty({ description: 'Tenant expiration date', required: false })
  @Expose()
  expirationDate?: Date;

  @ApiProperty({ description: 'Tenant settings', required: false })
  @Expose()
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  createdBy?: string;

  @Exclude()
  updatedBy?: string;
}
