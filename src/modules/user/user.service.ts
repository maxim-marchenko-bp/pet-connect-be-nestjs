import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { toPublicUser } from './mappers/to-public-user';
import { UserFilter, UserListFilter } from './types/user-filter';
import { FilterService } from '../../common/filter/services/filter.service';
import { FilterConfigMap } from '../../common/filter/types/filter-config.type';
import { UserPublic } from './types/user-public.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly filterService: FilterService<UserFilter, UserPublic>,
  ) {}

  async getCurrentPublicUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return toPublicUser(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFilteredUsersList(filters: UserListFilter) {
    try {
      const searchFields = this.filterService.generateSearchFields(
        'name',
        'lastname',
      );
      const filterConfig: FilterConfigMap<UserFilter, UserPublic> = {
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
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserById(id: number) {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
