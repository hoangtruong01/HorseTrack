import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    _info: any,
    _context: any,
    _status?: any,
  ): any {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
