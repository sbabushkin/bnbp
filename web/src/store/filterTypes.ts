export type FilterTypeOption = 'villa' | 'apartment' | 'house' | 'land'
export type FilterOwnershipOption = 'leasehold' | 'freehold'

export type NodeType = {
  id: string;
  name: string;
  url: string;
  source: string;
  location: string;
  ownership: string;
  propertyType: string;
  bedroomsCount: number;
  bathroomsCount: number;
  priceIdr: string;
  landSize: string;
  buildingSize: string;
  priceUsd: string;
}

export type MaxValuesType = {
  bedroomsCount?: number;
  bathroomsCount?: number;
  priceUsd?: number;
}

export type AveragesType = {
  pricePerSqm?: string;
}

export interface FilterType {
  type: FilterTypeOption[];
  locations: {
    value: string;
    groupBy: string;
  }[];
  bedroomsCount: number | null;
  bathroomsCount: number | null;
  priceUsd: [number, number] | null;
  ownership: FilterOwnershipOption;
}
