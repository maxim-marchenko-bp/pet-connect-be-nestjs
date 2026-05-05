import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { toPublicUser } from './mappers/to-public-user';
import { UserFilter, UserListFilter } from './types/user-filter';
import { ListFilterService } from '../../common/list-filter/services/list-filter.service';
import { ListFilterConfigMap } from '../../common/list-filter/types/list-filter-config.type';
import { UserPublic } from './types/user-public.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly filterService: ListFilterService<UserFilter, UserPublic>,
  ) {}

  async getCurrentPublicUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    return toPublicUser(user);
  }

  async getFilteredUsersList(filters: UserListFilter) {
    const searchFields = this.filterService.generateSearchFields(
      'name',
      'lastname',
    );
    const filterConfig: ListFilterConfigMap<UserFilter, UserPublic> = {
      dateOfBirthFrom: {
        field: 'dateOfBirth',
        operator: 'gte',
        type: 'date',
      },
      dateOfBirthTo: {
        field: 'dateOfBirth',
        operator: 'lte',
        type: 'date',
      },
    };
    const normalizedFilters = this.filterService.normalizeFilters(
      filters,
      filterConfig,
      searchFields,
    );

    const [data, totalCount] =
      await this.userRepository.findAndCount(normalizedFilters);
    return { data, totalCount };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    return toPublicUser(user);
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return toPublicUser(savedUser);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id }, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return toPublicUser(updatedUser);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }
}
