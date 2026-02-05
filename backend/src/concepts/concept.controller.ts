import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../common/guard/clerk-auth.guard';
import { UsersService } from '../users/user.service';
import { SubjectsService } from '../subjects/subject.service';
import { CreateConceptDto } from './create-concept.dto';
import { ConceptMapper } from './concept.mapper';
import { ConceptResponseDto } from './concept.response.dto';
import { ConceptsService } from './concept.service';
import { Types } from 'mongoose'
type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('concepts')
@UseGuards(ClerkAuthGuard)
export class ConceptsController {
  constructor(
    private readonly conceptsService: ConceptsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
  ) { }

  @Post('bulk')
  async createBulk(
    @Req() req: RequestWithUser,
    @Body() body: { subjectId: string; concepts: CreateConceptDto[] },
  ): Promise<ConceptResponseDto[]> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { subjectId, concepts } = body;

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

    const created = await this.conceptsService.createBulkConcepts(
      new Types.ObjectId(subjectId),
      concepts,
    );
    return created.map(ConceptMapper.toResponse);
  }

}
