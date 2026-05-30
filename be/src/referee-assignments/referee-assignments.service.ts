import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { RoleName } from '../users/schemas/user.schema';
import { RefereeProfilesService } from '../referee-profiles/referee-profiles.service';
import { RacesService } from '../races/races.service';
import { Race, RaceDocument, RaceStatus } from '../races/schemas/race.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import {
  RespondAssignmentDto,
  RespondStatus,
} from './dto/respond-assignment.dto';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
  RefereeRole,
} from './schemas/referee-assignment.schema';

/** Races within this window (ms) are considered conflicting */
const CONFLICT_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

@Injectable()
export class RefereeAssignmentsService {
  constructor(
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    @InjectModel(Race.name)
    private raceModel: Model<RaceDocument>,
    private usersService: UsersService,
    private refereeProfilesService: RefereeProfilesService,
    private racesService: RacesService,
  ) {}

  async create(
    dto: CreateAssignmentDto,
    assignedBy: string,
  ): Promise<RefereeAssignmentDocument> {
    // 1. Validate user has REFEREE role
    const user = await this.usersService.findById(dto.refereeUserId);
    if (!user.roles.includes(RoleName.REFEREE)) {
      throw new BadRequestException(
        `User ${dto.refereeUserId} does not have REFEREE role`,
      );
    }

    // 2. Validate referee profile exists
    const hasProfile = await this.refereeProfilesService.existsForUser(
      dto.refereeUserId,
    );
    if (!hasProfile) {
      throw new BadRequestException(
        'Referee must create a referee profile before being assigned to a race',
      );
    }

    // 3. Validate race exists
    const race = await this.racesService.findOne(dto.raceId);

    // 4. Check for schedule conflict (another active assignment within 4-hour window)
    const activeAssignments = await this.assignmentModel.find({
      refereeUserId: dto.refereeUserId,
      raceId: { $ne: dto.raceId },
      status: {
        $in: [
          RefereeAssignmentStatus.ASSIGNED,
          RefereeAssignmentStatus.ACCEPTED,
        ],
      },
    });

    if (activeAssignments.length > 0) {
      const conflictRaceIds = activeAssignments.map((a) => a.raceId);
      const windowStart = new Date(
        race.startTime.getTime() - CONFLICT_WINDOW_MS,
      );
      const windowEnd = new Date(race.startTime.getTime() + CONFLICT_WINDOW_MS);

      const conflicting = await this.raceModel.findOne({
        _id: { $in: conflictRaceIds },
        startTime: { $gte: windowStart, $lte: windowEnd },
        status: {
          $nin: [RaceStatus.CANCELLED, RaceStatus.RESULT_PUBLISHED],
        },
      });

      if (conflicting) {
        throw new BadRequestException(
          'Referee already has an active assignment for a race within the same time window',
        );
      }
    }

    // 5. No duplicate (raceId, refereeUserId)
    const existing = await this.assignmentModel.findOne({
      raceId: dto.raceId,
      refereeUserId: dto.refereeUserId,
      status: { $ne: RefereeAssignmentStatus.REMOVED },
    });
    if (existing) {
      throw new ConflictException(
        'This referee is already assigned to this race',
      );
    }

    return this.assignmentModel.create({
      raceId: dto.raceId,
      refereeUserId: dto.refereeUserId,
      assignedBy,
      role: dto.role ?? RefereeRole.MAIN,
    });
  }

  async respond(
    id: string,
    dto: RespondAssignmentDto,
    refereeUserId: string,
  ): Promise<RefereeAssignmentDocument> {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Assignment not found');

    if (String(assignment.refereeUserId) !== refereeUserId) {
      throw new ForbiddenException(
        'You can only respond to your own assignments',
      );
    }

    if (assignment.status !== RefereeAssignmentStatus.ASSIGNED) {
      throw new BadRequestException(
        'Only ASSIGNED assignments can be responded to',
      );
    }

    assignment.status =
      dto.status === RespondStatus.ACCEPTED
        ? RefereeAssignmentStatus.ACCEPTED
        : RefereeAssignmentStatus.DECLINED;

    return assignment.save();
  }

  async removeAssignment(id: string): Promise<RefereeAssignmentDocument> {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Assignment not found');
    assignment.status = RefereeAssignmentStatus.REMOVED;
    return assignment.save();
  }

  async findByRace(raceId: string, page = 1, limit = 20) {
    const filter = { raceId };
    const [data, total] = await Promise.all([
      this.assignmentModel
        .find(filter)
        .populate('refereeUserId', 'fullName email')
        .populate('assignedBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyAssignments(refereeUserId: string, page = 1, limit = 20) {
    const filter = { refereeUserId };
    const [data, total] = await Promise.all([
      this.assignmentModel
        .find(filter)
        .populate('raceId', 'name startTime status')
        .populate('assignedBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.assignmentModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Used by races.service to verify READY precondition */
  async hasAcceptedReferee(raceId: string): Promise<boolean> {
    const assignment = await this.assignmentModel.findOne({
      raceId,
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    return !!assignment;
  }
}
