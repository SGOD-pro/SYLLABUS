import type { StudyProfileDocument } from './profile.schema';
import { ProfileResponseDto } from './profile.response.dto';

export class ProfileMapper {
  static toResponse(profile: StudyProfileDocument): ProfileResponseDto {
    return {
      id: profile._id.toString(),
      dailyMinutes: profile.dailyMinutes,
      preferredSlots: profile.preferredSlots,
      fatigueThreshold: profile.fatigueThreshold,
      panicMode: profile.panicMode,
    };
  }
}
