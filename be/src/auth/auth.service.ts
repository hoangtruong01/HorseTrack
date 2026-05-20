import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
    });

    return {
      accessToken: this.buildToken(user),
      user: plainToInstance(UserResponseDto, user.toObject(), {
        excludeExtraneousValues: true,
      }),
    };
  }

  validateUser(email: string, password: string): Promise<UserDocument | null> {
    return this.usersService.validateCredentials(email, password);
  }

  login(user: UserDocument): AuthResponseDto {
    return {
      accessToken: this.buildToken(user),
      user: plainToInstance(UserResponseDto, user.toObject(), {
        excludeExtraneousValues: true,
      }),
    };
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    return this.usersService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  private buildToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
