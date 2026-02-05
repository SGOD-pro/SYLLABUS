import { BadRequestException, Injectable } from '@nestjs/common';
import  { Types } from 'mongoose';
import { ConceptsRepository } from './concept.repository';
import { CreateConceptDto } from './create-concept.dto';

@Injectable()
export class ConceptsService {
  constructor(private readonly conceptsRepo: ConceptsRepository) {}

async createBulkConcepts(
  subjectId: Types.ObjectId,
  createDtos: CreateConceptDto[],
) {
  const concepts = createDtos.map((dto) => ({
    subjectId,
    name: dto.name,
    difficulty: dto.difficulty,
    estimatedMinutes: dto.estimatedMinutes,
    prerequisites: (dto.prerequisites ?? []).map(
      (id) => new Types.ObjectId(id),
    ),
  }));

  return this.conceptsRepo.bulkCreate(concepts);
}


  async getConceptsBySubject(subjectId: Types.ObjectId) {
    return this.conceptsRepo.findBySubjectId(subjectId);
  }
}
