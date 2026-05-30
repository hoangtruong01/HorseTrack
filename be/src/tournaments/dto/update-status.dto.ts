import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TournamentStatus } from '../schemas/tournament.schema';

export class UpdateStatusDto {
  @ApiProperty({ enum: TournamentStatus })
  @IsNotEmpty()
  @IsEnum(TournamentStatus)
  status!: TournamentStatus;
}
