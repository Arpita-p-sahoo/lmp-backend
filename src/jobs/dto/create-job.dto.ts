import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  MinLength,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsIn(['Remote', 'Hybrid', 'Onsite'])
  type?: 'Remote' | 'Hybrid' | 'Onsite';

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
