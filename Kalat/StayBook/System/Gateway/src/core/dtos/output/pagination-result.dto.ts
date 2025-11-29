import { ApiProperty } from '@nestjs/swagger';

export interface PaginationResponseDto<Record> {
  meta: PaginationMetaDto;

  records: Record[];
}

export class PaginationMetaDto {
  @ApiProperty({ type: 'number' })
  offset: number;

  @ApiProperty({ type: 'number' })
  size: number;

  @ApiProperty({ type: 'number' })
  total: number;
}
