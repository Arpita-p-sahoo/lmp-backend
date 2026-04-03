import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUrl,
  ValidateIf,
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
  address?: string;

  @IsOptional()
  @IsString()
  highestEducation?: string;

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
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  bannerUrl?: string;
}
