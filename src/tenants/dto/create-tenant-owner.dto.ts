import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTenantOwnerDto {
  @ApiProperty({ example: 'Carlos', description: 'Owner first name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'López', description: 'Owner last name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'carlos@drlopez.com',
    description: 'Owner email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
