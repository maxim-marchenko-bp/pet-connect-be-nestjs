import { Pet } from '../pet.entity';

export type PetPublic = Omit<Pet, 'users'>;
