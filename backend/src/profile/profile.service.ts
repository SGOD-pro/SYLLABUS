import { Injectable } from '@nestjs/common';
import type { Types } from 'mongoose';
import { ProfileRepository } from './profile.repository';
import { ProfileSetupDto } from './profile.setup.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async setupProfile(
    userId: Types.ObjectId,
    dto: ProfileSetupDto,
  ) {
    const existing = await this.profileRepo.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.profileRepo.create({
      userId,
      dailyMinutes: dto.dailyMinutes,
      preferredSlots: dto.preferredSlots,
      fatigueThreshold: dto.fatigueThreshold,
      panicMode: false,
    });
  }

  async getProfile(userId: Types.ObjectId) {
    return this.profileRepo.findByUserId(userId);
  }

  async togglePanic(userId: Types.ObjectId, enabled: boolean) {
    return this.profileRepo.togglePanicMode(userId, enabled);
  }
}
