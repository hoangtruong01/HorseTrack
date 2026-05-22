import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JockeyInvitationsService } from './jockey-invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';

@ApiTags('Jockey Invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('jockey-invitations')
export class JockeyInvitationsController {
  constructor(
    private readonly jockeyInvitationsService: JockeyInvitationsService,
  ) {}

  @Post()
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'Send invitation to a Jockey (Owner only)' })
  create(@Body() dto: CreateInvitationDto, @CurrentUser() user: JwtUser) {
    return this.jockeyInvitationsService.create(dto, user.id);
  }

  @Patch(':id/respond')
  @Roles(RoleName.JOCKEY)
  @ApiOperation({ summary: 'Accept or Reject invitation (Jockey only)' })
  respond(
    @Param('id') id: string,
    @Body() dto: RespondInvitationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.jockeyInvitationsService.respond(id, dto.status, user.id);
  }

  @Get('received')
  @Roles(RoleName.JOCKEY)
  @ApiOperation({ summary: 'List received invitations (Jockey only)' })
  findReceived(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.jockeyInvitationsService.findMyReceived(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('sent')
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'List sent invitations (Owner only)' })
  findSent(@Query() pagination: PaginationDto, @CurrentUser() user: JwtUser) {
    return this.jockeyInvitationsService.findMySent(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }
}
