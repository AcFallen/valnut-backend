import {
  IsUUID,
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../../common/enums';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Tenant membership ID' })
  @IsUUID()
  tenantMembershipId: string;

  @ApiProperty({ description: 'Payment amount', example: 29.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Payment date', example: '2024-01-01T12:00:00Z' })
  @IsDateString()
  paymentDate: Date;

  @ApiProperty({ description: 'Payment method', example: 'credit_card' })
  @IsString()
  @MaxLength(100)
  paymentMethod: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    required: false,
    default: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Transaction reference',
    example: 'TXN123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  transactionReference?: string;

  @ApiProperty({
    description: 'Payment notes',
    example: 'Monthly subscription payment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
