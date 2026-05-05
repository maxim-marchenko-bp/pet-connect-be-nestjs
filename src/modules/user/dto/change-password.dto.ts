import { IsDefined, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsDefined()
  currentPassword: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  newPassword: string;
}
