export interface UserInternal {
  id: number;
  email: string;
  password: string;
  name: string;
  lastname?: string;
  dateOfBirth?: Date;
}
