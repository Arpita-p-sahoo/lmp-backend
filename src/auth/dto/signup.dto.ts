import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  IsDateString,
  IsUrl,
  IsArray,
  ValidateIf,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

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
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];
}
