import { IsIn } from 'class-validator';

export class ReactCommentDto {
  @IsIn(['like', 'dislike'])
  type: 'like' | 'dislike';
}
