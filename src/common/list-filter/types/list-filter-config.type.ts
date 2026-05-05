export type ListFilterConfigMap<ListFilter = any, FilteredEntity = any> = {
  [Key in keyof ListFilter]: ListFilterConfig<FilteredEntity> | string;
};

export interface ListFilterConfig<FilteredEntity = any> {
  field: keyof FilteredEntity;
  operator?: string;
  type?: ListFilterConfigType;
}

export type ListFilterConfigType = 'string' | 'number' | 'date' | 'boolean';
