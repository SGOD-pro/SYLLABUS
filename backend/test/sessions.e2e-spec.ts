import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/common/guard/clerk-auth.guard';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { User } from '../src/users/user.schema';
import { Concept } from '../src/concepts/concept.schema';

class MockClerkAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { clerkId: 'test-clerk-id' };
    return true;
  }
}

describe('Sessions E2E', () => {
  let app: INestApplication;
  let conceptId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useClass(MockClerkAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const userModel = app.get<Model<any>>(getModelToken(User.name));
    await userModel.findOneAndUpdate(
      { clerkId: 'test-clerk-id' },
      { clerkId: 'test-clerk-id', name: 'Test User' },
      { upsert: true, new: true },
    );

    await request(app.getHttpServer())
      .post('/api/profile/setup')
      .send({ dailyMinutes: 60, fatigueThreshold: 180, preferredSlots: [] });

    const subjectRes = await request(app.getHttpServer())
      .post('/api/subjects')
      .send({
        name: 'Chemistry',
        examDate: new Date().toISOString(),
        isBacklog: false,
        priorityWeight: 1,
      });

    const subjectId = subjectRes.body.id;
    const conceptModel = app.get<Model<any>>(getModelToken(Concept.name));
    const concept = await conceptModel.create({
      subjectId,
      name: 'Mole Concept',
      difficulty: 2,
      estimatedMinutes: 30,
      prerequisites: [],
    });
    conceptId = concept._id.toString();

    await request(app.getHttpServer()).post('/api/planner/generate');
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/session/submit invalidates today plan', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const submit = await request(app.getHttpServer())
      .post('/api/session/submit')
      .send({
        conceptId,
        plannedMinutes: 30,
        actualMinutes: 25,
        completionScore: 0.7,
        difficultyFeedback: 3,
        date: today,
      });

    expect([200, 201]).toContain(submit.status);

    const plan = await request(app.getHttpServer()).get('/api/planner/today');
    expect([200, 201]).toContain(plan.status); expect(plan.body.sessions?.length ?? 0).toBe(0);


  });
});
