import { Module } from '@nestjs/common';
import { SubjectsModule } from '../subjects/subject.module';
import { UsersModule } from '../users/users.module';
import { SyllabusController } from './syllabus.controller';
import { SyllabusService } from './syllabus.service';

@Module({
  imports: [UsersModule, SubjectsModule],
  controllers: [SyllabusController],
  providers: [SyllabusService],
})
export class SyllabusModule {}
