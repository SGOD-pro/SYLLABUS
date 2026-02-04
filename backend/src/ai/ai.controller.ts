import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { AiService, ExplainabilityInput } from './ai.service';
// import type {
//   ExplainabilityInput,
//   ExplainabilityOutput,
// } from './explainability.graph';

@Controller('ai')
@UseGuards(ClerkAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('explain-plan')
  async explainPlan(
    // @Body() body: ExplainabilityInput,
    @Body() body: any
  ) {
    return this.aiService.explainPlan(body);
  }

  @Post('parse-syllabus')
  async parseSyllabus(@Body() body: { rawText: string }) {
    return this.aiService.parseSyllabus(body.rawText);
  }
}
