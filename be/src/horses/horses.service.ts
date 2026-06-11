import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import {
  Horse,
  HorseDocument,
  HorseStatus,
  HorseApprovalStatus,
} from './schemas/horse.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';

type HorseJson = Horse & { id: string; totalRaces?: number; wins?: number };

@Injectable()
export class HorsesService {
  constructor(
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
  ) {}

  /** Owner creates a horse – ownerId comes from JWT */
  async create(
    dto: CreateHorseDto,
    ownerId: string,
    imageUrl?: string,
    imageUrls?: string[],
  ): Promise<HorseDocument> {
    const { existingImages, ...rest } = dto;

    let finalImages = imageUrls || [];
    if (existingImages) {
      let parsed: string[] = [];
      try {
        if (typeof existingImages === 'string') {
          const res = JSON.parse(existingImages) as unknown;
          parsed = Array.isArray(res) ? (res as string[]) : [String(res)];
        } else if (Array.isArray(existingImages)) {
          parsed = existingImages;
        } else {
          parsed = [String(existingImages)];
        }
      } catch {
        parsed = Array.isArray(existingImages)
          ? existingImages
          : [String(existingImages)];
      }
      finalImages = [...parsed, ...finalImages];
    }

    const primaryImage =
      imageUrl || (finalImages.length > 0 ? finalImages[0] : undefined);

    return this.horseModel.create({
      ...rest,
      ...(primaryImage && { image: primaryImage }),
      ...(finalImages.length > 0 && { images: finalImages }),
      ownerId: new Types.ObjectId(ownerId),
    });
  }

  private async findDocument(id: string): Promise<HorseDocument> {
    const horse = await this.horseModel
      .findById(id)
      .populate('ownerId', 'fullName email')
      .exec();
    if (!horse || horse.status === HorseStatus.DELETED) {
      throw new NotFoundException('Horse not found');
    }
    return horse;
  }

  /** Admin: list all non-deleted horses with pagination and search */
  async findAll(page = 1, limit = 20, search?: string) {
    const filter: {
      status: { $ne: HorseStatus };
      $or?: Array<{
        name?: { $regex: string; $options: string };
        breed?: { $regex: string; $options: string };
        color?: { $regex: string; $options: string };
        ownerId?: { $in: Types.ObjectId[] };
      }>;
    } = {
      status: { $ne: HorseStatus.DELETED },
    };

    if (search) {
      // Tìm các user có tên khớp với từ khóa search để tìm kiếm theo tên chủ
      const UserModel = this.horseModel.db.model('User');
      const matchedUsers = (await UserModel.find({
        fullName: { $regex: search, $options: 'i' },
      })
        .select('_id')
        .exec()) as Array<{ _id: Types.ObjectId }>;
      const userIds = matchedUsers.map((u) => u._id);

      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { ownerId: { $in: userIds } },
      ];
    }

    const [docs, total] = await Promise.all([
      this.horseModel
        .find(filter)
        .populate('ownerId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.horseModel.countDocuments(filter),
    ]);

    const data = await this.enrichHorsesWithStats(docs);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Owner: list own horses */
  async findMyHorses(ownerId: string, page = 1, limit = 20) {
    const filter = {
      ownerId: new Types.ObjectId(ownerId),
      status: { $ne: HorseStatus.DELETED },
    };
    const [docs, total] = await Promise.all([
      this.horseModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.horseModel.countDocuments(filter),
    ]);

    const data = await this.enrichHorsesWithStats(docs);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get single horse by id */
  async findOne(id: string): Promise<HorseJson> {
    const doc = await this.findDocument(id);
    const [enriched] = await this.enrichHorsesWithStats([doc]);
    return enriched;
  }

  /**
   * Batch-enrich horse docs with totalRaces & wins stats.
   * Uses aggregation pipeline to avoid N+1 query problem.
   */
  private async enrichHorsesWithStats(
    docs: HorseDocument[],
  ): Promise<HorseJson[]> {
    if (docs.length === 0) return [];

    const horseIds = docs.map((d) => d._id);

    // Single aggregation query replaces 2*N individual countDocuments calls
    const statsAgg = await this.resultModel.aggregate<{
      _id: Types.ObjectId;
      totalRaces: number;
      wins: number;
    }>([
      {
        $match: {
          horseId: { $in: horseIds },
          status: RaceResultStatus.PUBLISHED,
        },
      },
      {
        $group: {
          _id: '$horseId',
          totalRaces: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] } },
        },
      },
    ]);

    const statsMap = new Map(statsAgg.map((s) => [String(s._id), s]));

    return docs.map((d) => {
      const json = d.toJSON() as unknown as HorseJson;
      const stats = statsMap.get(String(d._id));
      json.totalRaces = stats?.totalRaces ?? 0;
      json.wins = stats?.wins ?? 0;
      return json;
    });
  }

  /**
   * Fetch raw (unpopulated) horse document for ownership/status checks.
   * ownerId is a raw ObjectId here — String(ObjectId) gives reliable hex string.
   */
  async findRaw(id: string): Promise<HorseDocument> {
    const horse = await this.horseModel.findById(id).exec();
    if (!horse || horse.status === HorseStatus.DELETED) {
      throw new NotFoundException('Horse not found');
    }
    return horse;
  }

  /** Owner updates own horse, admin can update any */
  async update(
    id: string,
    dto: UpdateHorseDto,
    requestingUserId: string,
    isAdmin: boolean,
    imageUrl?: string,
    imageUrls?: string[],
  ): Promise<HorseJson> {
    const horse = await this.findDocument(id);
    const ownerId = String(
      (horse.ownerId as unknown as { _id?: string })?._id ?? horse.ownerId,
    );
    if (!isAdmin && ownerId !== requestingUserId) {
      throw new ForbiddenException('You can only update your own horses');
    }

    // Prevent changing healthStatus while horse has an active approved registration
    if (dto.healthStatus !== undefined) {
      const activeReg = await this.registrationModel.findOne({
        horseId: id,
        status: RegistrationStatus.APPROVED,
      });
      if (activeReg) {
        throw new BadRequestException(
          'Cannot change horse health status while it has an active approved registration',
        );
      }
    }

    const { existingImages, ...rest } = dto;
    let finalImages: string[] | undefined = undefined;
    let primaryImage: string | undefined = undefined;

    if (
      imageUrl !== undefined ||
      imageUrls !== undefined ||
      existingImages !== undefined
    ) {
      finalImages = imageUrls || [];
      if (existingImages) {
        let parsed: string[] = [];
        try {
          if (typeof existingImages === 'string') {
            const res = JSON.parse(existingImages) as unknown;
            parsed = Array.isArray(res) ? (res as string[]) : [String(res)];
          } else if (Array.isArray(existingImages)) {
            parsed = existingImages;
          } else {
            parsed = [String(existingImages)];
          }
        } catch {
          parsed = Array.isArray(existingImages)
            ? existingImages
            : [String(existingImages)];
        }
        finalImages = [...parsed, ...finalImages];
      }
      primaryImage =
        imageUrl || (finalImages.length > 0 ? finalImages[0] : undefined);
    }

    // Nếu không phải là admin và ngựa đã được duyệt
    if (!isAdmin && horse.approvalStatus === HorseApprovalStatus.APPROVED) {
      // Cho phép cập nhật các thuộc tính và cả baseSpeed, staminaScore
      const allowedKeys = [
        'name',
        'age',
        'weightKg',
        'heightCm',
        'healthStatus',
        'description',
        'baseSpeed',
        'staminaScore',
      ] as const;
      const updateData: Record<string, unknown> = {};

      let resetToPending = false;
      for (const key of allowedKeys) {
        const val = rest[key];
        if (val !== undefined) {
          updateData[key] = val;
          if (key === 'baseSpeed' || key === 'staminaScore') {
            resetToPending = true;
          }
        }
      }

      if (primaryImage || finalImages) {
        resetToPending = true;
      }

      Object.assign(horse, updateData);
      if (primaryImage !== undefined) horse.image = primaryImage;
      if (finalImages !== undefined) horse.images = finalImages;

      if (resetToPending) {
        horse.approvalStatus = HorseApprovalStatus.PENDING;
        horse.rejectionReason = undefined;
        horse.rejectedAt = undefined;
        horse.approvedAt = undefined;
      }
    } else {
      // Nếu chưa được duyệt hoặc là Admin
      Object.assign(horse, rest);
      if (primaryImage !== undefined) horse.image = primaryImage;
      if (finalImages !== undefined) horse.images = finalImages;

      // Nếu chủ ngựa sửa ngựa khi đang bị REJECTED, ta reset lại trạng thái duyệt về PENDING
      if (!isAdmin && horse.approvalStatus === HorseApprovalStatus.REJECTED) {
        horse.approvalStatus = HorseApprovalStatus.PENDING;
        horse.rejectionReason = undefined;
        horse.rejectedAt = undefined;
        horse.approvedAt = undefined;
      }
    }

    return (await horse.save()).toJSON() as HorseJson;
  }

  /** Admin: Approve horse */
  async approveHorse(id: string): Promise<HorseJson> {
    const horse = await this.findDocument(id);
    horse.approvalStatus = HorseApprovalStatus.APPROVED;
    horse.approvedAt = new Date();
    horse.status = HorseStatus.ACTIVE;
    return (await horse.save()).toJSON() as HorseJson;
  }

  /** Admin: Reject horse with a reason */
  async rejectHorse(id: string, reason: string): Promise<HorseJson> {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Lý do không duyệt không được để trống');
    }
    const horse = await this.findDocument(id);
    horse.approvalStatus = HorseApprovalStatus.REJECTED;
    horse.rejectionReason = reason;
    horse.rejectedAt = new Date();
    return (await horse.save()).toJSON() as HorseJson;
  }

  /** Soft delete – owner or admin */
  async softDelete(
    id: string,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<void> {
    const horse = await this.findDocument(id);
    const ownerId = String(
      (horse.ownerId as unknown as { _id?: string })?._id ?? horse.ownerId,
    );
    if (!isAdmin && ownerId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own horses');
    }

    // Prevent deleting horse with an active approved registration
    const activeReg = await this.registrationModel.findOne({
      horseId: id,
      status: RegistrationStatus.APPROVED,
    });
    if (activeReg) {
      throw new BadRequestException(
        'Cannot delete a horse with an active approved registration',
      );
    }

    horse.status = HorseStatus.DELETED;
    horse.deletedAt = new Date();
    await horse.save();
  }
}
