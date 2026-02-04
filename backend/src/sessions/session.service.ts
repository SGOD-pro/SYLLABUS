import { Injectable } from '@nestjs/common';
import {
  SessionRepository,
  type CreateStudySessionInput,
} from './session.repository';
import { StudyPlanRepository } from '../planner/study-plan.repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly studyPlanRepo: StudyPlanRepository,
  ) {}

  async submitSession(input: CreateStudySessionInput) {
    if (!input) {
      return null;
    }
    const created = await this.sessionRepo.create(input);
    const today = new Date().toISOString().slice(0, 10);
    await this.studyPlanRepo.deleteByUserIdAndDate(
      input.userId.toString(),
      today,
    );
    return created;
  }
}
