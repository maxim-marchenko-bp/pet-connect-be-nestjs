import { UserInternal } from '../types/user-internal.type';
import { UserPublic } from '../types/user-public.type';

export const toPublicUser = (user: UserInternal): UserPublic => {
  const { password: _, ...publicUserData } = user;
  return publicUserData;
};
