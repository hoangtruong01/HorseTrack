import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName, UserDocument, UserStatus } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      avatar: dto.avatar,
    });
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

  findAll(page = 1, limit = 20): Promise<UserDocument[]> {
    return this.usersRepository.findAll(page, limit);
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
    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match)
      throw new UnauthorizedException('Current password is incorrect');
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.usersRepository.update(id, { passwordHash });
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (!result) throw new NotFoundException('User not found');
  }

  async assignRole(userId: string, role: RoleName): Promise<void> {
    const result = await this.usersRepository.addRole(userId, role);
    if (!result) throw new NotFoundException('User not found');
  }

  async removeRole(userId: string, role: RoleName): Promise<void> {
    const result = await this.usersRepository.removeRole(userId, role);
    if (!result) throw new NotFoundException('User not found');
  }
}
