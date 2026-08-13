import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsDateString,
  IsUrl,
  IsArray,
  ValidateIf,
  Matches,
  Length,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v.length === 0 ? undefined : v;
};

const lowerTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const trimStringArray = ({ value }: { value: unknown }) => {
  if (!Array.isArray(value)) return value;
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
};

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  @Transform(lowerTrim)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/, {
    message: 'password must be 8-72 chars and include letters and numbers',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  @Transform(trim)
  name: string;

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
  @Transform(trimToUndefined)
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @MaxLength(50, { each: true })
  @Transform(trimStringArray)
  techStack?: string[];
}
