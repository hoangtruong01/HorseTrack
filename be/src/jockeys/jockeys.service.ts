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
import { CreateJockeyProfileDto } from './dto/create-jockey.dto';
import { UpdateJockeyProfileDto } from './dto/update-jockey.dto';
import { Jockey, JockeyDocument, JockeyStatus } from './schemas/jockey.schema';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';

@Injectable()
export class JockeysService {
  constructor(
    @InjectModel(Jockey.name) private jockeyModel: Model<JockeyDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    private usersService: UsersService,
  ) {}

  async createProfile(
    dto: CreateJockeyProfileDto,
    userId: string,
  ): Promise<JockeyDocument> {
    // 1. Verify user exists and has JOCKEY role
    const user = await this.usersService.findById(userId);
    if (!user.roles.includes(RoleName.JOCKEY)) {
      throw new BadRequestException('User does not have JOCKEY role');
    }

    // 2. Check if profile already exists
    const existing = await this.jockeyModel.findOne({ userId });
    if (existing) {
      throw new ConflictException(
        'Jockey profile already exists for this user',
      );
    }

    return this.jockeyModel.create({
      ...dto,
      userId,
    });
  }

  async findAll(page = 1, limit = 20) {
    const filter = { status: { $ne: JockeyStatus.UNAVAILABLE } };
    const [docs, total] = await Promise.all([
      this.jockeyModel
        .find(filter)
        .populate('userId', 'fullName email phone avatar')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.jockeyModel.countDocuments(filter),
    ]);

    const data = await Promise.all(
      docs.map(async (d) => {
        const json = d.toJSON() as any;
        const userId = d.userId?._id || d.userId;
        const [totalRaces, wins] = await Promise.all([
          this.resultModel.countDocuments({ jockeyUserId: userId, status: RaceResultStatus.PUBLISHED } as any),
          this.resultModel.countDocuments({ jockeyUserId: userId, status: RaceResultStatus.PUBLISHED, rank: 1 } as any),
        ]);
        json.totalRaces = totalRaces;
        json.wins = wins;
        return json;
      }),
    );

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUserId(userId: string): Promise<any> {
    const jockey = await this.jockeyModel
      .findOne({ userId })
      .populate('userId', 'fullName email phone avatar')
      .exec();
    if (!jockey) {
      throw new NotFoundException('Jockey profile not found');
    }

    const [totalRaces, wins] = await Promise.all([
      this.resultModel.countDocuments({ jockeyUserId: userId, status: RaceResultStatus.PUBLISHED } as any),
      this.resultModel.countDocuments({ jockeyUserId: userId, status: RaceResultStatus.PUBLISHED, rank: 1 } as any),
    ]);

    const json = jockey.toJSON() as any;
    json.totalRaces = totalRaces;
    json.wins = wins;
    return json;
  }

  async findOne(id: string): Promise<any> {
    const jockey = await this.jockeyModel
      .findById(id)
      .populate('userId', 'fullName email phone avatar')
      .exec();
    if (!jockey) {
      throw new NotFoundException('Jockey profile not found');
    }

    const userId = jockey.userId?._id || jockey.userId;
    const [totalRaces, wins] = await Promise.all([
      this.resultModel.countDocuments({ jockeyUserId: userId, status: RaceResultStatus.PUBLISHED } as any),
      this.resultModel.countDocuments({ jockeyUserId: userId, status: RaceResultStatus.PUBLISHED, rank: 1 } as any),
    ]);

    const json = jockey.toJSON() as any;
    json.totalRaces = totalRaces;
    json.wins = wins;
    return json;
  }

  async update(
    id: string,
    dto: UpdateJockeyProfileDto,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<JockeyDocument> {
    const jockey = await this.findOne(id);
    if (!isAdmin && String(jockey.userId._id) !== requestingUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    Object.assign(jockey, dto);
    return jockey.save();
  }

  async changeStatus(
    id: string,
    status: JockeyStatus,
  ): Promise<JockeyDocument> {
    const jockey = await this.findOne(id);
    jockey.status = status;
    return jockey.save();
  }
}
