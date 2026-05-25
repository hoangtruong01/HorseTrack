import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserDocument, UserStatus } from '../users/schemas/user.schema';
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

    const tokens = this.buildTokens(user);
    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user.toObject(), {
        excludeExtraneousValues: true,
      }),
    };
  }

  validateUser(email: string, password: string): Promise<UserDocument | null> {
    return this.usersService.validateCredentials(email, password);
  }

  login(user: UserDocument): AuthResponseDto {
    const tokens = this.buildTokens(user);
    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user.toObject(), {
        excludeExtraneousValues: true,
      }),
    };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');
      return this.buildTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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

  async googleLogin(credential: string): Promise<AuthResponseDto> {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
      );
      if (!response.ok) {
        throw new UnauthorizedException(
          'Mã xác thực Google không hợp lệ hoặc đã hết hạn.',
        );
      }
      const googleProfile = (await response.json()) as {
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
      };

      const email = googleProfile.email;
      if (!email) {
        throw new UnauthorizedException(
          'Không thể lấy email từ tài khoản Google.',
        );
      }

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        // Tự động đăng ký tài khoản mới nếu chưa tồn tại
        const placeholderPassword =
          'google-auth-placeholder-' + Math.random().toString(36).substring(2);
        user = await this.usersService.create({
          fullName: googleProfile.name || 'Người dùng Google',
          email,
          password: placeholderPassword,
          phone: '',
          avatar: googleProfile.picture,
        });
      }

      if (
        user.status === UserStatus.BANNED ||
        user.status === UserStatus.DELETED
      ) {
        throw new UnauthorizedException(
          'Tài khoản đã bị khóa hoặc bị xóa khỏi hệ thống.',
        );
      }

      const tokens = this.buildTokens(user);
      return {
        ...tokens,
        user: plainToInstance(UserResponseDto, user.toObject(), {
          excludeExtraneousValues: true,
        }),
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Xác thực Google thất bại.';
      throw new UnauthorizedException(message);
    }
  }

  private buildTokens(user: UserDocument): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
      roles: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
}
