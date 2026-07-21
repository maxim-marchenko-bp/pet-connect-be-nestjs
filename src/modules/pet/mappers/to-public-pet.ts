import { Pet } from '../pet.entity';
import { PetPublic } from '../types/pet-public.type';

export const toPublicPet = (pet: Pet): PetPublic => {
  const { users: _, ...publicPetData } = pet;
  return publicPetData;
};
