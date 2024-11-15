import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderDirection } from '../base.enum';

export class BaseQueryDto {
  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  offset?: number;

  @ApiProperty({
    description: 'Search by all columns',
    required: false,
  })
  search?: string;

  @ApiProperty({
    description: 'Specify column name for search',
    required: false,
  })
  searchBy?: string;

  @ApiProperty({ required: false, example: '' })
  startDate?: Date;

  @ApiProperty({ required: false, example: '' })
  endDate?: Date;

  @ApiProperty({ required: false, example: '' })
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;

  @ApiProperty({
    description: 'Column for order',
    required: false,
  })
  orderBy?: string;
}
