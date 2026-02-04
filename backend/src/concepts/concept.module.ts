import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { SubjectsModule } from '../subjects/subject.module';
import { ConceptsController } from './concept.controller';
import { ConceptsRepository } from './concept.repository';
import { ConceptsService } from './concept.service';
import { Concept, ConceptSchema } from './concept.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Concept.name, schema: ConceptSchema }]),
    UsersModule,
    SubjectsModule,
  ],
  controllers: [ConceptsController],
  providers: [ConceptsService, ConceptsRepository],
  exports: [ConceptsService],
})
export class ConceptsModule {}
