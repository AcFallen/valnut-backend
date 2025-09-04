import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { PaymentStatus } from '../../common/enums';

export class AssignMembershipDto {
  @ApiProperty({
    description: 'ID of the membership plan to assign',
    example: 'uuid-here',
  })
  @IsUUID()
  membershipId: string;

  @ApiProperty({
    description: 'Start date of the membership',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the membership',
    example: '2024-12-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Amount paid for this membership',
    example: 99.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amountPaid: number;

  @ApiProperty({
    description: 'Payment method used',
    example: 'manual_assignment',
  })
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Payment date',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiProperty({
    description: 'Transaction reference or notes',
    example: 'Manual assignment by system admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Transaction reference ID',
    example: 'MANUAL-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionReference?: string;
}