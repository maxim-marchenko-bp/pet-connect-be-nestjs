import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('DELETE /api/pets/:id/co-owners/:userId (e2e)', () => {
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

  it('AC-10: blocks removing the last co-owner', async () => {
    const owner = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}/co-owners/${owner.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    const dataSource = app.get(DataSource);
    const rows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [pet.id],
    );
    expect(rows).toHaveLength(1);
  });

  it('AC-11: a co-owner removes another co-owner, membership updated', async () => {
    const owner = await newUser(app);
    const other = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner, other]);
    const token = signToken(app, owner.id);

    const response = await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}/co-owners/${other.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual([{ id: owner.id, name: owner.name }]);
  });

  it('AC-11b: blocks removing a target that is not a co-owner', async () => {
    const owner = await newUser(app);
    const stranger = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}/co-owners/${stranger.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('AC-11c: a co-owner removes themselves (leave)', async () => {
    const owner = await newUser(app);
    const other = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner, other]);
    const token = signToken(app, owner.id);

    const response = await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}/co-owners/${owner.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual([{ id: other.id, name: other.name }]);
  });

  it('AC-09 pattern: denies a non-co-owner removing a co-owner', async () => {
    const owner = await newUser(app);
    const other = await newUser(app);
    const stranger = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner, other]);
    const token = signToken(app, stranger.id);

    await request(app.getHttpServer())
      .delete(`/api/pets/${pet.id}/co-owners/${other.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('AC-12: 404s on a missing pet', async () => {
    const user = await newUser(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .delete(`/api/pets/999999/co-owners/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
