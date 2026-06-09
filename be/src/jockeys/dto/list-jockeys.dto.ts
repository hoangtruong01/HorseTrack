import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JockeyStatus } from '../schemas/jockey.schema';

export class ListJockeysDto extends PaginationDto {
  @ApiPropertyOptional({ enum: JockeyStatus })
  @IsOptional()
  @IsEnum(JockeyStatus)
  status?: JockeyStatus;
}
