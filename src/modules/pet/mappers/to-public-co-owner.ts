import { User } from '../../user/user.entity';
import { CoOwnerPublic } from '../types/co-owner-public.type';

export const toPublicCoOwner = (user: User): CoOwnerPublic => ({
  id: user.id,
  name: user.name,
});
