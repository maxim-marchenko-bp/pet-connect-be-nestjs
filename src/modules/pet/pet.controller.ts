import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PetService } from './pet.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetListFilter } from './types/pet-filter';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get('list')
  getPetsList(@Query() query: PetListFilter) {
    return this.petService.getFilteredPetsList(query);
  }

  @Get(':id')
  getPetById(@Param('id') id: number) {
    return this.petService.getPetById(id);
  }

  @Post()
  createPet(
    @AuthUser('sub') userId: number,
    @Body() createPetDto: CreatePetDto,
  ) {
    return this.petService.createPet(userId, createPetDto);
  }

  @Put(':id')
  updatePet(
    @Param('id') id: number,
    @AuthUser('sub') userId: number,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petService.updatePet(id, userId, updatePetDto);
  }
}
