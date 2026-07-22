import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './pet.entity';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { ListFilterModule } from '../../common/list-filter/list-filter.module';
import { PetTypeModule } from '../pet-type/pet-type.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet]),
    ListFilterModule,
    PetTypeModule,
    UserModule,
  ],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
