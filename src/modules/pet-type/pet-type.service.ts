import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetType } from './pet-type.entity';
import { CreatePetTypeDto } from './dto/create-pet-type.dto';
import { UpdatePetTypeDto } from './dto/update-pet-type.dto';

@Injectable()
export class PetTypeService {
  constructor(
    @InjectRepository(PetType)
    private readonly petTypeRepository: Repository<PetType>,
  ) {}

  getAll() {
    return this.petTypeRepository.find();
  }

  async getById(id: number) {
    const petType = await this.petTypeRepository.findOne({ where: { id } });
    if (!petType) {
      throw new NotFoundException('Pet type not found');
    }
    return petType;
  }

  create(createPetTypeDto: CreatePetTypeDto) {
    const petType = this.petTypeRepository.create(createPetTypeDto);
    return this.petTypeRepository.save(petType);
  }

  async update(id: number, updatePetTypeDto: UpdatePetTypeDto) {
    await this.petTypeRepository.update({ id }, updatePetTypeDto);
    return this.petTypeRepository.findOne({ where: { id } });
  }

  delete(id: number) {
    return this.petTypeRepository.delete({ id });
  }
}
