import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';
import { StudyProfile, StudyProfileSchema } from './profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudyProfile.name, schema: StudyProfileSchema },
    ]),
    UsersModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService],
})
export class ProfileModule {}
