import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RefereeApprovalStatus } from '../schemas/referee-profile.schema';

export class ListRefereeProfilesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: RefereeApprovalStatus })
  @IsOptional()
  @IsEnum(RefereeApprovalStatus)
  approvalStatus?: RefereeApprovalStatus;
}
