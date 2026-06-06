import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListAuditLogsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;
}
