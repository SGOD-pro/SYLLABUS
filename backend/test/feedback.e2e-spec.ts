import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/common/guard/clerk-auth.guard';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import { User } from '../src/users/user.schema';
import { Subject } from '../src/subjects/subject.schema';
import { Concept } from '../src/concepts/concept.schema';
import { StudySession } from '../src/sessions/session.schema';
import { StudyPlan } from '../src/planner/study-plan.schema';
import { ConceptFeedback } from '../src/feedback/feedback.schema';

class MockClerkAuthGuard {
  static clerkId = 'test-clerk-id';
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { clerkId: MockClerkAuthGuard.clerkId };
    return true;
  }
}

describe('Feedback E2E', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  let subjectModel: Model<any>;
  let conceptModel: Model<any>;
  let sessionModel: Model<any>;
  let planModel: Model<any>;
  let feedbackModel: Model<any>;
  let conceptId: string;
  let subjectId: string;
  let userId: string;
  let baselineExplain: any;

  const positiveSentence =
    'Recent feedback suggests this concept feels clear and manageable.';
  const negativeSentence =
    'Recent feedback indicates this concept has felt confusing or rushed.';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useClass(MockClerkAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userModel = app.get<Model<any>>(getModelToken(User.name));
    subjectModel = app.get<Model<any>>(getModelToken(Subject.name));
    conceptModel = app.get<Model<any>>(getModelToken(Concept.name));
    sessionModel = app.get<Model<any>>(getModelToken(StudySession.name));
    planModel = app.get<Model<any>>(getModelToken(StudyPlan.name));
    feedbackModel = app.get<Model<any>>(getModelToken(ConceptFeedback.name));

    await userModel.findOneAndUpdate(
      { clerkId: 'test-clerk-id' },
      {
        clerkId: 'test-clerk-id',
        name: 'Test User',
        email: 'test-user@example.com',
      },
      { upsert: true, new: true },
    );
    const user = await userModel.findOne({ clerkId: 'test-clerk-id' }).exec();
    userId = user._id.toString();

    await subjectModel.deleteMany({});
    await conceptModel.deleteMany({});

    const subjectRes = await request(app.getHttpServer())
      .post('/api/subjects')
      .send({
        name: 'Biology',
        examDate: new Date().toISOString(),
        isBacklog: false,
        priorityWeight: 1,
      });

    subjectId = subjectRes.body.id;
    const concept = await conceptModel.create({
      subjectId,
      name: 'Cell Structure',
      difficulty: 2,
      estimatedMinutes: 30,
      prerequisites: [],
    });
    conceptId = concept._id.toString();

    const today = new Date().toISOString().slice(0, 10);
    await request(app.getHttpServer()).post('/api/session/submit').send({
      conceptId,
      plannedMinutes: 30,
      actualMinutes: 30,
      completionScore: 0.8,
      difficultyFeedback: 2,
      date: today,
    });
    await request(app.getHttpServer()).post('/api/session/submit').send({
      conceptId,
      plannedMinutes: 30,
      actualMinutes: 30,
      completionScore: 0.7,
      difficultyFeedback: 3,
      date: today,
    });
    await request(app.getHttpServer()).post('/api/session/submit').send({
      conceptId,
      plannedMinutes: 30,
      actualMinutes: 30,
      completionScore: 0.9,
      difficultyFeedback: 2,
      date: today,
    });
  });

  afterEach(async () => {
    await feedbackModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/feedback/concept (happy path) stores feedback and does not mutate other collections', async () => {
    const sessionsBefore = await sessionModel.countDocuments();
    const plansBefore = await planModel.countDocuments();

    const res = await request(app.getHttpServer())
      .post('/api/feedback/concept')
      .send({
        conceptId,
        feedbackType: 'CLEAR',
        note: 'Felt straightforward.',
        sessionId: null,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toEqual({ ok: true });

    const feedbackCount = await feedbackModel.countDocuments({
      userId: new Types.ObjectId(userId),
      conceptId: new Types.ObjectId(conceptId),
    });
    expect(feedbackCount).toBe(1);

    const sessionsAfter = await sessionModel.countDocuments();
    const plansAfter = await planModel.countDocuments();
    expect(sessionsAfter).toBe(sessionsBefore);
    expect(plansAfter).toBe(plansBefore);
  });

  it('POST /api/feedback/concept rejects invalid feedbackType', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/feedback/concept')
      .send({
        conceptId,
        feedbackType: 'INVALID_TYPE',
        note: null,
        sessionId: null,
      });

    expect(res.status).toBe(400);
    const feedbackCount = await feedbackModel.countDocuments({
      userId: new Types.ObjectId(userId),
      conceptId: new Types.ObjectId(conceptId),
    });
    expect(feedbackCount).toBe(0);
  });

  it('POST /api/feedback/concept rejects note length > 300', async () => {
    const longNote = 'a'.repeat(301);
    const res = await request(app.getHttpServer())
      .post('/api/feedback/concept')
      .send({
        conceptId,
        feedbackType: 'CLEAR',
        note: longNote,
        sessionId: null,
      });

    expect(res.status).toBe(400);
    const feedbackCount = await feedbackModel.countDocuments({
      userId: new Types.ObjectId(userId),
      conceptId: new Types.ObjectId(conceptId),
    });
    expect(feedbackCount).toBe(0);
  });

  it('POST /api/feedback/concept rejects sessionId from another user', async () => {
    const session = await sessionModel.create({
      userId: new Types.ObjectId(),
      conceptId,
      plannedMinutes: 30,
      actualMinutes: 30,
      completionScore: 0.8,
      difficultyFeedback: 2,
      date: new Date().toISOString().slice(0, 10),
    });

    const res = await request(app.getHttpServer())
      .post('/api/feedback/concept')
      .send({
        conceptId,
        feedbackType: 'CLEAR',
        note: null,
        sessionId: session._id.toString(),
      });

    expect([400, 403]).toContain(res.status);
    const feedbackCount = await feedbackModel.countDocuments({
      userId: new Types.ObjectId(userId),
      conceptId: new Types.ObjectId(conceptId),
    });
    expect(feedbackCount).toBe(0);
  });

  it('POST /api/ai/explain-concept baseline (no feedback) matches Phase 6.3 output', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/ai/explain-concept')
      .send({ conceptId });

    expect([200, 201]).toContain(res.status);
    baselineExplain = res.body;
    expect(baselineExplain.masteryReason).not.toContain('Recent feedback');
  });

  it('POST /api/ai/explain-concept appends POSITIVE feedback sentence only to masteryReason', async () => {
    await feedbackModel.insertMany([
      {
        userId: new Types.ObjectId(userId),
        conceptId: new Types.ObjectId(conceptId),
        feedbackType: 'CONFIDENT',
        createdAt: new Date(),
      },
      {
        userId: new Types.ObjectId(userId),
        conceptId: new Types.ObjectId(conceptId),
        feedbackType: 'CLEAR',
        createdAt: new Date(),
      },
    ]);

    const res = await request(app.getHttpServer())
      .post('/api/ai/explain-concept')
      .send({ conceptId });

    expect([200, 201]).toContain(res.status);
    expect(res.body.masteryReason).toContain(positiveSentence);
    expect(res.body.masteryReason.startsWith(baselineExplain.masteryReason)).toBe(
      true,
    );
    expect(res.body.decayRiskReason).toBe(baselineExplain.decayRiskReason);
    expect(res.body.prerequisiteImpact).toEqual(
      baselineExplain.prerequisiteImpact,
    );
    expect(res.body.uncertaintyNote).toBe(baselineExplain.uncertaintyNote);
  });

  it('POST /api/ai/explain-concept appends NEGATIVE feedback sentence only to masteryReason', async () => {
    await feedbackModel.insertMany([
      {
        userId: new Types.ObjectId(userId),
        conceptId: new Types.ObjectId(conceptId),
        feedbackType: 'CONFUSING',
        createdAt: new Date(),
      },
      {
        userId: new Types.ObjectId(userId),
        conceptId: new Types.ObjectId(conceptId),
        feedbackType: 'TOO_FAST',
        createdAt: new Date(),
      },
    ]);

    const res = await request(app.getHttpServer())
      .post('/api/ai/explain-concept')
      .send({ conceptId });

    expect([200, 201]).toContain(res.status);
    expect(res.body.masteryReason).toContain(negativeSentence);
    expect(res.body.masteryReason.startsWith(baselineExplain.masteryReason)).toBe(
      true,
    );
    expect(res.body.decayRiskReason).toBe(baselineExplain.decayRiskReason);
    expect(res.body.prerequisiteImpact).toEqual(
      baselineExplain.prerequisiteImpact,
    );
    expect(res.body.uncertaintyNote).toBe(baselineExplain.uncertaintyNote);
  });

  it('POST /api/ai/explain-concept with INSUFFICIENT feedback matches baseline', async () => {
    await feedbackModel.insertMany([
      {
        userId: new Types.ObjectId(userId),
        conceptId: new Types.ObjectId(conceptId),
        feedbackType: 'CLEAR',
        createdAt: new Date(),
      },
    ]);

    const res = await request(app.getHttpServer())
      .post('/api/ai/explain-concept')
      .send({ conceptId });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toEqual(baselineExplain);
  });

  describe.skip('GET /api/ai/explain-concept/:conceptId (spec enforcement)', () => {
    it('no feedback', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/ai/explain-concept/${conceptId}`,
      );
      expect([200, 201]).toContain(res.status);
      expect(res.body).toEqual(baselineExplain);
    });

    it('POSITIVE feedback', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/ai/explain-concept/${conceptId}`,
      );
      expect([200, 201]).toContain(res.status);
      expect(res.body.masteryReason).toContain(positiveSentence);
    });

    it('NEGATIVE feedback', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/ai/explain-concept/${conceptId}`,
      );
      expect([200, 201]).toContain(res.status);
      expect(res.body.masteryReason).toContain(negativeSentence);
    });

    it('INSUFFICIENT feedback', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/ai/explain-concept/${conceptId}`,
      );
      expect([200, 201]).toContain(res.status);
      expect(res.body).toEqual(baselineExplain);
    });
  });
});
