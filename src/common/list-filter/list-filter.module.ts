import { Module } from '@nestjs/common';
import { ListFilterService } from './services/list-filter.service';

@Module({
  providers: [ListFilterService],
  exports: [ListFilterService],
})
export class ListFilterModule {}
