import { IsBoolean, IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { FeedbackType } from './feedback.schema';
// import { FeedbackType } from './feedback.types';

export class ConceptFeedbackRequestDto {
  @IsMongoId()
  conceptId: string;

  @IsEnum(FeedbackType)
  feedbackType: FeedbackType;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string | null;

  @IsOptional()
  @IsMongoId()
  sessionId?: string | null;
}

export class ConceptFeedbackResponseDto {
  @IsBoolean()
  ok: boolean;
}
