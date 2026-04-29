import { UserInternal } from './user-internal.type';

export type UserPublic = Omit<UserInternal, 'password'>;
