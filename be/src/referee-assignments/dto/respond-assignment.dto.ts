import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RespondStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export class RespondAssignmentDto {
  @ApiProperty({ enum: RespondStatus })
  @IsNotEmpty()
  @IsEnum(RespondStatus)
  status!: RespondStatus;
}
