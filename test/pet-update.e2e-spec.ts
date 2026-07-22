import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('PUT /api/pets/:id (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await truncateAll(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('AC-06: denies a non-co-owner and leaves the pet unchanged', async () => {
    const owner = await newUser(app);
    const stranger = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, stranger.id);

    await request(app.getHttpServer())
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Changed', dateOfBirth: '2021-01-01', typeId: petType.id })
      .expect(403);

    const dataSource = app.get(DataSource);
    const [row] = await dataSource.query('SELECT * FROM "pet" WHERE id = $1', [
      pet.id,
    ]);
    expect(row.name).toBe(pet.name);
  });

  it('AC-06b: a co-owner full replacement persists and is returned without a co-owner list', async () => {
    const owner = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    const response = await request(app.getHttpServer())
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rexy', dateOfBirth: '2021-06-15', typeId: petType.id })
      .expect(200);

    expect(response.body).toMatchObject({ id: pet.id, name: 'Rexy' });
    expect(response.body).not.toHaveProperty('users');

    const dataSource = app.get(DataSource);
    const [row] = await dataSource.query('SELECT * FROM "pet" WHERE id = $1', [
      pet.id,
    ]);
    expect(row.name).toBe('Rexy');
  });

  it('AC-03: rejects an unknown pet type', async () => {
    const owner = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    await request(app.getHttpServer())
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rexy', dateOfBirth: '2021-06-15', typeId: 999999 })
      .expect(400);
  });

  it('AC-12: 404s on a missing pet before the authz check runs', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .put('/api/pets/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rexy', dateOfBirth: '2021-06-15', typeId: petType.id })
      .expect(404);
  });
});
