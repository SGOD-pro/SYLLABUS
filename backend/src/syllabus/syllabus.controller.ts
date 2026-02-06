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
import { Types } from 'mongoose';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { SubjectsService } from '../subjects/subject.service';
import { UsersService } from '../users/user.service';
import { SyllabusService } from './syllabus.service';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('syllabus')
@UseGuards(ClerkAuthGuard)
export class SyllabusController {
  constructor(
    private readonly syllabusService: SyllabusService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
  ) {}

  @Post('parse')
  async parseSyllabus(
    @Req() req: RequestWithUser,
    @Body() body: { subjectId: string; rawText: string },
  ) {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { subjectId, rawText } = body;

    if (!subjectId || !Types.ObjectId.isValid(subjectId)) {
      throw new NotFoundException('Subject not found');
    }

    const subject = await this.subjectsService.getSubjectById(
      user._id,
      new Types.ObjectId(subjectId),
    );

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const topics = await this.syllabusService.parseSyllabus(rawText || '', subjectId);

    return { topics };
  }
}
