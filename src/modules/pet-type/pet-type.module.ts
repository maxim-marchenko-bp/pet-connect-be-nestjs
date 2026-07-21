import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetType } from './pet-type.entity';
import { PetTypeService } from './pet-type.service';
import { PetTypeController } from './pet-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PetType])],
  controllers: [PetTypeController],
  providers: [PetTypeService],
  exports: [PetTypeService],
})
export class PetTypeModule {}
