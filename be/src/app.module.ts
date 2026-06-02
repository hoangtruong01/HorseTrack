import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuthModule } from './auth/auth.module';
import { BankTransactionsModule } from './bank-transactions/bank-transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HorsesModule } from './horses/horses.module';
import { JockeyInvitationsModule } from './jockey-invitations/jockey-invitations.module';
import { JockeysModule } from './jockeys/jockeys.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PredictionsModule } from './predictions/predictions.module';
import { PrizesModule } from './prizes/prizes.module';
import { RaceChecksModule } from './race-checks/race-checks.module';
import { RaceRecordsModule } from './race-records/race-records.module';
import { RaceResultsModule } from './race-results/race-results.module';
import { RaceViolationsModule } from './race-violations/race-violations.module';
import { RacesModule } from './races/races.module';
import { RankingsModule } from './rankings/rankings.module';
import { RefereeAssignmentsModule } from './referee-assignments/referee-assignments.module';
import { RefereeProfilesModule } from './referee-profiles/referee-profiles.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { RewardPointLedgerModule } from './reward-point-ledger/reward-point-ledger.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { RefereeReportsModule } from './referee-reports/referee-reports.module';

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
    PrizesModule,
    PredictionsModule,
    WalletModule,
    AiModule,
    RaceRecordsModule,
    NotificationsModule,
    DashboardModule,
    UploadsModule,
    AuditLogsModule,
    RefereeProfilesModule,
    RefereeAssignmentsModule,
    RaceChecksModule,
    RaceViolationsModule,
    RewardPointLedgerModule,
    BankTransactionsModule,
    RefereeReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
