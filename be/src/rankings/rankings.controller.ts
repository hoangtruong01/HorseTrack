import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';

@ApiTags('Rankings')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('tournament/:tournamentId/horses')
  @ApiOperation({ summary: 'Horse rankings for a tournament (public)' })
  getHorseRankings(@Param('tournamentId') tournamentId: string) {
    return this.rankingsService.getHorseRankings(tournamentId);
  }

  @Get('tournament/:tournamentId/jockeys')
  @ApiOperation({ summary: 'Jockey rankings for a tournament (public)' })
  getJockeyRankings(@Param('tournamentId') tournamentId: string) {
    return this.rankingsService.getJockeyRankings(tournamentId);
  }
}
