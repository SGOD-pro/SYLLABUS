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

type RequestWithUser = Request & { user?: { clerkId?: string } };

@Controller('concepts')
@UseGuards(ClerkAuthGuard)
export class ConceptsController {
  constructor(
    private readonly conceptsService: ConceptsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
  ) {}

  @Post('bulk')
  async createBulk(
    @Req() req: RequestWithUser,
    @Body() dtos: CreateConceptDto[],
  ): Promise<ConceptResponseDto[]> {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new UnauthorizedException('Missing user context');
    }

    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dtos.length === 0) {
      return [];
    }

    const subjectId = dtos[0]?.prerequisites;
    if (!subjectId) {
      throw new NotFoundException('Subject not found');
    }

    const concepts = await this.conceptsService.createBulkConcepts(
      user._id,
      dtos,
    );

    return concepts.map((concept:any) => ConceptMapper.toResponse(concept));
  }
}
