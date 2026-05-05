import { IsDate, IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  name: string;

  @IsOptional()
  lastname: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 0,
  })
  password: string;

  @IsOptional()
  @IsDate()
  dateOfBirth: Date;
}
