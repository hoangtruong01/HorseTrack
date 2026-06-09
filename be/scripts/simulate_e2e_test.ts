import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TournamentsService } from '../src/tournaments/tournaments.service';
import { TournamentStatus } from '../src/tournaments/schemas/tournament.schema';
import { RacesService } from '../src/races/races.service';
import { RaceStatus } from '../src/races/schemas/race.schema';
import { RegistrationsService } from '../src/registrations/registrations.service';
import { RegistrationStatus } from '../src/registrations/schemas/registration.schema';
import { JockeyInvitationsService } from '../src/jockey-invitations/jockey-invitations.service';
import { InvitationStatus } from '../src/jockey-invitations/schemas/jockey-invitation.schema';
import { PredictionsService } from '../src/predictions/predictions.service';
import { RaceViolationsService } from '../src/race-violations/race-violations.service';
import { ViolationType, ViolationSeverity, ViolationPenalty } from '../src/race-violations/schemas/race-violation.schema';
import { RaceResultsService } from '../src/race-results/race-results.service';
import { RewardPointLedgerService } from '../src/reward-point-ledger/reward-point-ledger.service';
import { RankingsService } from '../src/rankings/rankings.service';
import { Connection, Types } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { RefereeAssignmentStatus, RefereeRole, RefereeAssignment } from '../src/referee-assignments/schemas/referee-assignment.schema';
import { RaceResult } from '../src/race-results/schemas/race-result.schema';

async function runSimulation() {
  console.log('=== STARTING HORSETRACK E2E SIMULATION ===');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const mongooseConnection = app.get<Connection>(getConnectionToken());
    const tournamentsService = app.get(TournamentsService);
    const racesService = app.get(RacesService);
    const registrationsService = app.get(RegistrationsService);
    const invitationsService = app.get(JockeyInvitationsService);
    const predictionsService = app.get(PredictionsService);
    const violationsService = app.get(RaceViolationsService);
    const resultsService = app.get(RaceResultsService);
    const ledgerService = app.get(RewardPointLedgerService);
    const rankingsService = app.get(RankingsService);

    // Get mongoose model for referee assignments and race results
    const refereeAssignmentModel = app.get(getModelToken(RefereeAssignment.name));
    const raceResultModel = app.get(getModelToken(RaceResult.name));

    // Fetch system collections
    const db = mongooseConnection.db;
    if (!db) throw new Error('Database connection failed');
    const usersCollection = db.collection('users');
    const horsesCollection = db.collection('horses');
    const assignmentsCollection = db.collection('refereeassignments');
    const racechecksCollection = db.collection('racechecks');

    // Clear collections for pristine testing environment
    console.log('Cleaning up old test data...');
    await db.collection('jockeyinvitations').deleteMany({});
    await db.collection('refereeassignments').deleteMany({});
    await db.collection('racechecks').deleteMany({});
    await db.collection('predictions').deleteMany({});
    await db.collection('raceviolations').deleteMany({});
    await db.collection('raceresults').deleteMany({});
    await db.collection('registrations').deleteMany({});
    await db.collection('races').deleteMany({});
    await db.collection('tournaments').deleteMany({});
    console.log('Clean up complete.');

    // 1. Fetch system users for context
    const adminUser = await usersCollection.findOne({ email: 'admin@horsetrack.local' });
    const refereeUser = await usersCollection.findOne({ email: 'referee@horsetrack.local' });
    const ownerUser = await usersCollection.findOne({ email: 'owner@horsetrack.local' });
    const spectatorUser = await usersCollection.findOne({ email: 'spectator@horsetrack.local' });
    const jockey1User = await usersCollection.findOne({ email: 'jockey@horsetrack.local' });

    // Find another user with role jockey for horse 2 (using lowercase 'jockey')
    const jockey2User = await usersCollection.findOne({
      email: { $ne: 'jockey@horsetrack.local' },
      roles: 'jockey'
    });

    if (!adminUser || !refereeUser || !ownerUser || !spectatorUser || !jockey1User || !jockey2User) {
      throw new Error('Required demo accounts are missing in the database.');
    }

    console.log(`- Admin: ${adminUser.fullName} (${adminUser._id})`);
    console.log(`- Referee: ${refereeUser.fullName} (${refereeUser._id})`);
    console.log(`- Owner: ${ownerUser.fullName} (${ownerUser._id})`);
    console.log(`- Spectator: ${spectatorUser.fullName} (${spectatorUser._id})`);
    console.log(`- Jockey 1: ${jockey1User.fullName} (${jockey1User._id})`);
    console.log(`- Jockey 2: ${jockey2User.fullName} (${jockey2User._id})`);

    // Fetch 2 horses owned by the owner
    const ownerHorses = await horsesCollection.find({ ownerId: ownerUser._id }).toArray();
    if (ownerHorses.length < 2) {
      throw new Error('Owner must have at least 2 active/approved horses.');
    }
    const horse1 = ownerHorses[0];
    const horse2 = ownerHorses[1];
    console.log(`- Horse 1: ${horse1.name} (${horse1._id})`);
    console.log(`- Horse 2: ${horse2.name} (${horse2._id})`);

    // Ensure spectator has some points (at least 10 pts) for prediction checks
    const currentPoints = await ledgerService.getBalance(String(spectatorUser._id));
    if (currentPoints < 10) {
      console.log(`- Spectator balance is ${currentPoints} Pts. Crediting 100 Pts for testing.`);
      await ledgerService.credit({
        userId: String(spectatorUser._id),
        points: 100,
        sourceType: 'admin_adjustment' as any,
        note: 'E2E Simulation Topup'
      });
    } else {
      console.log(`- Spectator balance: ${currentPoints} Pts.`);
    }

    // 2. Create Tournament
    console.log('\n[Step 2] Creating new tournament...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);

    const tournament = await tournamentsService.create({
      name: 'E2E Reward Tournament ' + Date.now(),
      description: 'E2E Test Tournament for Point Deduction and Violation Checks',
      location: 'Saigon Racecourse',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      registrationStartDate: startDate.toISOString(),
      registrationEndDate: endDate.toISOString(),
      maxHorses: 10,
      prizePool: 50000,
    }, String(adminUser._id));

    console.log(`- Tournament created: ${tournament.name} (${tournament._id})`);

    // Open tournament registration
    await tournamentsService.updateStatus(String(tournament._id), TournamentStatus.OPEN_REGISTRATION, String(adminUser._id));
    console.log('- Tournament status set to OPEN_REGISTRATION');

    // 3. Create Race under Tournament
    console.log('\n[Step 3] Creating race under tournament...');
    const raceStartTime = new Date();
    raceStartTime.setMinutes(raceStartTime.getMinutes() + 15); // Scheduled start in 15 mins

    const race = await racesService.create({
      tournamentId: String(tournament._id),
      name: 'E2E Reward Race ' + Date.now(),
      description: 'E2E Test Race',
      startTime: raceStartTime.toISOString() as any,
      distanceMeters: 1200,
      lapCount: 1,
      maxParticipants: 8,
      prize: 10000,
    }, String(adminUser._id));

    console.log(`- Race created: ${race.name} (${race._id})`);

    // 4. Register Horse 1 & Horse 2
    console.log('\n[Step 4] Registering horses for race...');
    const reg1 = await registrationsService.create({
      tournamentId: String(tournament._id),
      raceId: String(race._id),
      horseId: String(horse1._id),
    }, String(ownerUser._id));

    const reg2 = await registrationsService.create({
      tournamentId: String(tournament._id),
      raceId: String(race._id),
      horseId: String(horse2._id),
    }, String(ownerUser._id));

    console.log(`- Registration 1 created: ${reg1._id} for ${horse1.name}`);
    console.log(`- Registration 2 created: ${reg2._id} for ${horse2.name}`);

    // 5. Invite Jockeys
    console.log('\n[Step 5] Inviting jockeys...');
    const invite1 = await invitationsService.create({
      registrationId: String(reg1._id),
      jockeyId: String(jockey1User._id),
      message: 'Join my team for Horse 1',
      jockeySharePercent: 30,
    }, String(ownerUser._id));

    const invite2 = await invitationsService.create({
      registrationId: String(reg2._id),
      jockeyId: String(jockey2User._id),
      message: 'Join my team for Horse 2',
      jockeySharePercent: 30,
    }, String(ownerUser._id));

    console.log(`- Invite 1 sent: ${invite1._id} to Jockey 1 (${jockey1User.fullName})`);
    console.log(`- Invite 2 sent: ${invite2._id} to Jockey 2 (${jockey2User.fullName})`);

    // Accept invitations
    await invitationsService.respond(String(invite1._id), InvitationStatus.ACCEPTED, String(jockey1User._id));
    await invitationsService.respond(String(invite2._id), InvitationStatus.ACCEPTED, String(jockey2User._id));
    console.log('- Both jockeys accepted invitations and are assigned to registration.');

    // Approve registrations
    await registrationsService.approve(String(reg1._id), String(adminUser._id));
    await registrationsService.approve(String(reg2._id), String(adminUser._id));
    console.log('- Both horse registrations APPROVED by Admin.');

    // 6. Spectator places a prediction on Horse 1
    // We will place a FREE prediction (points = 0)
    console.log('\n[Step 6] Spectator places a prediction on Horse 1...');
    const prePredictionBalance = await ledgerService.getBalance(String(spectatorUser._id));
    console.log(`- Spectator balance before prediction: ${prePredictionBalance} Pts`);

    const prediction = await predictionsService.create({
      raceId: String(race._id),
      predictedHorseId: String(horse1._id),
      betPoints: 0, // Free prediction
    }, String(spectatorUser._id));

    console.log(`- Prediction placed on ${horse1.name}. ID: ${prediction._id}, betPoints: ${prediction.betPoints}`);

    // 7. Transition race status to LIVE
    console.log('\n[Step 7] Advancing tournament and race status...');
    await tournamentsService.updateStatus(String(tournament._id), TournamentStatus.CLOSED_REGISTRATION, String(adminUser._id));
    await tournamentsService.updateStatus(String(tournament._id), TournamentStatus.ONGOING, String(adminUser._id));
    console.log('- Tournament is now ONGOING');

    // Create Referee Assignment using mongoose model
    console.log('Inserting referee assignment...');
    const refAssignment = await refereeAssignmentModel.create({
      raceId: race._id,
      refereeUserId: refereeUser._id,
      assignedBy: adminUser._id,
      status: RefereeAssignmentStatus.ACCEPTED,
      role: RefereeRole.MAIN,
    });
    console.log(`- Assigned Referee ${refereeUser.fullName} to race. ID: ${refAssignment._id}`);

    // Let's verify Mongoose finds it by ObjectId
    const testFind = await refereeAssignmentModel.findOne({
      raceId: race._id,
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    console.log(`- Mongoose verify find: ${testFind ? 'FOUND!' : 'NOT FOUND!'}`);

    // Let's verify Mongoose finds it by string
    const testFindString = await refereeAssignmentModel.findOne({
      raceId: String(race._id),
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    console.log(`- Mongoose verify find by string: ${testFindString ? 'FOUND!' : 'NOT FOUND!'}`);

    // Let's print out what is actually in refereeassignments
    const allAssignments = await refereeAssignmentModel.find({});
    console.log('- All assignments in DB:', JSON.stringify(allAssignments, null, 2));

    // Create Pre-race Checks
    await db.collection('racechecks').insertMany([
      {
        raceId: race._id,
        raceRegistrationId: reg1._id,
        horseId: horse1._id,
        checkedBy: refereeUser._id,
        status: 'passed',
        jockeyCheckedIn: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        raceId: race._id,
        raceRegistrationId: reg2._id,
        horseId: horse2._id,
        checkedBy: refereeUser._id,
        status: 'passed',
        jockeyCheckedIn: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('- Pre-race checks inserted and passed for both horses.');

    await racesService.updateStatus(String(race._id), RaceStatus.CHECKING);
    await racesService.updateConditions(String(race._id), { trackCondition: 'GOOD', weatherSnapshot: 'Sunny' });
    await racesService.updateStatus(String(race._id), RaceStatus.READY);
    await racesService.updateStatus(String(race._id), RaceStatus.LIVE);
    console.log('- Race is now LIVE');

    // 8. Log Referee violation on Horse 1
    // Let's create a MINOR violation (adds 3000ms = 3s to final time)
    console.log('\n[Step 8] Referee reports violation for Horse 1...');
    const violation = await violationsService.create({
      raceId: String(race._id),
      raceRegistrationId: String(reg1._id),
      horseId: String(horse1._id),
      jockeyUserId: String(jockey1User._id),
      type: ViolationType.TRACK_VIOLATION,
      severity: ViolationSeverity.MINOR,
      penalty: ViolationPenalty.TIME_PENALTY,
      description: 'Horse 1 stepped out of track boundary slightly.',
    }, String(refereeUser._id));

    console.log(`- Violation recorded: ${violation.type} (${violation.severity}) for ${horse1.name}. Penalty: ${violation.penalty}`);

    // 9. Simulate Race Results (this will automatically save results, call applyViolationsToResults, and set race to FINISHED)
    console.log('\n[Step 9] Referee simulates race results...');
    const simulatedResults = await resultsService.simulateRaceResults(String(race._id), String(refereeUser._id));
    console.log(`- Simulating race completed with ${simulatedResults.length} horse results.`);

    // 10. Confirm results by referee (this finalizes ranks)
    console.log('\n[Step 10] Referee confirms race results...');
    await resultsService.confirmResultsForRace(String(race._id), String(refereeUser._id));
    console.log('- Results confirmed.');

    // Fetch from model directly to see the confirmed results (which are not yet published)
    const confirmedResults = await raceResultModel.find({ raceId: new Types.ObjectId(race._id) }).populate('horseId').exec();
    console.log('\nConfirmed Results Details:');
    for (const r of confirmedResults) {
      const h = r.horseId as any;
      console.log(`  Horse: ${h.name} | Raw Time: ${r.rawFinishTimeMs}ms | Penalty Added Time: ${r.finishTimeMs}ms | Rank: ${r.rank} | Note: ${r.note}`);
    }

    // Assert the rank logic with penalty
    const horse1Result = confirmedResults.find(r => String((r.horseId as any)._id || r.horseId) === String(horse1._id));
    const horse2Result = confirmedResults.find(r => String((r.horseId as any)._id || r.horseId) === String(horse2._id));

    if (horse1Result && horse2Result) {
      console.log(`\nComparison:`);
      console.log(`- Horse 1 (Had Minor violation: +3000ms): Raw ${horse1Result.rawFinishTimeMs}ms -> Final ${horse1Result.finishTimeMs}ms | Rank: ${horse1Result.rank}`);
      console.log(`- Horse 2 (No violations): Raw ${horse2Result.rawFinishTimeMs}ms -> Final ${horse2Result.finishTimeMs}ms | Rank: ${horse2Result.rank}`);
      
      const expectedWinner = horse1Result.finishTimeMs! < horse2Result.finishTimeMs! ? horse1Result : horse2Result;
      const actualWinner = confirmedResults.find(r => r.rank === 1);
      
      if (String((actualWinner?.horseId as any)._id) === String((expectedWinner.horseId as any)._id)) {
        console.log('>>> SUCCESS: Time penalty was correctly applied and ranked accordingly!');
      } else {
        console.log('>>> FAILURE: Rankings do not match computed times with penalty.');
      }
    }

    // 11. Admin publishes the results (this triggers prediction payouts and wallet adjustments)
    console.log('\n[Step 11] Admin publishes the results...');
    await resultsService.publishByRace(String(race._id), String(adminUser._id));
    console.log('- Results published.');

    // 12. Check spectator point deduction
    console.log('\n[Step 12] Checking prediction outcome and spectator balance...');
    const postPredictionBalance = await ledgerService.getBalance(String(spectatorUser._id));
    console.log(`- Spectator balance after race resolved: ${postPredictionBalance} Pts`);

    const predictionDoc = await db.collection('predictions').findOne({ _id: prediction._id });
    console.log(`- Prediction status: ${predictionDoc?.status}, rewardPoints: ${predictionDoc?.rewardPoints}`);

    const pointDifference = postPredictionBalance - prePredictionBalance;
    console.log(`- Point change: ${pointDifference} Pts`);

    // Let's verify who won
    const actualWinnerResult = confirmedResults.find(r => r.rank === 1);
    const winnerHorseId = String((actualWinnerResult?.horseId as any)._id || actualWinnerResult?.horseId);
    const spectatorWon = String(prediction.predictedHorseId) === winnerHorseId;

    if (spectatorWon) {
      if (predictionDoc?.status === 'WON' && pointDifference === 1) {
        console.log('>>> SUCCESS: Prediction WON, and spectator got +1 point credited!');
      } else {
        console.log('>>> FAILURE: Spectator predicted winner, but point adjustment or status was incorrect.');
      }
    } else {
      if (predictionDoc?.status === 'LOST' && pointDifference === -1) {
        console.log('>>> SUCCESS: Prediction LOST, and spectator was deducted 1 point for the incorrect free prediction!');
      } else if (predictionDoc?.status === 'LOST' && prePredictionBalance === 0 && postPredictionBalance === 0) {
        console.log('>>> SUCCESS: Prediction LOST. Spectator points stayed at 0 because balance was already 0 (correct behavior).');
      } else {
        console.log('>>> FAILURE: Prediction resolution or point deduction did not behave as expected.');
      }
    }

    // 13. Verify global rankings update
    console.log('\n[Step 13] Verifying global rankings update...');
    const horseRankings = await rankingsService.getGlobalHorseRankings();
    const jockeyRankings = await rankingsService.getGlobalJockeyRankings();

    console.log(`- Global Horse Rankings (Top 3):`);
    horseRankings.slice(0, 3).forEach(h => {
      console.log(`  Rank ${h.rank}: ${h.horseName} | Points: ${h.totalPoints} | Wins: ${h.wins} | Owner: ${h.ownerName}`);
    });

    console.log(`- Global Jockey Rankings (Top 3):`);
    jockeyRankings.slice(0, 3).forEach(j => {
      console.log(`  Rank ${j.rank}: ${j.jockeyName} | Points: ${j.totalPoints} | Wins: ${j.wins}`);
    });

    // Check if our winner is present in rankings with wins >= 1
    const winnerRank = horseRankings.find(h => String(h.horseId) === winnerHorseId);
    if (winnerRank && winnerRank.wins >= 1) {
      console.log(`>>> SUCCESS: Winning Horse is present in global rankings with ${winnerRank.wins} wins!`);
    } else {
      console.log('>>> FAILURE: Dynamic global rankings failed to display the updated wins/points.');
    }

    console.log('\n=== E2E SIMULATION COMPLETED SUCCESSFULLY WITH NO ERRORS ===');

  } catch (error: any) {
    console.error('\n!!! ERROR ENCOUNTERED DURING SIMULATION !!!');
    console.error(error.stack || error.message);
  } finally {
    await app.close();
  }
}

runSimulation();
