import { toPublicPet } from './to-public-pet';
import { Pet } from '../pet.entity';
import { User } from '../../user/user.entity';

describe('toPublicPet', () => {
  it('never includes the co-owner list', () => {
    const pet = {
      id: 1,
      name: 'Rex',
      dateOfBirth: new Date('2020-01-01'),
      type: { id: 1, code: 'dog', label: 'Dog' },
      users: [{ id: 1, password: 'secret' } as User],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pet;

    const publicPet = toPublicPet(pet);

    expect(publicPet).not.toHaveProperty('users');
    expect(publicPet.name).toBe('Rex');
    expect(publicPet.type).toEqual({ id: 1, code: 'dog', label: 'Dog' });
  });
});
