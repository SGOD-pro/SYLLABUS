import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/common/guard/clerk-auth.guard';
import request from 'supertest';

class MockClerkAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { clerkId: 'test-clerk-id' };
    return true;
  }
}

describe('AI E2E', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/ai/explain-plan returns explanationText', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app.getHttpServer())
      .post('/api/ai/explain-plan')
      .send({
        yesterdayPlan: null,
        todayPlan: {
          date: today,
          sessions: [
            { conceptId: 'c1', plannedMinutes: 30, order: 1 },
          ],
        },
        profile: { dailyMinutes: 60, panicMode: false },
        recentSessions: [],
      });

    expect([200, 201]).toContain(res.status);
    expect(typeof res.body.explanationText).toBe('string');
    expect(res.body.explanationText.length).toBeGreaterThan(0);
  },30000);

  it('POST /api/ai/parse-syllabus returns parsed output', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/ai/parse-syllabus')
      .send({ rawText: 'Math, Physics\nChemistry' });

    expect([200, 201]).toContain(res.status);
    expect(Array.isArray(res.body.extractedTopics)).toBe(true);
    expect(Array.isArray(res.body.structuredConcepts)).toBe(true);
    expect(res.body.needsConfirmation).toBe(true);
  });
});
