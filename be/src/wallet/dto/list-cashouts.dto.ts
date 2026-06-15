import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListCashoutsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter cashouts by status (e.g. PAID,REJECTED)' })
  @IsOptional()
  @IsString()
  status?: string;
}
