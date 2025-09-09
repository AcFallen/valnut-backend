import { IsUUID, IsDateString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTenantMembershipDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Membership ID' })
  @IsUUID()
  membershipId: string;

  @ApiProperty({
    description: 'Membership start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'Membership end date',
    example: '2024-01-31T23:59:59Z',
  })
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: 'Amount paid for this membership',
    example: 29.99,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amountPaid: number;
}
