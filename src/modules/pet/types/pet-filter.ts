import { GenericFilter } from '../../../shared/types/generic-filter';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PetFilter {}

export type PetListFilter = PetFilter & GenericFilter;
