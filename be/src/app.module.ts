import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HorsesModule } from './horses/horses.module';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { RacesModule } from './races/races.module';
import { RaceResultsModule } from './race-results/race-results.module';
import { RankingsModule } from './rankings/rankings.module';
import { JockeysModule } from './jockeys/jockeys.module';
import { JockeyInvitationsModule } from './jockey-invitations/jockey-invitations.module';
import { RefereeReportsModule } from './referee-reports/referee-reports.module';
import { PrizesModule } from './prizes/prizes.module';
import { BetsModule } from './bets/bets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    HorsesModule,
    TournamentsModule,
    RegistrationsModule,
    RacesModule,
    RaceResultsModule,
    RankingsModule,
    JockeysModule,
    JockeyInvitationsModule,
    RefereeReportsModule,
    PrizesModule,
    BetsModule,
    NotificationsModule,
    DashboardModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
