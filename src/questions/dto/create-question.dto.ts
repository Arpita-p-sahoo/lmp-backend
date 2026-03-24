import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @MinLength(10)
  title: string;

  @IsString()
  techTag: string;

  @IsArray()
  @IsOptional()
  hashtags?: string[];
}
