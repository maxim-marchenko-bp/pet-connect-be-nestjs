import { toPublicCoOwner } from './to-public-co-owner';
import { User } from '../../user/user.entity';

describe('toPublicCoOwner', () => {
  it('never includes the password or any other credential field', () => {
    const user = {
      id: 1,
      email: 'owner@example.test',
      name: 'Owner',
      lastname: 'Ownerson',
      password: 'secret-hash',
      dateOfBirth: new Date('1990-01-01'),
      pets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    const coOwner = toPublicCoOwner(user);

    expect(coOwner).toEqual({ id: 1, name: 'Owner' });
    expect(coOwner).not.toHaveProperty('password');
    expect(coOwner).not.toHaveProperty('email');
  });
});
