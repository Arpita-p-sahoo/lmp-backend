import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  organisation?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
