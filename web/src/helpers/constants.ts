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
  // {
  //   id: 'ownership',
  //   label: 'Ownership',
  // },
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
    label: 'Baths',
  },
  {
    id: 'bedroomsCount',
    label: 'Beds',
  },
  {
    id: 'landSize',
    label: 'Land Size',
  },
  {
    id: 'buildingSize',
    label: 'Build Size',
  },
  {
    id: 'priceIdr',
    label: 'Idr',
  },
  {
    id: 'priceUsd',
    label: 'Usd',
  },
];
