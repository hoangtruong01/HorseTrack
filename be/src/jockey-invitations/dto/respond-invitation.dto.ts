import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvitationStatus } from '../schemas/jockey-invitation.schema';

export class RespondInvitationDto {
  @ApiProperty({ enum: [InvitationStatus.ACCEPTED, InvitationStatus.REJECTED] })
  @IsNotEmpty()
  @IsEnum([InvitationStatus.ACCEPTED, InvitationStatus.REJECTED])
  status: InvitationStatus;
}
