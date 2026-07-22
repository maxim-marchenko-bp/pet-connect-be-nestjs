import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('DELETE /api/pets/:id/co-owners/:userId — concurrency (e2e)', () => {
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

  it('AC-10b: preserves the no-orphan invariant when two co-owners simultaneously remove each other', async () => {
    const userA = await newUser(app);
    const userB = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [userA, userB]);
    const tokenA = signToken(app, userA.id);
    const tokenB = signToken(app, userB.id);

    const [resultA, resultB] = await Promise.allSettled([
      request(app.getHttpServer())
        .delete(`/api/pets/${pet.id}/co-owners/${userB.id}`)
        .set('Authorization', `Bearer ${tokenA}`),
      request(app.getHttpServer())
        .delete(`/api/pets/${pet.id}/co-owners/${userA.id}`)
        .set('Authorization', `Bearer ${tokenB}`),
    ]);

    const statuses = [resultA, resultB].map((result) =>
      result.status === 'fulfilled' ? result.value.status : -1,
    );

    // Exactly one removal succeeds; the other loses the race — either
    // rejected as the would-be-orphaning removal (409) or, if the winner's
    // removal committed first, the loser is no longer even a co-owner (403).
    expect(statuses.filter((status) => status === 200)).toHaveLength(1);
    expect(
      statuses.filter((status) => status === 409 || status === 403),
    ).toHaveLength(1);

    const dataSource = app.get(DataSource);
    const rows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [pet.id],
    );
    expect(rows).toHaveLength(1);
  });
});
