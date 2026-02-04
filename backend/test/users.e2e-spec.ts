import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/common/guard/clerk-auth.guard';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { User } from '../src/users/user.schema';

class MockClerkAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { clerkId: 'test-clerk-id' };
    return true;
  }
}

describe('Users E2E', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/users/me returns user', async () => {
    const res = await request(app.getHttpServer()).get('/api/users/me');
    expect([200, 201]).toContain(res.status);
    expect(res.body.clerkId).toBe('test-clerk-id');
  });
});
