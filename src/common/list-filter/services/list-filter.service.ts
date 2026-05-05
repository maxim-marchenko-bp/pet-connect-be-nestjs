import { Injectable } from '@nestjs/common';
import {
  ListFilterConfig,
  ListFilterConfigMap,
  ListFilterConfigType,
} from '../types/list-filter-config.type';
import { GenericFilter } from '../../../shared/types/generic-filter';
import { Between, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { isDefined } from 'class-validator';

type GroupedFiltersMapKey<FilteredEntity> = keyof FilteredEntity;
type GroupedFiltersMapValue = (ListFilterConfig & { filterField: string })[];
type WhereConditions<FilteredEntity> = Record<keyof FilteredEntity, any>;
type FilterFieldDescription<FilteredEntity> =
  | Extract<keyof FilteredEntity, string>
  | ListFilterConfig;

@Injectable()
export class ListFilterService<ListFilter, FilteredEntity> {
  generateSearchFields(...args: (keyof FilteredEntity)[]) {
    return args;
  }

  normalizeFilters(
    filters: ListFilter & GenericFilter,
    filterConfig: ListFilterConfigMap<ListFilter>,
    searchFields: (keyof FilteredEntity)[],
  ) {
    const paginatedFilters = {
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    };
    const whereConditions = {} as WhereConditions<FilteredEntity>;
    const groupedFiltersMap = new Map<
      GroupedFiltersMapKey<FilteredEntity>,
      GroupedFiltersMapValue
    >();

    Object.entries(filterConfig).forEach(
      ([filterField, filterFieldDescription]: [
        string,
        FilterFieldDescription<FilteredEntity>,
      ]) => {
        const normalizedFilterConfig = this.toFilterConfig(
          filterFieldDescription,
        );
        this.groupFilters(
          groupedFiltersMap,
          normalizedFilterConfig,
          filterField,
        );
        this.applyWhereConditions(
          filters,
          whereConditions,
          filterField,
          normalizedFilterConfig,
        );
      },
    );

    this.applyRangeFilters(groupedFiltersMap, filters, whereConditions);

    const where = this.buildWhereCondition(
      searchFields,
      filters,
      whereConditions,
    );

    return {
      ...paginatedFilters,
      where,
    };
  }

  private parseValue(value: unknown, type: ListFilterConfigType) {
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
    filterFieldDescription: FilterFieldDescription<FilteredEntity>,
  ): ListFilterConfig<FilteredEntity> {
    return typeof filterFieldDescription === 'string'
      ? {
          field: filterFieldDescription,
          operator: 'eq',
          type: 'string',
        }
      : filterFieldDescription;
  }

  private applyRangeFilters(
    groupedFiltersMap: Map<
      GroupedFiltersMapKey<FilteredEntity>,
      GroupedFiltersMapValue
    >,
    filters: ListFilter & GenericFilter,
    whereConditions: WhereConditions<FilteredEntity>,
  ) {
    groupedFiltersMap.forEach((value, key) => {
      const lteField = value.find((f) => f.operator === 'lte');
      const gteField = value.find((f) => f.operator === 'gte');
      const hasLte = !!(lteField && filters[lteField.filterField]);
      const hasGte = !!(gteField && filters[gteField.filterField]);
      const hasBetween = hasLte && hasGte;
      if (hasBetween) {
        const start = filters[gteField.filterField];
        const end = filters[lteField.filterField];
        whereConditions[key] = Between(start, end);
      }
    });
  }

  private groupFilters(
    groupedFiltersMap: Map<
      GroupedFiltersMapKey<FilteredEntity>,
      GroupedFiltersMapValue
    >,
    normalizedFilterConfig: ListFilterConfig<FilteredEntity>,
    filterField: string,
  ) {
    const { field } = normalizedFilterConfig;
    if (groupedFiltersMap.has(field)) {
      groupedFiltersMap
        .get(field)
        .push({ ...normalizedFilterConfig, filterField });
    } else {
      groupedFiltersMap.set(field, [
        { ...normalizedFilterConfig, filterField },
      ]);
    }
  }

  private applyWhereConditions(
    filters: ListFilter & GenericFilter,
    whereConditions: WhereConditions<FilteredEntity>,
    filterField: string,
    normalizedFilterConfig: ListFilterConfig<FilteredEntity>,
  ) {
    const { field, operator, type } = normalizedFilterConfig;
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
  }

  private buildWhereCondition(
    searchFields: (keyof FilteredEntity)[],
    filters: ListFilter & GenericFilter,
    whereConditions: WhereConditions<FilteredEntity>,
  ) {
    return searchFields.length && filters.searchTerm
      ? searchFields.map((searchField) => ({
          ...whereConditions,
          [searchField]: ILike(`%${filters.searchTerm}%`),
        }))
      : [whereConditions];
  }
}
