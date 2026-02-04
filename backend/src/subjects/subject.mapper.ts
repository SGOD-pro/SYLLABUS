import type { SubjectDocument } from './subject.schema';
import { SubjectResponseDto } from './subject.response.dto';

export class SubjectMapper {
  static toResponse(subject: SubjectDocument): SubjectResponseDto {
    return {
      id: subject._id.toString(),
      name: subject.name,
      examDate: subject.examDate.toISOString(),
      isBacklog: subject.isBacklog,
      priorityWeight: subject.priorityWeight,
    };
  }
}
