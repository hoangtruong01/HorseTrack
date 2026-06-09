import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName, UserDocument, UserStatus } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import {
  Jockey,
  JockeyDocument,
  JockeyStatus,
  JockeySkillLevel,
} from '../jockeys/schemas/jockey.schema';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    @InjectModel(Jockey.name) private jockeyModel: Model<JockeyDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      address: dto.address,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      avatar: dto.avatar,
      roles: dto.roles,
      provider: dto.provider || 'local',
    });

    if (user.roles && user.roles.includes(RoleName.JOCKEY)) {
      await this.ensureJockeyProfile(String(user._id));
    }

    return user;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findByEmail(email, true);
    if (!user) return null;
    if (
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.BANNED
    ) {
      return null;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;
    return user;
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    role?: RoleName,
    status?: UserStatus,
  ) {
    return this.usersRepository.findAll(page, limit, search, role, status);
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requestingUserId: string,
    requestingRoles: string[],
  ): Promise<UserDocument> {
    const isSelf = id === requestingUserId;
    const isAdmin = requestingRoles.includes(RoleName.ADMIN);
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('Cannot update another user');
    }
    const updateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    const updated = await this.usersRepository.update(id, updateData);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findById(id, true);
    if (!user) throw new NotFoundException('User not found');

    // Google users don't know their placeholder password, so they can bypass old password validation for the first password setup
    if (user.provider !== 'google') {
      const match = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!match)
        throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.usersRepository.update(id, { passwordHash, provider: 'local' });
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (!result) throw new NotFoundException('User not found');
  }

  async ban(id: string): Promise<void> {
    const result = await this.usersRepository.updateStatus(
      id,
      UserStatus.BANNED,
    );
    if (!result) throw new NotFoundException('User not found');
  }

  async unban(id: string): Promise<void> {
    const result = await this.usersRepository.updateStatus(
      id,
      UserStatus.ACTIVE,
    );
    if (!result) throw new NotFoundException('User not found');
  }

  async assignRole(userId: string, role: RoleName): Promise<void> {
    const result = await this.usersRepository.addRole(userId, role);
    if (!result) throw new NotFoundException('User not found');
    if (role === RoleName.JOCKEY) {
      await this.ensureJockeyProfile(userId);
    }
  }

  async removeRole(userId: string, role: RoleName): Promise<void> {
    const result = await this.usersRepository.removeRole(userId, role);
    if (!result) throw new NotFoundException('User not found');
  }

  private async ensureJockeyProfile(userId: string): Promise<void> {
    const existing = await this.jockeyModel.findOne({ userId });
    if (!existing) {
      await this.jockeyModel.create({
        userId,
        heightCm: 165,
        weightKg: 50,
        experienceYears: 0,
        status: JockeyStatus.AVAILABLE,
        skillLevel: JockeySkillLevel.BEGINNER,
      });
    }
  }
}
