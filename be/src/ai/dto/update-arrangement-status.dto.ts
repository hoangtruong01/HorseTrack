import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ArrangementStatus } from '../schemas/ai-race-arrangement-suggestion.schema';

const ALLOWED = [
  ArrangementStatus.APPLIED,
  ArrangementStatus.REJECTED,
] as const;
type AllowedStatus = (typeof ALLOWED)[number];

export class UpdateArrangementStatusDto {
  @ApiProperty({ enum: ALLOWED, example: ArrangementStatus.APPLIED })
  @IsEnum(ALLOWED)
  status!: AllowedStatus;
}
