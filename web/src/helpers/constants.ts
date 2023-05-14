export interface IData {
  id: string;
  name: string;
  source: string;
  propertyType: string;
  bedroomsSize: number;
  bedroomsCount: number;
  bathroomsCount: number;
  priceIdr: string;
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
    id: 'propertyType',
    label: 'Type',
  },
  {
    id: 'bedroomsSize',
    label: 'Rooms size',
  },
  {
    id: 'bedroomsCount',
    label: 'Bedrooms',
  },
  {
    id: 'bathroomsCount',
    label: 'Bathrooms',
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