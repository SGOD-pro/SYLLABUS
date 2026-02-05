import { Injectable, Type } from '@nestjs/common';
import type { Types } from 'mongoose';
import { SubjectsRepository } from './subject.repository';
import { CreateSubjectDto } from './create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepo: SubjectsRepository) { }

  async createSubject(userId: Types.ObjectId, dto: CreateSubjectDto) {
    return this.subjectsRepo.create({
      userId,
      name: dto.name,
      examDate: new Date(dto.examDate),
      isBacklog: dto.isBacklog ?? false,
      priorityWeight: dto.priorityWeight ?? 1,
    });
  }

  async getSubjects(userId: Types.ObjectId) {
    return this.subjectsRepo.findByUserId(userId);
  }
  async getSubjectById(
    userId: Types.ObjectId,
    subjectId: Types.ObjectId,
  ) {
    return this.subjectsRepo.findByIdAndUser(subjectId,userId);
  }
}
