import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { Concept, type ConceptDocument } from './concept.schema';

export interface ConceptCreateInput {
  subjectId: ConceptDocument['subjectId'];
  name: string;
  difficulty: number;
  estimatedMinutes: number;
  prerequisites?: Types.ObjectId[];
}

@Injectable()
export class ConceptsRepository {
  constructor(
    @InjectModel(Concept.name)
    private readonly conceptModel: Model<ConceptDocument>,
  ) {}

  async bulkCreate(
    concepts: ConceptCreateInput[],
  ){
    return this.conceptModel.insertMany(concepts);
  }

  async findBySubjectId(
    subjectId: ConceptDocument['subjectId'],
  ): Promise<ConceptDocument[]> {
    return this.conceptModel.find({ subjectId }).exec();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<ConceptDocument[]> {
    return this.conceptModel.find({ _id: { $in: ids } }).exec();
  }

  async findById(id: Types.ObjectId): Promise<ConceptDocument | null> {
    return this.conceptModel.findById(id).exec();
  }

  async findPrerequisites(
    conceptId: ConceptDocument['_id'],
  ): Promise<ConceptDocument['prerequisites']> {
    const concept = await this.conceptModel
      .findById(conceptId, { prerequisites: 1 })
      .exec();
    return concept?.prerequisites ?? [];
  }
}
