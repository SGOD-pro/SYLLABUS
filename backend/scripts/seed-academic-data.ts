import 'reflect-metadata';
import { connect, Types } from 'mongoose';
import { getSubjectsForDegree } from '../../frontend/src/data/subjects';
import { User, UserSchema } from '../src/users/user.schema';
import { Subject } from '../src/subjects/subject.schema';
import { Concept } from '../src/concepts/concept.schema';

const SYSTEM_CLERK_ID = 'system-seed';
const SYSTEM_EMAIL = 'system@syllabus.local';
const SYSTEM_NAME = 'System Seed';

const DEGREE_LIST = ['B.Tech', 'M.Tech', 'MSc', 'BSc'] as const;

const DEFAULT_EXAM_DAYS_AHEAD = 30;

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to run seed script');
  }

  await connect(mongoUri);

  const user = await User.(
    { clerkId: SYSTEM_CLERK_ID },
    {
      clerkId: SYSTEM_CLERK_ID,
      email: SYSTEM_EMAIL,
      name: SYSTEM_NAME,
    },
    { upsert: true, new: true },
  );

  for (const degree of DEGREE_LIST) {
    const templates = getSubjectsForDegree(degree);
    for (const template of templates) {
      const examDate = new Date(
        Date.now() + DEFAULT_EXAM_DAYS_AHEAD * 24 * 60 * 60 * 1000,
      );

      const subject = await Subject.findOneAndUpdate(
        { userId: user._id, name: template.name, systemDefined: true },
        {
          userId: user._id,
          name: template.name,
          examDate,
          isBacklog: false,
          priorityWeight: 1,
          systemDefined: true,
        },
        { upsert: true, new: true },
      );

      const conceptIdsByName = new Map<string, Types.ObjectId>();

      for (const conceptTemplate of template.concepts) {
        const existing = await Concept.findOneAndUpdate(
          {
            subjectId: subject._id,
            name: conceptTemplate.name,
            systemDefined: true,
          },
          {
            subjectId: subject._id,
            name: conceptTemplate.name,
            difficulty: conceptTemplate.difficulty,
            estimatedMinutes: conceptTemplate.estimatedMinutes,
            systemDefined: true,
          },
          { upsert: true, new: true },
        );
        conceptIdsByName.set(conceptTemplate.name, existing._id);
      }

      for (let i = 0; i < template.concepts.length; i += 1) {
        const conceptTemplate = template.concepts[i];
        const conceptId = conceptIdsByName.get(conceptTemplate.name);
        if (!conceptId) continue;

        const prereqName =
          i > 0 ? template.concepts[i - 1].name : null;
        const prereqId = prereqName
          ? conceptIdsByName.get(prereqName)
          : undefined;

        await Concept.updateOne(
          { _id: conceptId },
          { $set: { prerequisites: prereqId ? [prereqId] : [] } },
        );
      }
    }
  }
}

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  });
