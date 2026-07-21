import { IsString } from 'class-validator';

export class CreatePetTypeDto {
  @IsString()
  code: string;

  @IsString()
  label: string;
}
