import { Injectable } from '@nestjs/common';
import {
  FilterConfig,
  FilterConfigMap,
  FilterConfigType,
} from '../types/filter-config.type';
import { GenericFilter } from '../../../shared/types/generic-filter';
import { ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { isDefined } from 'class-validator';

@Injectable()
export class FilterService<Filter, FilteredEntity> {
  generateSearchFields(...args: (keyof FilteredEntity)[]) {
    return args;
  }

  normalizeFilters(
    filters: Filter & GenericFilter,
    filterConfig: FilterConfigMap<Filter>,
    searchFields: (keyof FilteredEntity)[],
  ) {
    const paginatedFilters = {
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    };
    const whereConditions = {} as Record<keyof FilteredEntity, any>;

    Object.entries(filterConfig).forEach(
      ([filterField, filterFieldDescription]: [
        string,
        Extract<keyof FilteredEntity, string> | FilterConfig,
      ]) => {
        const { field, operator, type } = this.toFilterConfig(
          filterFieldDescription,
        );
        const value = this.parseValue(filters[filterField], type);
        if (operator === 'eq') {
          whereConditions[field] = value;
        }
        if (operator === 'gte' && isDefined(value)) {
          whereConditions[field] = MoreThanOrEqual(value);
        }
        if (operator === 'lte' && isDefined(value)) {
          whereConditions[field] = LessThanOrEqual(value);
        }
      },
    );

    const where =
      searchFields.length && filters.searchTerm
        ? searchFields.map((searchField) => ({
            ...whereConditions,
            [searchField]: ILike(`%${filters.searchTerm}%`),
          }))
        : [whereConditions];

    return {
      ...paginatedFilters,
      where,
    };
  }

  private parseValue(value: unknown, type: FilterConfigType) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (type === 'number') {
      const parsed = Number(value);
      return isNaN(parsed) ? null : parsed;
    }

    if (type === 'boolean') {
      return value === true || value === 'true';
    }

    return value;
  }

  private toFilterConfig(
    filterFieldDescription:
      | Extract<keyof FilteredEntity, string>
      | FilterConfig<FilteredEntity>,
  ): FilterConfig<FilteredEntity> {
    return typeof filterFieldDescription === 'string'
      ? {
          field: filterFieldDescription,
          operator: 'eq',
          type: 'string',
        }
      : filterFieldDescription;
  }
}
