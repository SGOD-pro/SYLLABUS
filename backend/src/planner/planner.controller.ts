import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { PlannerService } from './planner.service';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('planner')
@UseGuards(ClerkAuthGuard)
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) { }

  @Post('generate')
  generateToday(@Req() req: RequestWithUser): Promise<unknown> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const today = new Date().toISOString().slice(0, 10);
    return this.plannerService.generateTodayPlan(clerkId, today);
  }

  @Get('today')
  getToday(@Req() req: RequestWithUser): Promise<unknown> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const today = new Date().toISOString().slice(0, 10);
    return this.plannerService.getTodayPlan(clerkId, today);
  }



  @Post('panic-toggle')
  togglePanic(
    @Req() req: RequestWithUser,
    @Body() body: { enabled: boolean },
  ) {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    return this.plannerService.togglePanicMode(clerkId, body.enabled);
  }
}
