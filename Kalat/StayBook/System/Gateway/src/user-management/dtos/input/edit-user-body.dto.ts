import { ApiProperty } from '@nestjs/swagger';

export class EditUserBodyDto {
  @ApiProperty({ type: 'string', required: true, example: 'John' })
  firstName: string;

  @ApiProperty({ type: 'string', required: true, example: 'Doe' })
  lastName: string;

  toMessage(): {
    firstName: string;
    lastName: string;
  } {
    return { ...this };
  }
}
