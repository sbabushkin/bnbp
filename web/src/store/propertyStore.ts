import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  AveragesType,
  FilterOwnershipOption,
  FilterType,
  FilterTypeOption,
  MaxValuesType,
  NodeType,
} from './filterTypes';
import { fetchDataApi } from '../api/getPropertyApi';

interface PropertyStore {
  filters: FilterType;
  nodes: NodeType[];
  maxValues: MaxValuesType;
  average: AveragesType;

  actions: {
    upType: (newTypeList: FilterTypeOption[]) => void;
    upLocation: (locations: { value: string, groupBy: string }[]) => void;
    upRoomCount: (num: number | null, type: 'bedroomsCount' | 'bathroomsCount') => void;
    upPrice: (value: [number, number]) => void;
    upOwnership: (option: FilterOwnershipOption) => void;
    reset: () => void;
    fetchData: () => void;
  }
}

const initialFilters: FilterType = {
  type: ['villa', 'house', 'land', 'apartment'],
  locations: [],
  bedroomsCount: null,
  bathroomsCount: null,
  priceUsd: null,
  ownership: 'leasehold',
}

export const usePropertyStore = create<PropertyStore>()(
  devtools(
    (set, get) => ({
      nodes: [],
      maxValues: {},
      average: {},
      filters: initialFilters,
      actions: {
        upType: (newTypeList) => set((state) => ({ filters: {...state.filters, type: newTypeList} })),
        upLocation: (locations) => set((state) => ({ filters: {...state.filters, locations} })),
        upRoomCount: (num, type) => set((state) => ({ filters: {...state.filters, [type]: num} })),
        upPrice: (value) => set((state) => ({ filters: {...state.filters, priceUsd: value} })),
        upOwnership: (option) => set((state) => ({ filters: {...state.filters, ownership: option} })),
        reset: () => set({ filters: initialFilters }),
        fetchData: async () => {
          const { filters } = get()
          const { nodes, aggregates } = await fetchDataApi(filters)
          console.log('data in fetch data func', aggregates)
          set({ nodes, maxValues: aggregates.max || {}, average: aggregates.average || {} })
        }
      }
    }),
    { name: 'filters-storage' }
  )
)