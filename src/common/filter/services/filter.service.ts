import { Injectable } from '@nestjs/common';
import { FilterConfig } from '../types/filter-config.type';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { GenericFilter } from '../../../shared/types/generic-filter';

@Injectable()
export class FilterService {
  generateSearchFields<T>(...args: (keyof T)[]) {
    return args;
  }

  applyGenericFilters<T>(
    filters: GenericFilter,
    queryBuilder: SelectQueryBuilder<T>,
    searchFields: (keyof T)[] = [],
  ) {
    queryBuilder
      .skip((filters.page - 1) * filters.pageSize)
      .take(filters.pageSize);

    if (searchFields.length) {
      queryBuilder.andWhere(
        new Brackets((qb) =>
          searchFields.map((field, i) =>
            i === 0
              ? qb.andWhere(`${String(field)} ILike :searchTerm`, {
                  searchTerm: `%${filters.searchTerm}%`,
                })
              : qb.orWhere(`${String(field)} ILike :searchTerm`, {
                  searchTerm: `%${filters.searchTerm}%`,
                }),
          ),
        ),
      );
    }
    return queryBuilder;
  }

  applyCustomFilters<T>(
    filters: T,
    filterConfig: FilterConfig,
    queryBuilder: SelectQueryBuilder<T>,
  ) {
    console.log(filters);
    console.log(filterConfig);
    return queryBuilder;
  }
}
