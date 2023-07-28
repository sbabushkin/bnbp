import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  AveragesType,
  FilterOwnershipOption, FilterSourceOption,
  FilterType,
  FilterTypeOption,
  MaxValuesType,
  NodeType, RateType,
} from './filterTypes';
import { fetchDataApi } from '../api/getPropertyApi';
import { UpdatePropertyInput, updatePropertyApi } from '../api/updatePropertyApi';

interface PropertyStore {
  filters: FilterType;
  nodes: NodeType[];
  rates: RateType[];
  sources: FilterSourceOption[];
  maxValues: MaxValuesType;
  average: AveragesType;

  actions: {
    upType: (newTypeList: FilterTypeOption[]) => void;
    upLocation: (locations: { value: string, groupBy: string }[]) => void;
    upRoomCount: (num: number[] | null, type: 'bedroomsCount' | 'bathroomsCount') => void;
    upPrice: (value: [number, number]) => void;
    upOwnership: (newOptions: FilterOwnershipOption[]) => void;
    upSource: (newSourceOptions: FilterSourceOption[]) => void;
    upValid: (value: boolean) => void;
    reset: () => void;
    fetchData: () => void;
    updateProperty: (input: UpdatePropertyInput) => void;
  }
}

const initialFilters: FilterType = {
  type: [],
  locations: [],
  source: [],
  bedroomsCount: [],
  bathroomsCount: [],
  priceUsd: null,
  ownership: [],
  isValid: true
}

export const usePropertyStore = create<PropertyStore>()(
  devtools(
    (set, get) => ({
      nodes: [],
      rates: [],
      maxValues: {},
      average: {},
      sources:[],
      filters: initialFilters,
      actions: {
        upType: (newTypeList) => set((state) => ({ filters: {...state.filters, type: newTypeList} })),
        upLocation: (locations) => set((state) => ({ filters: {...state.filters, locations} })),
        upRoomCount: (num, type) => set((state) => ({
           filters: {...state.filters, [type]: num} 
        })),
        upValid: (value) => set((state)=> ({filters: {...state.filters, isValid: value}})),
        upPrice: (value) => set((state) => ({ filters: {...state.filters, priceUsd: value} })),
        upOwnership: (newOptions) => set((state) => ({ filters: {...state.filters, ownership: newOptions} })),
        upSource: (sourceOptions) => set((state) => ({ filters: {...state.filters, source: sourceOptions} })),
        reset: () => set({ filters: initialFilters }),
        fetchData: async () => {
          const { filters } = get()
          const { nodes, aggregates, rates, sources } = await fetchDataApi(filters)
          set({ nodes, rates, sources: sources, maxValues: aggregates.max || {}, average: aggregates.average || {}})
        },
        updateProperty: async (input) => {
          const data = await updatePropertyApi(input)

          set((state) => ({
            nodes: state.nodes.map((node) => {
              if(node.id === data.id) {
                return data
              } else {
                return node
              }
            })
          }))
        }
      }
    }),
    { name: 'filters-storage' }
  )
)
