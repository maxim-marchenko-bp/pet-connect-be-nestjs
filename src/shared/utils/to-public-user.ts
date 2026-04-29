import { UserInternal } from '../../modules/user/types/user-internal.type';
import { UserPublic } from '../../modules/user/types/user-public.type';

export const toPublicUser = (user: UserInternal): UserPublic => {
  const { password: _, ...publicUserData } = user;
  return publicUserData;
};
