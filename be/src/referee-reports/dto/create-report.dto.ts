import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportType } from '../schemas/referee-report.schema';

export class CreateRefereeReportDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  raceId: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  horseId: string;

  @ApiPropertyOptional({ enum: ReportType, default: ReportType.POST_RACE })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ example: 'Horse did not follow designated path' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Lane crossing' })
  @IsOptional()
  @IsString()
  violation?: string;

  @ApiPropertyOptional({ example: 'Disqualification' })
  @IsOptional()
  @IsString()
  penalty?: string;
}
