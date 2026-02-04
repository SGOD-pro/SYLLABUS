import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { User, type UserDocument } from './user.schema';

export interface CreateUserInput {
  clerkId: string;
  name?: string;
  degree?: string;
  email: string;
  profilePic?: string;
  semester?: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getByClerkId(clerkId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ clerkId }).exec();
  }

  async createIfNotExists(input: CreateUserInput): Promise<UserDocument> {
    const existing = await this.userModel
      .findOne({ clerkId: input.clerkId })
      .exec();
    if (existing) {
      return existing;
    }

    return this.userModel.create(input);
  }
}
