import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmFactory } from './llm.factory';
import { UsersModule } from '../users/users.module';
import { SessionModule } from '../sessions/session.module';
import { ConceptsModule } from '../concepts/concept.module';
import { ConceptIntelligenceService } from './concept-intelligence.service';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    SessionModule,
    ConceptsModule,
    FeedbackModule,
  ],
  controllers: [AiController],
  providers: [AiService, LlmFactory, ConceptIntelligenceService],
  exports: [AiService],
})
export class AiModule {}
