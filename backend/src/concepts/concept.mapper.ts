// import type { ConceptDocument } from './concept.schema';
import { ConceptResponseDto } from './concept.response.dto';
import { Types } from 'mongoose';

type ConceptLike = {
  _id: Types.ObjectId;
  name: string;
  difficulty: number;
  estimatedMinutes: number;
  prerequisites?: Types.ObjectId[];
};

export class ConceptMapper {
  static toResponse(concept: ConceptLike): ConceptResponseDto {
    return {
      id: concept._id.toString(),
      name: concept.name,
      difficulty: concept.difficulty,
      estimatedMinutes: concept.estimatedMinutes,
      prerequisites: (concept.prerequisites ?? []).map((id) =>
        id.toString(),
      ),
    };
  }
}

