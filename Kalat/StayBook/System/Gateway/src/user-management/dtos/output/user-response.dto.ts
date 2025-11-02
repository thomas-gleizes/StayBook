import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ type: 'string' })
  id: string;

  @ApiProperty({ type: 'string' })
  firstName: string;

  @ApiProperty({ type: 'string' })
  lastName: string;

  @ApiProperty({ type: 'string' })
  email: string;
}
