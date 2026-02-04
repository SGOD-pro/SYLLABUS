import type { ConceptDocument } from './concept.schema';
import { ConceptResponseDto } from './concept.response.dto';

export class ConceptMapper {
  static toResponse(concept: ConceptDocument): ConceptResponseDto {
    return {
      id: concept._id.toString(),
      name: concept.name,
      difficulty: concept.difficulty,
      estimatedMinutes: concept.estimatedMinutes,
      prerequisites: (concept.prerequisites ?? []).map((id) => id.toString()),
    };
  }
}
