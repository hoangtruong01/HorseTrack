import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Race, RaceDocument } from '../races/schemas/race.schema';
import { Horse, HorseDocument } from '../horses/schemas/horse.schema';
import { RaceRecord, RaceRecordDocument } from './schemas/race-record.schema';
import { CreateRaceRecordDto } from './dto/create-race-record.dto';

@Injectable()
export class RaceRecordsService {
  constructor(
    @InjectModel(RaceRecord.name)
    private recordModel: Model<RaceRecordDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
  ) {}

  async create(dto: CreateRaceRecordDto): Promise<RaceRecordDocument> {
    // 1. Verify race exists
    const race = await this.raceModel.findById(dto.raceId);
    if (!race) {
      throw new NotFoundException('Race not found');
    }

    // 2. Verify horse exists
    const horse = await this.horseModel.findById(dto.horseId);
    if (!horse) {
      throw new NotFoundException('Horse not found');
    }

    // Upsert performance record
    return this.recordModel.findOneAndUpdate(
      { raceId: dto.raceId, horseId: dto.horseId },
      dto,
      { upsert: true, new: true },
    );
  }

  async findByRace(raceId: string): Promise<RaceRecordDocument[]> {
    const race = await this.raceModel.findById(raceId);
    if (!race) {
      throw new NotFoundException('Race not found');
    }

    return this.recordModel
      .find({ raceId })
      .populate('horseId', 'name breed gender')
      .sort({ position: 1 })
      .exec();
  }

  async findByHorse(horseId: string): Promise<RaceRecordDocument[]> {
    const horse = await this.horseModel.findById(horseId);
    if (!horse) {
      throw new NotFoundException('Horse not found');
    }

    return this.recordModel
      .find({ horseId })
      .populate('raceId', 'name startTime trackCondition')
      .sort({ createdAt: -1 })
      .exec();
  }
}
