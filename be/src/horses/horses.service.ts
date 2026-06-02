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
import { Horse, HorseDocument, HorseStatus, HorseApprovalStatus } from './schemas/horse.schema';
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
  ): Promise<HorseDocument> {
    return this.horseModel.create({
      ...dto,
      ...(imageUrl && { image: imageUrl }),
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
    // Tự động dọn dẹp các ngựa bị từ chối quá 24h
    await this.horseModel.deleteMany({
      approvalStatus: HorseApprovalStatus.REJECTED,
      rejectedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const filter: any = { status: { $ne: HorseStatus.DELETED } };
    
    if (search) {
      // Tìm các user có tên khớp với từ khóa search để tìm kiếm theo tên chủ
      const UserModel = this.horseModel.db.model('User');
      const matchedUsers = await UserModel.find({
        fullName: { $regex: search, $options: 'i' },
      }).select('_id').exec();
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

    const data = await Promise.all(
      docs.map(async (d) => {
        const json = d.toJSON() as unknown as HorseJson;
        const [totalRaces, wins] = await Promise.all([
          this.resultModel.countDocuments({
            horseId: d._id,
            status: RaceResultStatus.PUBLISHED,
          }),
          this.resultModel.countDocuments({
            horseId: d._id,
            status: RaceResultStatus.PUBLISHED,
            rank: 1,
          }),
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

  /** Owner: list own horses */
  async findMyHorses(ownerId: string, page = 1, limit = 20) {
    // Tự động dọn dẹp các ngựa bị từ chối quá 24h
    await this.horseModel.deleteMany({
      approvalStatus: HorseApprovalStatus.REJECTED,
      rejectedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const filter = { ownerId: new Types.ObjectId(ownerId), status: { $ne: HorseStatus.DELETED } };
    const [docs, total] = await Promise.all([
      this.horseModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.horseModel.countDocuments(filter),
    ]);

    const data = await Promise.all(
      docs.map(async (d) => {
        const json = d.toJSON() as unknown as HorseJson;
        const [totalRaces, wins] = await Promise.all([
          this.resultModel.countDocuments({
            horseId: d._id,
            status: RaceResultStatus.PUBLISHED,
          }),
          this.resultModel.countDocuments({
            horseId: d._id,
            status: RaceResultStatus.PUBLISHED,
            rank: 1,
          }),
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

  /** Get single horse by id */
  async findOne(id: string): Promise<HorseJson> {
    const doc = await this.findDocument(id);
    const json = doc.toJSON() as unknown as HorseJson;
    const [totalRaces, wins] = await Promise.all([
      this.resultModel.countDocuments({
        horseId: new Types.ObjectId(id),
        status: RaceResultStatus.PUBLISHED,
      }),
      this.resultModel.countDocuments({
        horseId: new Types.ObjectId(id),
        status: RaceResultStatus.PUBLISHED,
        rank: 1,
      }),
    ]);
    json.totalRaces = totalRaces;
    json.wins = wins;
    return json;
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

    // Nếu không phải là admin và ngựa đã được duyệt
    if (!isAdmin && horse.approvalStatus === HorseApprovalStatus.APPROVED) {
      // Chỉ cho phép cập nhật: name, age, weightKg, heightCm, healthStatus, description
      const allowedKeys = ['name', 'age', 'weightKg', 'heightCm', 'healthStatus', 'description'];
      const updateData: Partial<UpdateHorseDto> = {};
      
      for (const key of allowedKeys) {
        if (dto[key as keyof UpdateHorseDto] !== undefined) {
          (updateData as any)[key] = dto[key as keyof UpdateHorseDto];
        }
      }
      
      Object.assign(horse, updateData);
      // Giữ nguyên approvalStatus là APPROVED, không cần admin duyệt lại
    } else {
      // Nếu chưa được duyệt hoặc là Admin
      Object.assign(horse, dto);
      if (imageUrl) horse.image = imageUrl;
      
      // Nếu chủ ngựa sửa ngựa khi đang bị REJECTED, ta reset lại trạng thái duyệt về PENDING
      if (!isAdmin && horse.approvalStatus === HorseApprovalStatus.REJECTED) {
        horse.approvalStatus = HorseApprovalStatus.PENDING;
        horse.rejectionReason = undefined;
        horse.rejectedAt = undefined;
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
