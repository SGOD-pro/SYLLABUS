import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';
import { StudyPlan, StudyPlanSchema } from './study-plan.schema';
import { StudyPlanRepository } from './study-plan.repository';
import { UsersModule } from '../users/users.module';
import { ProfileModule } from '../profile/profile.module';
import { SubjectsModule } from '../subjects/subject.module';
import { ConceptsModule } from '../concepts/concept.module';
import { SessionModule } from '../sessions/session.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudyPlan.name, schema: StudyPlanSchema },
    ]),
    UsersModule,
    ProfileModule,
    SubjectsModule,
    ConceptsModule,
    SessionModule,
  ],
  controllers: [PlannerController],
  providers: [PlannerService, StudyPlanRepository],
  exports: [PlannerService, StudyPlanRepository],
})
export class PlannerModule {}
