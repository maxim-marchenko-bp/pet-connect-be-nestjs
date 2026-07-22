import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, signToken, truncateAll } from './support/test-app';
import { newPetType, newUser } from './support/fixtures';

describe('POST /api/pets (e2e)', () => {
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

  it('AC-01: persists the pet, adds the creator as first co-owner, and returns the pet without a co-owner list', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const token = signToken(app, user.id);

    const response = await request(app.getHttpServer())
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rex', dateOfBirth: '2020-01-01', typeId: petType.id })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Rex',
      type: { id: petType.id },
    });
    expect(response.body).not.toHaveProperty('users');

    const dataSource = app.get(DataSource);
    const petRows = await dataSource.query('SELECT * FROM "pet"');
    expect(petRows).toHaveLength(1);

    const membershipRows = await dataSource.query(
      'SELECT * FROM "user_pets" WHERE "pet_id" = $1',
      [petRows[0].id],
    );
    expect(membershipRows).toEqual([
      { user_id: user.id, pet_id: petRows[0].id },
    ]);
  });

  it('AC-02: rejects an empty name and writes no row', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', dateOfBirth: '2020-01-01', typeId: petType.id })
      .expect(400);

    const dataSource = app.get(DataSource);
    const petRows = await dataSource.query('SELECT * FROM "pet"');
    expect(petRows).toHaveLength(0);
  });

  it('AC-02: rejects a date of birth later than today and writes no row', async () => {
    const user = await newUser(app);
    const petType = await newPetType(app);
    const token = signToken(app, user.id);
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    await request(app.getHttpServer())
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Rex',
        dateOfBirth: tomorrow.toISOString().slice(0, 10),
        typeId: petType.id,
      })
      .expect(400);

    const dataSource = app.get(DataSource);
    const petRows = await dataSource.query('SELECT * FROM "pet"');
    expect(petRows).toHaveLength(0);
  });

  it('AC-03: rejects an unknown pet type', async () => {
    const user = await newUser(app);
    const token = signToken(app, user.id);

    await request(app.getHttpServer())
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rex', dateOfBirth: '2020-01-01', typeId: 999999 })
      .expect(400);

    const dataSource = app.get(DataSource);
    const petRows = await dataSource.query('SELECT * FROM "pet"');
    expect(petRows).toHaveLength(0);
  });
});
