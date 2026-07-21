import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePetDto } from './create-pet.dto';

const valid = () => ({
  name: 'Rex',
  dateOfBirth: '2020-01-01',
  typeId: 1,
});

describe('CreatePetDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreatePetDto, valid());
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty name', async () => {
    const dto = plainToInstance(CreatePetDto, { ...valid(), name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a whitespace-only name', async () => {
    const dto = plainToInstance(CreatePetDto, { ...valid(), name: '   ' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a name exceeding the maximum length', async () => {
    const dto = plainToInstance(CreatePetDto, {
      ...valid(),
      name: 'a'.repeat(256),
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a date of birth later than today (server UTC date)', async () => {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const dto = plainToInstance(CreatePetDto, {
      ...valid(),
      dateOfBirth: tomorrow.toISOString().slice(0, 10),
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'dateOfBirth')).toBe(true);
  });

  it('accepts a date of birth equal to today (server UTC date)', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const dto = plainToInstance(CreatePetDto, {
      ...valid(),
      dateOfBirth: today,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
