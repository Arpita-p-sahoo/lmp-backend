import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

const lowerTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  @Transform(lowerTrim)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  @Matches(/.*\S.*/, { message: 'password must not be empty' })
  password: string;
}
