import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { toPublicUser } from './mappers/to-public-user';
import { UserFilter } from './types/user-filter';
import { FilterService } from '../../common/filter/services/filter.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly filterService: FilterService,
  ) {}

  async getCurrentPublicUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return toPublicUser(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async getFilteredUsersList(filters: UserFilter) {
    try {
      const searchFields = this.filterService.generateSearchFields<User>(
        'name',
        'lastname',
      );
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      const paginatedQueryBuilder =
        this.filterService.applyGenericFilters<User>(
          filters,
          queryBuilder,
          searchFields,
        );

      const [data, totalCount] = await paginatedQueryBuilder.getManyAndCount();
      return { data, totalCount };
    } catch (error) {
      throw new Error(error);
    }
  }
}
