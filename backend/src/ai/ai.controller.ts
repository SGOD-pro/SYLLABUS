import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { AiService, ExplainabilityInput } from './ai.service';
import { UsersService } from '../users/user.service';
import { ConceptIntelligenceService } from './concept-intelligence.service';
import { FeedbackService } from '../feedback/feedback.service';
import {
  ConceptExplainRequestDto,
  ConceptExplainResponseDto,
} from './concept-explain.dto';
// import type {
//   ExplainabilityInput,
//   ExplainabilityOutput,
// } from './explainability.graph';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('ai')
@UseGuards(ClerkAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly conceptIntelligenceService: ConceptIntelligenceService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post('explain-concept')
  async explainConcept(
    @Req() req: RequestWithUser,
    @Body() body: ConceptExplainRequestDto,
  ): Promise<ConceptExplainResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload = await this.conceptIntelligenceService.assemblePayload(
      body.conceptId,
      user._id,
    );
    const trend = await this.feedbackService.getTrend(user._id, body.conceptId);
    return this.conceptIntelligenceService.buildExplanationWithFeedback(
      payload,
      trend,
    );
  }

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
