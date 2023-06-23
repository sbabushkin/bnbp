export type FilterTypeOption = 'villa' | 'apartment' | 'hotel/resort' | 'land' | 'commercial'
export type FilterOwnershipOption = 'leasehold' | 'freehold'

// TODO: get from service
export type FilterSourceOption = 'villabalisale.com'
 | 'balivillasales.com'
 | 'suasarealestate.com'
 | 'rumah123.com'
 | 'balivillasales.com'
 | 'propertiabali.com'
 | 'ppbali.com'
 | 'powerbali.com'
 | 'optimumbali.com'
 | 'lazudi.com'
 | 'harcourtspurbabali.com'
 | 'fazwaz.id'
 | 'exotiqproperty.com'
 | 'excelbali.com'
 | 'dotproperty.id'
 | 'balivillasales.com'
 | 'balitreasureproperties.com'
 | 'balirealty.com'
 | 'balimoves.com'
 | 'bali-home-immo.com'
 | 'balivillasales.com'
 | 'balicoconutliving.com'
 | 'anniedeanproperties.com'


export type RateType = {
  amount: number;
  from: string;
  to: string;
  created: string;
}

export type NodeType = {
  id: string;
  name: string;
  source: string;
  url: string;
  propertyType: string;
  ownership: string;
  location: string;
  bedroomsCount: number;
  bathroomsCount: number;
  landSize: string;
  buildingSize: string;
  leaseYearsLeft: string;
  lease: string; // ???
  leaseExpiryYear: string;
  priceIdr: string;
  priceUsd: string;
}

export type MaxValuesType = {
  bedroomsCount?: number;
  bathroomsCount?: number;
  priceUsd?: number;
}

export type AveragesType = {
  pricePerSqm?: number;
  leaseYearsLeft?: number;
  freeholdLandPrice?: number;
  bedroomsCount?: number;
  bathroomsCount?: number;
  buildingSize?: number;
  landSize?: number;
  // priceIdr?: number;
  priceUsd?: number;
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
  ownership: FilterOwnershipOption[];
  source: FilterSourceOption[];
}
