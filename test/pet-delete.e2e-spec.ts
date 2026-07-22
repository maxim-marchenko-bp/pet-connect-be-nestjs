import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('DELETE /api/pets/:id (e2e)', () => {
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

  it('AC-07: denies a non-co-owner and the pet remains', async () => {
    const owner = await newUser(app);
    const stranger = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, stranger.id);

    await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    const dataSource = app.get(DataSource);
    const rows = await dataSource.query('SELECT * FROM "pet" WHERE id = $1', [
      pet.id,
    ]);
    expect(rows).toHaveLength(1);
  });

  it('AC-07b: a co-owner removes the pet for all co-owners and clears membership', async () => {
    const owner = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const dataSource = app.get(DataSource);
    const petRows = await dataSource.query(
      'SELECT * FROM "pet" WHERE id = $1',
      [pet.id],
    );
    expect(petRows).toHaveLength(0);

    const membershipRows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [pet.id],
    );
    expect(membershipRows).toHaveLength(0);
  });

  it('AC-12: 404s on a missing pet', async () => {
    const user = await newUser(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .delete('/api/pets/999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
