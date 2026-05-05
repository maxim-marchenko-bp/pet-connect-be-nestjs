import { IsDateString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  name: string;

  @IsOptional()
  lastname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth: Date;
}
