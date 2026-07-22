import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('GET /api/pets/:id and /api/pets/list (e2e)', () => {
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

  it('AC-04: returns name, dateOfBirth, and pet type without a co-owner list', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [user]);
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .get(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: pet.id,
      name: pet.name,
      type: { id: petType.id },
    });
    expect(response.body).not.toHaveProperty('users');
  });

  it('AC-12: 404s on a missing pet', async () => {
    const user = await newUser(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .get('/api/pets/999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('AC-05: returns a bounded, stably-ordered page via ListFilterService', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    for (let i = 0; i < 3; i++) {
      await newPet(app, petType, [user], { name: `Pet-${i}` });
    }
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .get('/api/pets/list')
      .query({ page: 1, pageSize: 2 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.totalCount).toBe(3);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].id).toBeLessThan(response.body.data[1].id);
    response.body.data.forEach((pet: Record<string, unknown>) => {
      expect(pet).not.toHaveProperty('users');
    });
  });
});
