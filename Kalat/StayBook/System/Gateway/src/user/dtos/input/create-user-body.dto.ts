import { ApiProperty } from '@nestjs/swagger';

export class CreateUserBodyDto {
  @ApiProperty({ type: 'string', required: true, example: 'John' })
  firstName: string;

  @ApiProperty({ type: 'string', required: true, example: 'Doe' })
  lastName: string;

  @ApiProperty({
    type: 'string',
    required: true,
    example: 'john.doe@staybook.example',
  })
  email: string;

  toMessage(): {
    firstName: string;
    lastName: string;
    email: string;
  } {
    return { ...this };
  }
}
