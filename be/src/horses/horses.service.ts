import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { Horse, HorseDocument } from './schemas/horse.schema';

@Injectable()
export class HorsesService {
  constructor(
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
  ) {}

  async create(createHorseDto: CreateHorseDto): Promise<Horse> {
    const createdHorse = new this.horseModel(createHorseDto);
    return createdHorse.save();
  }

  async findAll(): Promise<Horse[]> {
    return this.horseModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} horse`;
  }

  update(id: number, _updateHorseDto: UpdateHorseDto) {
    return `This action updates a #${id} horse`;
  }

  remove(id: number) {
    return `This action removes a #${id} horse`;
  }
}
