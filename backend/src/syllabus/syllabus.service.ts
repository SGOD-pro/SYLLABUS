import { Injectable } from '@nestjs/common';

@Injectable()
export class SyllabusService {
  normalizeTopics(rawText: string) {
    const parts = (rawText || '')
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    const seen = new Set<string>();
    const topics: { name: string; difficulty: number; estimatedMinutes: number }[] = [];

    for (const topic of parts) {
      const key = topic.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const wordCount = topic.split(/\s+/).filter(Boolean).length;
      const difficulty = Math.min(5, Math.max(1, Math.ceil(wordCount / 2)));
      const estimatedMinutes = Math.min(180, Math.max(20, 20 + difficulty * 15));

      topics.push({ name: topic, difficulty, estimatedMinutes });
    }

    return topics;
  }

  async analyzeConcepts(
    subjectId: string,
    topics: { name: string; difficulty: number; estimatedMinutes: number }[],
  ) {
    // Rule-based stand-in for AI enrichment. Must be non-blocking and safe.
    return topics.map((topic) => {
      const name = topic.name.trim();
      const lower = name.toLowerCase();

      let difficulty = topic.difficulty;
      if (/(advanced|complex|optimization|proof|analysis)/.test(lower)) {
        difficulty = Math.min(5, difficulty + 1);
      } else if (/(intro|basics|fundamentals|overview)/.test(lower)) {
        difficulty = Math.max(1, difficulty - 1);
      }

      let estimatedMinutes = topic.estimatedMinutes;
      if (difficulty >= 4) {
        estimatedMinutes = Math.min(240, estimatedMinutes + 15);
      } else if (difficulty <= 2) {
        estimatedMinutes = Math.max(15, estimatedMinutes - 5);
      }

      const isHighWeight =
        difficulty >= 4 ||
        /(design|architecture|graph|tree|compiler|database|os|network)/.test(
          lower,
        );

      const reason = isHighWeight
        ? 'High priority based on topic complexity'
        : 'Standard priority based on topic complexity';

      return {
        name,
        difficulty,
        estimatedMinutes,
        isHighWeight,
        reason,
      };
    });
  }

  async parseSyllabus(rawText: string, subjectId: string) {
    const base = this.normalizeTopics(rawText);

    try {
      const enriched = await this.analyzeConcepts(subjectId, base);
      return enriched;
    } catch (err) {
      return base.map((topic) => ({
        ...topic,
        isHighWeight: false,
        reason: 'Fallback to rule-based normalization',
      }));
    }
  }
}
