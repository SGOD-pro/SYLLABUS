import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { UsersService } from '../users/user.service';
import { ProfileMapper } from './profile.mapper';
import { ProfileService } from './profile.service';
import {
  ProfilePanicToggleDto,
  ProfileSetupDto,
} from './profile.setup.dto';
import { ProfileResponseDto } from './profile.response.dto';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('profile')
@UseGuards(ClerkAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  @Post('setup')
  async setupProfile(
    @Req() req: RequestWithUser,
    @Body() dto: ProfileSetupDto,
  ): Promise<ProfileResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileService.setupProfile(user._id, dto);
    return ProfileMapper.toResponse(profile);
  }

  @Get()
  async getProfile(@Req() req: RequestWithUser): Promise<ProfileResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileService.getProfile(user._id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return ProfileMapper.toResponse(profile);
  }

  @Post('panic-toggle')
  async togglePanic(
    @Req() req: RequestWithUser,
    @Body() dto: ProfilePanicToggleDto,
  ): Promise<ProfileResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileService.togglePanic(
      user._id,
      dto.enabled,
    );
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return ProfileMapper.toResponse(profile);
  }
}
