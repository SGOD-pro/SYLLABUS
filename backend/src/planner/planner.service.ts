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

    const plan = await this.studyPlanRepository.findByUserIdAndDate(
      user._id.toString(),
      today,
    );

    if (!plan) {
      return null;
    }

    try {
      const profile = await this.profileService.getProfile(user._id);
      const subjects = await this.subjectsService.getSubjects(user._id);
      const conceptsBySubject = await Promise.all(
        subjects.map((subject) => this.conceptsService.getConceptsBySubject(subject._id)),
      );
      const concepts = conceptsBySubject.flat();

      const subjectMap = new Map(
        subjects.map((subject) => [subject._id.toString(), subject]),
      );
      const conceptMap = new Map(
        concepts.map((concept) => [concept._id.toString(), concept]),
      );

      const todayDate = new Date(today);
      const explanations: Record<
        string,
        { reason: string; priority: 'high' | 'medium' | 'low' }
      > = {};

      for (const session of plan.sessions) {
        const conceptId = session.conceptId.toString();
        const concept = conceptMap.get(conceptId);
        if (!concept) continue;

        const subject = subjectMap.get(concept.subjectId.toString());
        if (!subject) continue;

        const difficulty = concept.difficulty;
        const isHighWeight = difficulty >= 4;
        const examDate = subject.examDate;
        const daysUntilExam = Math.ceil(
          (examDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const isBacklog = Boolean(subject.isBacklog);
        const panicMode = Boolean(profile?.panicMode);

        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (panicMode || isBacklog || isHighWeight || daysUntilExam <= 7) {
          priority = 'high';
        } else if (difficulty <= 2 && daysUntilExam > 30) {
          priority = 'low';
        }

        const reasons: string[] = [];
        if (panicMode) reasons.push('Panic mode prioritizes high-impact topics');
        if (isBacklog) reasons.push('Backlog subject needs catch-up');
        if (daysUntilExam <= 7) reasons.push('Exam is soon');
        if (isHighWeight) reasons.push('Topic is high difficulty');
        if (reasons.length === 0) {
          reasons.push('Balanced scheduling based on difficulty and exam date');
        }

        explanations[conceptId] = {
          reason: reasons.slice(0, 2).join('. '),
          priority,
        };
      }

      const base =
        typeof (plan as any).toObject === 'function'
          ? (plan as any).toObject()
          : plan;

      if (Object.keys(explanations).length === 0) {
        return base;
      }

      return { ...base, explanations };
    } catch (_err) {
      return plan;
    }
  }

  async togglePanicMode(
    clerkId: string,
    enabled: boolean,
  ): Promise<{ panicMode: boolean }> {
    const user = await this.usersService.getByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileService.togglePanic(user._id, enabled);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return { panicMode: profile.panicMode };
  }
}
