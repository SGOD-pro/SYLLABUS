import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { UsersService } from '../users/user.service';
import { CreateSubjectDto } from './create-subject.dto';
import { SubjectMapper } from './subject.mapper';
import { SubjectResponseDto } from './subject.response.dto';
import { SubjectsService } from './subject.service';

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('subjects')
@UseGuards(ClerkAuthGuard)
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createSubject(
    @Req() req: RequestWithUser,
    @Body() dto: CreateSubjectDto,
  ): Promise<SubjectResponseDto> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subject = await this.subjectsService.createSubject(user._id, dto);
    return SubjectMapper.toResponse(subject);
  }

  @Get()
  async getSubjects(
    @Req() req: RequestWithUser,
  ): Promise<SubjectResponseDto[]> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subjects = await this.subjectsService.getSubjects(user._id);
    return subjects.map((subject) => SubjectMapper.toResponse(subject));
  }
}
