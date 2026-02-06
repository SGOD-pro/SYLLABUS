import { IsMongoId, IsString } from 'class-validator';
import type {
  PrerequisiteImpactSeverity,
} from './concept-intelligence.types';

export class ConceptExplainRequestDto {
  @IsMongoId()
  conceptId: string;
}

export class ConceptExplainResponseDto {
  @IsString()
  masteryReason: string;

  @IsString()
  decayRiskReason: string;

  prerequisiteImpact: {
    severity: PrerequisiteImpactSeverity;
    concepts: string[];
  };

  uncertaintyNote: string | null;
}
