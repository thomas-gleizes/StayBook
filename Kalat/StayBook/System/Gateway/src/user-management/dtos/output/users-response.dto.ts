import {
  PaginationMetaDto,
  PaginationResponseDto,
} from '../../../shared/dtos/output/pagination-result.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UsersResponseDto
  implements PaginationResponseDto<UserResponseDto>
{
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  @ApiProperty({ type: [UserResponseDto] })
  records: UserResponseDto[];
}
