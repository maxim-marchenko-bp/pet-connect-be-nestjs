import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PetTypeService } from './pet-type.service';
import { CreatePetTypeDto } from './dto/create-pet-type.dto';
import { UpdatePetTypeDto } from './dto/update-pet-type.dto';

@Controller('pet-types')
export class PetTypeController {
  constructor(private readonly petTypeService: PetTypeService) {}

  @Get()
  getAll() {
    return this.petTypeService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: number) {
    return this.petTypeService.getById(id);
  }

  @Post()
  create(@Body() createPetTypeDto: CreatePetTypeDto) {
    return this.petTypeService.create(createPetTypeDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updatePetTypeDto: UpdatePetTypeDto) {
    return this.petTypeService.update(id, updatePetTypeDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.petTypeService.delete(id);
  }
}
