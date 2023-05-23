export interface IData {
  id: string;
  name: string;
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

interface IHeadCell {
  id: keyof IData;
  label: string;
}

export const headCells: readonly IHeadCell[] = [
  {
    id: 'name',
    label: 'Name',
  },
  {
    id: 'source',
    label: 'Source',
  },
  {
    id: 'ownership',
    label: 'Ownership',
  },
  {
    id: 'propertyType',
    label: 'Type',
  },
  {
    id: 'location',
    label: 'Area',
  },
  {
    id: 'bathroomsCount',
    label: 'Bathrooms',
  },
  {
    id: 'bedroomsCount',
    label: 'Bedrooms',
  },
  {
    id: 'landSize',
    label: 'Land Size',
  },
  {
    id: 'buildingSize',
    label: 'Building Size',
  },
  {
    id: 'priceIdr',
    label: 'Price Idr',
  },
  {
    id: 'priceUsd',
    label: 'Price Usd',
  },
];
