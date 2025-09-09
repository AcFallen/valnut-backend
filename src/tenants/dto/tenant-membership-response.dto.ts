import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MembershipStatus, PaymentStatus } from '../../common/enums';

export class MembershipResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  durationMonths: number;

  @ApiProperty()
  @Expose()
  maxUsers: number;

  @ApiProperty()
  @Expose()
  maxPatients: number;
}

export class PaymentHistoryResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  paymentDate: Date;

  @ApiProperty()
  @Expose()
  paymentMethod: string;

  @ApiProperty({ enum: PaymentStatus })
  @Expose()
  status: PaymentStatus;

  @ApiProperty()
  @Expose()
  transactionReference: string;

  @ApiProperty()
  @Expose()
  notes: string;
}

export class TenantMembershipResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  tenantId: string;

  @ApiProperty()
  @Expose()
  membershipId: string;

  @ApiProperty()
  @Expose()
  startDate: Date;

  @ApiProperty()
  @Expose()
  endDate: Date;

  @ApiProperty({ enum: MembershipStatus })
  @Expose()
  status: MembershipStatus;

  @ApiProperty()
  @Expose()
  amountPaid: number;

  @ApiProperty({ type: MembershipResponseDto })
  @Expose()
  @Type(() => MembershipResponseDto)
  membership: MembershipResponseDto;

  @ApiProperty({ type: [PaymentHistoryResponseDto] })
  @Expose()
  @Type(() => PaymentHistoryResponseDto)
  paymentHistory: PaymentHistoryResponseDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
