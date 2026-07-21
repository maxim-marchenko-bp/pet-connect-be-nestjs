import { IsInt } from 'class-validator';

export class AddCoOwnerDto {
  @IsInt()
  userId: number;
}
