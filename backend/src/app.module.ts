import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { SubjectsModule } from './subjects/subject.module';
import { PlannerModule } from './planner/planner.module';
import { ConceptsModule } from './concepts/concept.module';
import { SessionModule } from './sessions/session.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DbModule,
    UsersModule,
    ProfileModule,
    SubjectsModule,
    ConceptsModule,
    SessionModule,
    PlannerModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
