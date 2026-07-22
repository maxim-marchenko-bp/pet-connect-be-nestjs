import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPet, newPetType, newUser } from './support/fixtures';

describe('Write-path authorization and not-found consistency (QG-1, e2e)', () => {
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

  const writePaths: {
    name: string;
    request: (
      appInstance: INestApplication,
      petId: number,
      token: string,
      extraUserId?: number,
    ) => request.Test;
  }[] = [
    {
      name: 'PUT /api/pets/:id',
      request: (appInstance, petId, token) =>
        request(appInstance.getHttpServer())
          .put(`/api/pets/${petId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'X', dateOfBirth: '2021-01-01', typeId: 1 }),
    },
    {
      name: 'DELETE /api/pets/:id',
      request: (appInstance, petId, token) =>
        request(appInstance.getHttpServer())
          .delete(`/api/pets/${petId}`)
          .set('Authorization', `Bearer ${token}`),
    },
    {
      name: 'POST /api/pets/:id/co-owners',
      request: (appInstance, petId, token, extraUserId) =>
        request(appInstance.getHttpServer())
          .post(`/api/pets/${petId}/co-owners`)
          .set('Authorization', `Bearer ${token}`)
          .send({ userId: extraUserId }),
    },
    {
      name: 'DELETE /api/pets/:id/co-owners/:userId',
      request: (appInstance, petId, token, extraUserId) =>
        request(appInstance.getHttpServer())
          .delete(`/api/pets/${petId}/co-owners/${extraUserId}`)
          .set('Authorization', `Bearer ${token}`),
    },
  ];

  it.each(writePaths)(
    '$name denies a non-co-owner with 403 and leaves membership unchanged',
    async ({ request: makeRequest }) => {
      const owner = await newUser(app);
      const stranger = await newUser(app);
      const extraUser = await newUser(app);
      const petType = await newPetType(app);
      const pet = await newPet(app, petType, [owner]);
      const token = signToken(app, stranger.id);

      const response = await makeRequest(app, pet.id, token, extraUser.id);

      expect(response.status).toBe(403);
    },
  );

  it.each(writePaths)(
    '$name 404s on a missing pet — never disguised as a 403',
    async ({ request: makeRequest }) => {
      const user = await newUser(app);
      const extraUser = await newUser(app);
      const token = signToken(app, user.id);

      const response = await makeRequest(app, 999999, token, extraUser.id);

      expect(response.status).toBe(404);
    },
  );
});
