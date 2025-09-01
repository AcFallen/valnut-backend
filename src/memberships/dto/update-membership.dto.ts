import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMembershipDto } from './create-membership.dto';

export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {
  @ApiProperty({ 
    description: 'Whether the membership is active', 
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}