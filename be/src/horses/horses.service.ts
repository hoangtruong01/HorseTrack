import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { Horse, HorseDocument, HorseStatus } from './schemas/horse.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';

type HorseJson = Horse & { id: string };

@Injectable()
export class HorsesService {
  constructor(
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
  ) {}

  /** Owner creates a horse – ownerId comes from JWT */
  async create(dto: CreateHorseDto, ownerId: string): Promise<HorseDocument> {
    return this.horseModel.create({ ...dto, ownerId });
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

  /** Admin: list all non-deleted horses with pagination */
  async findAll(page = 1, limit = 20) {
    const filter = { status: { $ne: HorseStatus.DELETED } };
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
    return {
      data: docs.map((d) => d.toJSON()),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Owner: list own horses */
  async findMyHorses(ownerId: string, page = 1, limit = 20) {
    const filter = { ownerId, status: { $ne: HorseStatus.DELETED } };
    const [docs, total] = await Promise.all([
      this.horseModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.horseModel.countDocuments(filter),
    ]);
    return {
      data: docs.map((d) => d.toJSON()),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get single horse by id */
  async findOne(id: string): Promise<HorseJson> {
    return (await this.findDocument(id)).toJSON() as HorseJson;
  }

  /** Owner updates own horse, admin can update any */
  async update(
    id: string,
    dto: UpdateHorseDto,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<HorseJson> {
    const horse = await this.findDocument(id);
    if (!isAdmin && String(horse.ownerId) !== requestingUserId) {
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

    Object.assign(horse, dto);
    return (await horse.save()).toJSON() as HorseJson;
  }

  /** Soft delete – owner or admin */
  async softDelete(
    id: string,
    requestingUserId: string,
    isAdmin: boolean,
  ): Promise<void> {
    const horse = await this.findDocument(id);
    if (!isAdmin && String(horse.ownerId) !== requestingUserId) {
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
