import { Body, Controller, Post } from '@nestjs/common';
import { PetService } from './pet.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { CreatePetDto } from './dto/create-pet.dto';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  createPet(
    @AuthUser('sub') userId: number,
    @Body() createPetDto: CreatePetDto,
  ) {
    return this.petService.createPet(userId, createPetDto);
  }
}
