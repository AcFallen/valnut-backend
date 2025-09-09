import { ApiProperty } from '@nestjs/swagger';

export class UserSelectDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid-user-id',
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Dr. Juan Pérez',
  })
  name: string;
}