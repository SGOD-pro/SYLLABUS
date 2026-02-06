import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { UsersService } from '../users/user.service';
import { ConceptFeedbackRequestDto, ConceptFeedbackResponseDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('feedback')
@UseGuards(ClerkAuthGuard)
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly usersService: UsersService,
  ) {}

  @Post('concept')
  async submitConceptFeedback(
    @Req() req: RequestWithUser,
    @Body() body: ConceptFeedbackRequestDto,
  ): Promise<ConceptFeedbackResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.feedbackService.submitFeedback(user._id, body);
    return { ok: true };
  }
}
