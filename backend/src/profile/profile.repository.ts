import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { StudyProfile, type StudyProfileDocument } from './profile.schema';

export interface ProfileCreateInput {
  userId: StudyProfileDocument['userId'];
  dailyMinutes: number;
  preferredSlots?: string[];
  fatigueThreshold: number;
  panicMode?: boolean;
}

export interface ProfileUpdateInput {
  dailyMinutes?: number;
  preferredSlots?: string[];
  fatigueThreshold?: number;
  panicMode?: boolean;
}

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(StudyProfile.name)
    private readonly profileModel: Model<StudyProfileDocument>,
  ) {}

  async findByUserId(
    userId: StudyProfileDocument['userId'],
  ): Promise<StudyProfileDocument | null> {
    return this.profileModel.findOne({ userId }).exec();
  }

  async create(
    profileData: ProfileCreateInput,
  ): Promise<StudyProfileDocument> {
    return this.profileModel.create(profileData);
  }

  async updateByUserId(
    userId: StudyProfileDocument['userId'],
    partialUpdate: ProfileUpdateInput,
  ): Promise<StudyProfileDocument | null> {
    return this.profileModel
      .findOneAndUpdate({ userId }, { $set: partialUpdate }, { new: true })
      .exec();
  }

  async togglePanicMode(
    userId: StudyProfileDocument['userId'],
    enabled: boolean,
  ): Promise<StudyProfileDocument | null> {
    return this.profileModel
      .findOneAndUpdate({ userId }, { $set: { panicMode: enabled } }, { new: true })
      .exec();
  }
}
