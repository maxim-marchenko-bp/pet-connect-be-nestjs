import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

const CREDENTIAL_FIELDS = ['password', 'email'];

describe('Response-shape privacy (QG-3, e2e)', () => {
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

  it('POST /api/pets never embeds the co-owner list', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rex', dateOfBirth: '2020-01-01', typeId: petType.id })
      .expect(201);

    expect(response.body).not.toHaveProperty('users');
  });

  it('GET /api/pets/:id never embeds the co-owner list', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [user]);
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .get(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).not.toHaveProperty('users');
  });

  it('GET /api/pets/list never embeds any co-owner list or credentials', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    await newPet(app, petType, [user]);
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .get('/api/pets/list')
      .query({ page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    response.body.data.forEach((pet: Record<string, unknown>) => {
      expect(pet).not.toHaveProperty('users');
    });
  });

  it('GET /api/pets/:id/co-owners never exposes a password or other credential field', async () => {
    const user = await newUser(app, {
      email: 'secret-holder@example.test',
      password: 'super-secret-hash',
    });
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [user]);
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .get(`/api/pets/${pet.id}/co-owners`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    response.body.data.forEach((coOwner: Record<string, unknown>) => {
      CREDENTIAL_FIELDS.forEach((field) => {
        expect(coOwner).not.toHaveProperty(field);
      });
      expect(Object.keys(coOwner).sort()).toEqual(['id', 'name']);
    });
  });

  it('POST /api/pets/:id/co-owners never exposes a password or other credential field', async () => {
    const owner = await newUser(app);
    const target = await newUser(app, {
      email: 'target-secret@example.test',
      password: 'another-secret-hash',
    });
    const petType = await newPetType(app);
    const pet = await newPet(app, petType, [owner]);
    const token = signToken(app, owner.id);

    const response = await request(app.getHttpServer())
      .post(`/api/pets/${pet.id}/co-owners`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: target.id })
      .expect(200);

    response.body.data.forEach((coOwner: Record<string, unknown>) => {
      CREDENTIAL_FIELDS.forEach((field) => {
        expect(coOwner).not.toHaveProperty(field);
      });
      expect(Object.keys(coOwner).sort()).toEqual(['id', 'name']);
    });
  });
});
