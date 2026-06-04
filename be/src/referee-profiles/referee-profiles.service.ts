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
import { CreateRefereeProfileDto } from './dto/create-referee-profile.dto';
import {
  RefereeProfile,
  RefereeProfileDocument,
  RefereeApprovalStatus,
  RefereeProfileStatus,
} from './schemas/referee-profile.schema';

@Injectable()
export class RefereeProfilesService {
  constructor(
    @InjectModel(RefereeProfile.name)
    private profileModel: Model<RefereeProfileDocument>,
    private usersService: UsersService,
  ) {}

  async createProfile(
    dto: CreateRefereeProfileDto,
    userId: string,
  ): Promise<RefereeProfileDocument> {
    const user = await this.usersService.findById(userId);
    if (!user.roles.includes(RoleName.REFEREE)) {
      throw new BadRequestException('User does not have REFEREE role');
    }

    const existing = await this.profileModel.findOne({ userId });
    if (existing) {
      throw new ConflictException(
        'Referee profile already exists for this user',
      );
    }

    return this.profileModel.create({
      ...dto,
      userId,
      approvalStatus: RefereeApprovalStatus.PENDING,
      status: RefereeProfileStatus.AVAILABLE,
    });
  }

  async findByUserId(userId: string): Promise<RefereeProfileDocument> {
    const profile = await this.profileModel
      .findOne({ userId })
      .populate('userId', 'fullName email phone')
      .exec();
    if (!profile || profile.deletedAt) {
      throw new NotFoundException('Referee profile not found');
    }
    return profile;
  }

  async existsForUser(userId: string): Promise<boolean> {
    const profile = await this.profileModel.findOne({
      userId,
      deletedAt: { $exists: false },
    });
    return !!profile;
  }

  async findAll(page = 1, limit = 20, approvalStatus?: RefereeApprovalStatus) {
    const filter: any = { deletedAt: { $exists: false } };
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }
    const [data, total] = await Promise.all([
      this.profileModel
        .find(filter)
        .populate('userId', 'fullName email phone')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.profileModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<RefereeProfileDocument> {
    const profile = await this.profileModel
      .findById(id)
      .populate('userId', 'fullName email phone')
      .exec();
    if (!profile || profile.deletedAt) {
      throw new NotFoundException('Referee profile not found');
    }
    return profile;
  }

  async update(
    id: string,
    dto: Partial<CreateRefereeProfileDto>,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<RefereeProfileDocument> {
    const profile = await this.findOne(id);
    const profileUserId = String(
      (profile.userId as unknown as { _id?: string })?._id ?? profile.userId,
    );
    if (!isAdmin && profileUserId !== requestingUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    Object.assign(profile, dto);

    // If referee updates their own profile, reset approvalStatus to PENDING
    if (!isAdmin) {
      profile.approvalStatus = RefereeApprovalStatus.PENDING;
      profile.rejectionReason = undefined;
    }

    return profile.save();
  }

  async changeApproval(
    id: string,
    approvalStatus: RefereeApprovalStatus,
    rejectionReason?: string,
  ): Promise<RefereeProfileDocument> {
    const profile = await this.findOne(id);
    profile.approvalStatus = approvalStatus;
    if (approvalStatus === RefereeApprovalStatus.REJECTED) {
      profile.rejectionReason = rejectionReason;
    } else {
      profile.rejectionReason = undefined;
    }
    return profile.save();
  }

  async changeStatus(
    id: string,
    status: RefereeProfileStatus,
  ): Promise<RefereeProfileDocument> {
    const profile = await this.findOne(id);
    profile.status = status;
    return profile.save();
  }
}
