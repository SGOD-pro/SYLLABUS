import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { SessionService } from './session.service';
import type { CreateStudySessionInput } from './session.repository';
import { UsersService } from '../users/user.service';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('session')
@UseGuards(ClerkAuthGuard)
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {}

  @Post('submit')
  async submitSession(
    @Req() req: RequestWithUser,
    @Body() body: Omit<CreateStudySessionInput, 'userId'>,
  ) {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sessionService.submitSession({
      ...body,
      userId: user._id,
    });
  }
}
