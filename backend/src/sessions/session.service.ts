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
  ) { }

  async submitSession(input: CreateStudySessionInput) {
    if (!input) {
      return null;
    }
    const today = new Date().toISOString().slice(0, 10);
    const plan = await this.studyPlanRepo.findByUserIdAndDate(
      input.userId.toString(),
      today,
    );

    const created = await this.sessionRepo.create(input);

    let progress: { completedCount: number; totalCount: number; percent: number } | undefined;
    if (plan?.sessions?.length) {
      const totalCount = plan.sessions.length;
      try {
        const completedCount = await this.sessionRepo.countByUserIdAndDate(
          input.userId.toString(),
          today,
        );
        const percent =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        progress = { completedCount, totalCount, percent };
      } catch {
        progress = undefined;
      }
    }

    await this.studyPlanRepo.deleteByUserIdAndDate(
      input.userId.toString(),
      today,
    );

    const payload = created.toObject ? created.toObject() : created;
    const res = progress ? { ...payload, progress } : payload
    return res;
  }
}
