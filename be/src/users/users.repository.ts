import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import {
  RoleName,
  User,
  UserDocument,
  UserStatus,
} from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  findById(id: string, includePassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findById(id);
    if (includePassword) query.select('+passwordHash');
    return query.exec();
  }

  findByEmail(
    email: string,
    includePassword = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (includePassword) query.select('+passwordHash');
    return query.exec();
  }

  findAll(page = 1, limit = 20): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  softDelete(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { status: UserStatus.DELETED, deletedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  addRole(id: string, role: RoleName): Promise<UserDocument | null> {
    const update: UpdateQuery<User> = { $addToSet: { roles: role } };
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  removeRole(id: string, role: RoleName): Promise<UserDocument | null> {
    const update: UpdateQuery<User> = { $pull: { roles: role } };
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}
