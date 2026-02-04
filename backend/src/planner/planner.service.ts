import { Injectable, NotFoundException } from '@nestjs/common';
import { generatePlan, type PlannerInput } from './engine/planner.engine';
import { UsersService } from '../users/user.service';
import { ProfileService } from '../profile/profile.service';
import { SubjectsService } from '../subjects/subject.service';
import { ConceptsService } from '../concepts/concept.service';
import { SessionRepository } from '../sessions/session.repository';
import { StudyPlanRepository } from './study-plan.repository';

@Injectable()
export class PlannerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
    private readonly subjectsService: SubjectsService,
    private readonly conceptsService: ConceptsService,
    private readonly sessionRepository: SessionRepository,
    private readonly studyPlanRepository: StudyPlanRepository,
  ) {}

  async generateTodayPlan(clerkId: string, today: string) {
    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.studyPlanRepository.findByUserIdAndDate(
      user._id.toString(),
      today,
    );
    if (existing) {
      return existing;
    }

    const profile = await this.profileService.getProfile(user._id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const subjects = await this.subjectsService.getSubjects(user._id);
    const conceptsBySubject = await Promise.all(
      subjects.map((subject) => this.conceptsService.getConceptsBySubject(subject._id)),
    );
    const concepts = conceptsBySubject.flat();

    const sessions = await this.sessionRepository.findByUserId(
      user._id.toString(),
    );

    const plannerInput: PlannerInput = {
      subjects: subjects.map((subject) => ({
        id: subject._id.toString(),
        examDate: subject.examDate.toISOString(),
        isBacklog: subject.isBacklog,
        priorityWeight: subject.priorityWeight,
      })),
      concepts: concepts.map((concept) => ({
        id: concept._id.toString(),
        subjectId: concept.subjectId.toString(),
        difficulty: concept.difficulty,
        estimatedMinutes: concept.estimatedMinutes,
        prerequisites: (concept.prerequisites ?? []).map((id) => id.toString()),
      })),
      profile: {
        dailyMinutes: profile.dailyMinutes,
        fatigueThreshold: profile.fatigueThreshold,
        panicMode: profile.panicMode,
      },
      sessions: sessions.map((session) => ({
        conceptId: session.conceptId.toString(),
        completionScore: session.completionScore,
        difficultyFeedback: session.difficultyFeedback,
      })),
      today,
    };

    const plan = generatePlan(plannerInput);

    return this.studyPlanRepository.create({
      userId: user._id.toString(),
      date: plan.date,
      sessions: plan.sessions,
    });
  }

  async getTodayPlan(clerkId: string, today: string){
    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.studyPlanRepository.findByUserIdAndDate(
      user._id.toString(),
      today,
    );
  }

  async togglePanicMode(clerkId: string, enabled: boolean): Promise<void> {
    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.profileService.togglePanic(user._id, enabled);
  }
}
