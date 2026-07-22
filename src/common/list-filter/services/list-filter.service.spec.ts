import { ListFilterService } from './list-filter.service';
import { GenericFilter } from '../../../shared/types/generic-filter';

interface Dummy {
  name: string;
}

describe('ListFilterService.normalizeFilters — AC-05 page size bound', () => {
  const service = new ListFilterService<Record<string, never>, Dummy>();

  it('clamps an oversized pageSize to the maximum page size (100)', () => {
    const filters = {
      page: 1,
      pageSize: 100000,
    } as Record<string, never> & GenericFilter;

    const { take } = service.normalizeFilters(filters, {}, []);

    expect(take).toBeLessThanOrEqual(100);
  });

  it('leaves an in-bound pageSize unchanged', () => {
    const filters = {
      page: 1,
      pageSize: 10,
    } as Record<string, never> & GenericFilter;

    const { take } = service.normalizeFilters(filters, {}, []);

    expect(take).toBe(10);
  });
});
