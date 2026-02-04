import {
  Controller,
  Get,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { UsersService } from './user.service';
import { UserMapper } from './user.mapper';
import { UserResponseDto } from './user.response.dto';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponse(user);
  }
}
