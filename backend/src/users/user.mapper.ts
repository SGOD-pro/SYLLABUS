import type { UserDocument } from './user.schema';
import { UserResponseDto } from './user.response.dto';

export class UserMapper {
  static toResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      clerkId: user.clerkId,
      name: user.name,
      degree: user.degree,
      semester: user.semester,
    };
  }
}
