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

describe('Planner E2E', () => {
  let app: INestApplication;

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
        name: 'Physics',
        examDate: new Date().toISOString(),
        isBacklog: false,
        priorityWeight: 1,
      });

    const subjectId = subjectRes.body.id;
    const conceptModel = app.get<Model<any>>(getModelToken(Concept.name));
    await conceptModel.create({
      subjectId,
      name: 'Kinematics',
      difficulty: 2,
      estimatedMinutes: 30,
      prerequisites: [],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('planner generate/today/panic-toggle', async () => {
    const gen = await request(app.getHttpServer()).post('/api/planner/generate');
    expect([200, 201]).toContain(gen.status);

    const today = await request(app.getHttpServer()).get('/api/planner/today');
    expect([200, 201]).toContain(today.status);

    const toggle = await request(app.getHttpServer())
      .post('/api/planner/panic-toggle')
      .send({ enabled: true });
    expect([200, 201]).toContain(toggle.status);
  });
});
