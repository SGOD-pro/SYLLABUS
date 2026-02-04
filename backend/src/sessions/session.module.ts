import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionController } from './session.controller';
import { SessionRepository } from './session.repository';
import { SessionService } from './session.service';
import { StudySession, StudySessionSchema } from './session.schema';
import { UsersModule } from '../users/users.module';
import { StudyPlan, StudyPlanSchema } from '../planner/study-plan.schema';
import { StudyPlanRepository } from '../planner/study-plan.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudySession.name, schema: StudySessionSchema },
      { name: StudyPlan.name, schema: StudyPlanSchema },
    ]),
    UsersModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, StudyPlanRepository],
  exports: [SessionRepository],
})
export class SessionModule {}
