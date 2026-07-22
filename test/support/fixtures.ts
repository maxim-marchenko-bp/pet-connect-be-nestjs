import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from '../../src/modules/user/user.entity';
import { PetType } from '../../src/modules/pet-type/pet-type.entity';
import { Pet } from '../../src/modules/pet/pet.entity';

export const newUser = async (
  app: INestApplication,
  overrides: Partial<User> = {},
): Promise<User> => {
  const repo = app.get(DataSource).getRepository(User);
  const user = repo.create({
    email: `user-${randomUUID()}@example.test`,
    name: 'Test',
    password: 'not-a-real-hash',
    ...overrides,
  });
  return repo.save(user);
};

export const newPetType = async (
  app: INestApplication,
  overrides: Partial<PetType> = {},
): Promise<PetType> => {
  const repo = app.get(DataSource).getRepository(PetType);
  const petType = repo.create({
    code: `type-${randomUUID()}`,
    label: 'Dog',
    ...overrides,
  });
  return repo.save(petType);
};

export const newPet = async (
  app: INestApplication,
  petType: PetType,
  owners: User[],
  overrides: Partial<Pet> = {},
): Promise<Pet> => {
  const repo = app.get(DataSource).getRepository(Pet);
  const pet = repo.create({
    name: 'Rex',
    dateOfBirth: new Date('2020-01-01'),
    type: petType,
    users: owners,
    ...overrides,
  });
  return repo.save(pet);
};
