import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateRaceCheckDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  raceRegistrationId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  horseId!: string;
}
