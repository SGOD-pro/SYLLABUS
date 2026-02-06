import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackService } from './feedback.service';
import { ConceptFeedback, ConceptFeedbackSchema } from './feedback.schema';
import { UsersModule } from '../users/users.module';
import { SessionModule } from '../sessions/session.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConceptFeedback.name, schema: ConceptFeedbackSchema },
    ]),
    UsersModule,
    SessionModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository],
  exports: [FeedbackService],
})
export class FeedbackModule {}
