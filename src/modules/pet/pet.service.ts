import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { PetType } from '../pet-type/pet-type.entity';
import { User } from '../user/user.entity';
import { PetTypeService } from '../pet-type/pet-type.service';
import { UserService } from '../user/user.service';
import { ListFilterService } from '../../common/list-filter/services/list-filter.service';
import { PetListFilter } from './types/pet-filter';
import { PetPublic } from './types/pet-public.type';
import { CreatePetDto } from './dto/create-pet.dto';
import { toPublicPet } from './mappers/to-public-pet';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    private readonly petTypeService: PetTypeService,
    private readonly userService: UserService,
    private readonly filterService: ListFilterService<PetListFilter, PetPublic>,
  ) {}

  async createPet(
    creatorId: number,
    createPetDto: CreatePetDto,
  ): Promise<PetPublic> {
    const petType = await this.assertPetTypeExists(createPetDto.typeId);

    const pet = this.petRepository.create({
      name: createPetDto.name,
      dateOfBirth: createPetDto.dateOfBirth,
      type: petType,
      users: [{ id: creatorId } as User],
    });
    const savedPet = await this.petRepository.save(pet);

    const reloadedPet = await this.petRepository.findOne({
      where: { id: savedPet.id },
      relations: ['type'],
    });

    return toPublicPet(reloadedPet);
  }

  private async assertPetTypeExists(typeId: number): Promise<PetType> {
    try {
      return await this.petTypeService.getById(typeId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Pet type does not exist');
      }
      throw error;
    }
  }

  async assertCoOwner(petId: number, callerId: number): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { id: petId },
      relations: ['users'],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const isMember = pet.users.some((user) => user.id === callerId);
    if (!isMember) {
      throw new ForbiddenException('Not a co-owner of this pet');
    }

    return pet;
  }
}
