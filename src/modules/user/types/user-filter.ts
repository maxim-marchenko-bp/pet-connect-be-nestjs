import { GenericFilter } from '../../../shared/types/generic-filter';

export interface UserFilter {
  dateOfBirthFrom: Date;
  dateOfBirthTo: Date;
}

export type UserListFilter = UserFilter & GenericFilter;
