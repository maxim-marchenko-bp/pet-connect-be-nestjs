import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('GET/POST /api/pets/:id/co-owners (e2e)', () => {
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

  it('AC-08: returns each co-owner identity without any credential field', async () => {
    const owner = await newUser(app, { name: 'Owner One' });
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    const response = await request(app.getHttpServer())
      .get(`/api/pets/${pet.id}/co-owners`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      data: [{ id: owner.id, name: 'Owner One' }],
    });
  });

  it('AC-12: 404s viewing co-owners of a missing pet', async () => {
    const user = await newUser(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .get('/api/pets/999999/co-owners')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('AC-09: denies a non-co-owner adding a co-owner, membership unchanged', async () => {
    const owner = await newUser(app);
    const stranger = await newUser(app);
    const target = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, stranger.id);

    await request(app.getHttpServer())
      .post(`/api/pets/${pet.id}/co-owners`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: target.id })
      .expect(403);

    const dataSource = app.get(DataSource);
    const rows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [pet.id],
    );
    expect(rows).toHaveLength(1);
  });

  it('AC-09b: a co-owner adds a new user, extending membership', async () => {
    const owner = await newUser(app);
    const target = await newUser(app, { name: 'New Co-owner' });
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    const response = await request(app.getHttpServer())
      .post(`/api/pets/${pet.id}/co-owners`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: target.id })
      .expect(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        { id: owner.id, name: owner.name },
        { id: target.id, name: 'New Co-owner' },
      ]),
    );

    const dataSource = app.get(DataSource);
    const rows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [pet.id],
    );
    expect(rows).toHaveLength(2);
  });

  it('AC-09c: adding an already-a-member co-owner is idempotent', async () => {
    const owner = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    await request(app.getHttpServer())
      .post(`/api/pets/${pet.id}/co-owners`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: owner.id })
      .expect(200);

    const dataSource = app.get(DataSource);
    const rows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [pet.id],
    );
    expect(rows).toHaveLength(1);
  });
});
