import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmFactory } from './llm.factory';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, LlmFactory],
  exports: [AiService],
})
export class AiModule {}
