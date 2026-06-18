import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { RoleName } from '../users/schemas/user.schema';
import { CreateJockeyProfileDto } from './dto/create-jockey.dto';
import { UpdateJockeyProfileDto } from './dto/update-jockey.dto';
import {
  Jockey,
  JockeyDocument,
  JockeyStatus,
  JockeyApprovalStatus,
} from './schemas/jockey.schema';

type JockeyJson = Jockey & { id: string; totalRaces?: number; wins?: number };

@Injectable()
export class JockeysService {
  constructor(
    @InjectModel(Jockey.name) private jockeyModel: Model<JockeyDocument>,
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

    // 2. Check if placeholder profile exists (auto-created on registration)
    const existing = await this.jockeyModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) {
      // Update the placeholder profile with submitted license data
      Object.assign(existing, dto);
      existing.approvalStatus = JockeyApprovalStatus.PENDING;
      existing.rejectionReason = undefined;
      return existing.save();
    }

    return this.jockeyModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      approvalStatus: JockeyApprovalStatus.PENDING,
    });
  }

  async findAll(page = 1, limit = 20) {
    const filter = {
      status: { $ne: JockeyStatus.UNAVAILABLE },
      approvalStatus: JockeyApprovalStatus.APPROVED,
    };
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

    const data = docs.map((d) => {
      const json = d.toJSON() as unknown as JockeyJson;
      json.totalRaces =
        (d as unknown as { totalRaces?: number }).totalRaces ?? 0;
      json.wins = (d as unknown as { winCount?: number }).winCount ?? 0;
      return json;
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(
    page = 1,
    limit = 20,
    status?: JockeyStatus,
    approvalStatus?: JockeyApprovalStatus,
  ) {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

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

    const data = docs.map((d) => {
      const json = d.toJSON() as unknown as JockeyJson;
      json.totalRaces =
        (d as unknown as { totalRaces?: number }).totalRaces ?? 0;
      json.wins = (d as unknown as { winCount?: number }).winCount ?? 0;
      return json;
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async findDocument(id: string): Promise<JockeyDocument> {
    const jockey = await this.jockeyModel
      .findById(id)
      .populate('userId', 'fullName email phone avatar')
      .exec();
    if (!jockey) {
      throw new NotFoundException('Jockey profile not found');
    }
    return jockey;
  }

  async findByUserId(userId: string): Promise<JockeyJson> {
    const jockey = await this.jockeyModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'fullName email phone avatar')
      .exec();
    if (!jockey) {
      throw new NotFoundException('Jockey profile not found');
    }

    const json = jockey.toJSON() as unknown as JockeyJson;
    json.totalRaces =
      (jockey as unknown as { totalRaces?: number }).totalRaces ?? 0;
    json.wins = (jockey as unknown as { winCount?: number }).winCount ?? 0;
    return json;
  }

  async findOne(id: string): Promise<JockeyJson> {
    const jockey = await this.findDocument(id);

    const json = jockey.toJSON() as unknown as JockeyJson;
    json.totalRaces =
      (jockey as unknown as { totalRaces?: number }).totalRaces ?? 0;
    json.wins = (jockey as unknown as { winCount?: number }).winCount ?? 0;
    return json;
  }

  async update(
    id: string,
    dto: UpdateJockeyProfileDto,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<JockeyDocument> {
    const jockey = await this.findDocument(id);
    const userIdStr = String(
      (jockey.userId as unknown as { _id?: string })?._id ?? jockey.userId,
    );
    if (!isAdmin && userIdStr !== requestingUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    Object.assign(jockey, dto);

    // If jockey updates their own profile, reset approvalStatus to PENDING
    if (!isAdmin) {
      jockey.approvalStatus = JockeyApprovalStatus.PENDING;
      jockey.rejectionReason = undefined;
    }

    return jockey.save();
  }

  async changeApproval(
    id: string,
    approvalStatus: JockeyApprovalStatus,
    rejectionReason?: string,
  ): Promise<JockeyDocument> {
    const jockey = await this.findDocument(id);
    jockey.approvalStatus = approvalStatus;
    if (approvalStatus === JockeyApprovalStatus.REJECTED) {
      jockey.rejectionReason = rejectionReason;
    } else {
      jockey.rejectionReason = undefined;
    }
    return jockey.save();
  }

  async changeStatus(
    id: string,
    status: JockeyStatus,
  ): Promise<JockeyDocument> {
    const jockey = await this.findDocument(id);
    jockey.status = status;
    return jockey.save();
  }
}
