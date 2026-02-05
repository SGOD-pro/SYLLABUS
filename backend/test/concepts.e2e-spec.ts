import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/common/guard/clerk-auth.guard';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { User } from '../src/users/user.schema';
import { Subject } from 'src/subjects/subject.schema';
import { Concept } from 'src/concepts/concept.schema';

class MockClerkAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { clerkId: 'test-clerk-id' };
    return true;
  }
}

describe('Concepts E2E', () => {
  let app: INestApplication;
  let subjectId: string;
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
    const subjectModel = app.get<Model<any>>(getModelToken(Subject.name));
    const conceptModel = app.get<Model<any>>(getModelToken(Concept.name));

    await subjectModel.deleteMany({});
    await conceptModel.deleteMany({});
    const subjectRes = await request(app.getHttpServer())
      .post('/api/subjects')
      .send({
        name: 'Math',
        examDate: new Date().toISOString(),
        isBacklog: false,
        priorityWeight: 1,
      });

    expect([200, 201]).toContain(subjectRes.status);
    subjectId = subjectRes.body.id;
    expect(subjectId).toBeDefined();
    // expect(subjectRes.body.userId).toBeDefined();

  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/concepts/bulk creates concepts', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/concepts/bulk')
      .send({
        subjectId, // ← MUST be a real ObjectId created in THIS test
        concepts: [
          {
            name: 'Derivatives',
            difficulty: 3,
            estimatedMinutes: 45,
            prerequisites: [],
          },
          {
            name: 'Integrals',
            difficulty: 4,
            estimatedMinutes: 60,
            prerequisites: [],
          },
        ],
      });

    expect([200, 201]).toContain(res.status);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('Derivatives');
  });

});
