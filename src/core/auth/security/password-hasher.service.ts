import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from './password-hasher.interface';

@Injectable()
export class PasswordHasher implements IPasswordHasher {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
