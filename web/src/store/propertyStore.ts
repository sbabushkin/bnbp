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
    upType: (type: FilterTypeOption, checked: boolean) => void;
    upLocation: (location: string) => void;
    upRoomCount: (num: number, type: 'bedroomsCount' | 'bathroomsCount') => void;
    upPrice: (value: [number, number]) => void;
    upOwnership: (option: FilterOwnershipOption) => void;
    reset: () => void;
    fetchData: () => void;
  }
}

const initialFilters: FilterType = {
  type: ['villa', 'house', 'land', 'apartment'],
  location: '',
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
        upType: (type, checked) => {
          if(checked) {
            return set((state) => ({
              filters: {
                ...state.filters,
                type: [...state.filters.type, type],
              }
            }))
          } else {
            return set((state) => ({
              filters: {
                ...state.filters,
                type: state.filters.type.filter((s: string) => s !== type),
              }
            }))
          }
        },
        upLocation: (location) => set((state) => ({ filters: {...state.filters, location} })),
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