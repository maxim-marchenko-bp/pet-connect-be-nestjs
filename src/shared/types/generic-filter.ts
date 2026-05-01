import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GenericFilter {
  @Transform(({ value }) => Number(value))
  page: number = 1;

  @Transform(({ value }) => Number(value))
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  searchTerm?: string;
}
