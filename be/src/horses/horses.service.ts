import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { Horse, HorseDocument, HorseStatus } from './schemas/horse.schema';

@Injectable()
export class HorsesService {
  constructor(
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
  ) {}

  /** Owner creates a horse – ownerId comes from JWT */
  async create(dto: CreateHorseDto, ownerId: string): Promise<HorseDocument> {
    return this.horseModel.create({ ...dto, ownerId });
  }

  /** Admin: list all non-deleted horses with pagination */
  async findAll(page = 1, limit = 20) {
    const filter = { status: { $ne: HorseStatus.DELETED } };
    const [data, total] = await Promise.all([
      this.horseModel
        .find(filter)
        .populate('ownerId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.horseModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Owner: list own horses */
  async findMyHorses(ownerId: string, page = 1, limit = 20) {
    const filter = { ownerId, status: { $ne: HorseStatus.DELETED } };
    const [data, total] = await Promise.all([
      this.horseModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.horseModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get single horse by id */
  async findOne(id: string): Promise<HorseDocument> {
    const horse = await this.horseModel
      .findById(id)
      .populate('ownerId', 'fullName email')
      .exec();
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
  ): Promise<HorseDocument> {
    const horse = await this.findOne(id);
    if (!isAdmin && String(horse.ownerId) !== requestingUserId) {
      throw new ForbiddenException('You can only update your own horses');
    }
    Object.assign(horse, dto);
    return horse.save();
  }

  /** Soft delete – owner or admin */
  async softDelete(
    id: string,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<void> {
    const horse = await this.findOne(id);
    if (!isAdmin && String(horse.ownerId) !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own horses');
    }
    horse.status = HorseStatus.DELETED;
    horse.deletedAt = new Date();
    await horse.save();
  }
}
