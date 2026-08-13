import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUrl,
  ValidateIf,
  Length,
  MaxLength,
} from 'class-validator';

const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v.length === 0 ? undefined : v;
};

const trimStringArray = ({ value }: { value: unknown }) => {
  if (!Array.isArray(value)) return value;
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
};

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Transform(trimToUndefined)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trimToUndefined)
  designation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trimToUndefined)
  organisation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(trimToUndefined)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trimToUndefined)
  highestEducation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trimToUndefined)
  experience?: string;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(trimToUndefined)
  gender?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @MaxLength(50, { each: true })
  @Transform(trimStringArray)
  techStack?: string[];

  @IsOptional()
  @Transform(trimToUndefined)
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @IsUrl()
  bannerUrl?: string;
}
