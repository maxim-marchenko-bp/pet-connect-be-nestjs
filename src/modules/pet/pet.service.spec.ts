import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PetService } from './pet.service';
import { Pet } from './pet.entity';
import { PetTypeService } from '../pet-type/pet-type.service';
import { UserService } from '../user/user.service';
import { ListFilterService } from '../../common/list-filter/services/list-filter.service';

describe('PetService.assertCoOwner', () => {
  let service: PetService;
  let petRepository: jest.Mocked<Repository<Pet>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetService,
        {
          provide: getRepositoryToken(Pet),
          useValue: { findOne: jest.fn() },
        },
        { provide: PetTypeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: ListFilterService, useValue: {} },
      ],
    }).compile();

    service = module.get(PetService);
    petRepository = module.get(getRepositoryToken(Pet));
  });

  it('throws NotFoundException when the pet does not exist', async () => {
    petRepository.findOne.mockResolvedValue(null);

    await expect(service.assertCoOwner(1, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when the caller is not a member', async () => {
    petRepository.findOne.mockResolvedValue({
      id: 1,
      users: [{ id: 2 }],
    } as Pet);

    await expect(service.assertCoOwner(1, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns the loaded pet when the caller is a member', async () => {
    const pet = { id: 1, users: [{ id: 1 }, { id: 2 }] } as Pet;
    petRepository.findOne.mockResolvedValue(pet);

    await expect(service.assertCoOwner(1, 1)).resolves.toBe(pet);
  });
});
