import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { AddCoOwnerDto } from './dto/add-co-owner.dto';
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

  @Delete(':id')
  deletePet(@Param('id') id: number, @AuthUser('sub') userId: number) {
    return this.petService.deletePet(id, userId);
  }

  @Get(':id/co-owners')
  getCoOwners(@Param('id') id: number) {
    return this.petService.getCoOwners(id);
  }

  @Post(':id/co-owners')
  @HttpCode(200)
  addCoOwner(
    @Param('id') id: number,
    @AuthUser('sub') userId: number,
    @Body() addCoOwnerDto: AddCoOwnerDto,
  ) {
    return this.petService.addCoOwner(id, userId, addCoOwnerDto.userId);
  }

  @Delete(':id/co-owners/:userId')
  removeCoOwner(
    @Param('id') id: number,
    @Param('userId') targetUserId: number,
    @AuthUser('sub') userId: number,
  ) {
    return this.petService.removeCoOwner(id, userId, targetUserId);
  }
}
