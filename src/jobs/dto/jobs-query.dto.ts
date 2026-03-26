import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class JobsQueryDto {
  @IsOptional()
  @IsIn(['Remote', 'Hybrid', 'Onsite'])
  type?: 'Remote' | 'Hybrid' | 'Onsite';

  @IsOptional()
  @IsString()
  techTag?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
