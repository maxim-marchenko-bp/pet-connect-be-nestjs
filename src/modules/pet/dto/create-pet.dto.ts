import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxDate,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const endOfTodayUtc = () => {
  const date = new Date();
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

export class CreatePetDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Type(() => Date)
  @IsDate()
  @MaxDate(endOfTodayUtc)
  dateOfBirth: Date;

  @IsInt()
  typeId: number;
}
