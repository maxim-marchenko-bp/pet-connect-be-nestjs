export type FilterConfigMap<Filter = any, FilteredEntity = any> = {
  [Key in keyof Filter]: FilterConfig<FilteredEntity> | string;
};

export interface FilterConfig<FilteredEntity = any> {
  field: keyof FilteredEntity;
  operator?: string;
  type?: FilterConfigType;
}

export type FilterConfigType = 'string' | 'number' | 'date' | 'boolean';
