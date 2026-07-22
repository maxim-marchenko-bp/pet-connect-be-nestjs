import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { PetTypeService } from '../pet-type/pet-type.service';
import { UserService } from '../user/user.service';
import { ListFilterService } from '../../common/list-filter/services/list-filter.service';
import { PetListFilter } from './types/pet-filter';
import { PetPublic } from './types/pet-public.type';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    private readonly petTypeService: PetTypeService,
    private readonly userService: UserService,
    private readonly filterService: ListFilterService<PetListFilter, PetPublic>,
  ) {}
}
