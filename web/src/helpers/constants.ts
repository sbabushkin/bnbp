import { FilterTypeOption } from "../store/filterTypes";

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

export const propertyTypeOptions: FilterTypeOption[] = ['villa', 'apartment', 'hotel/resort', 'land', 'commercial']

export const locationOptions = [
{value: 'Amed', groupBy: ''},
{value: 'Balian', groupBy: ''},
{value: 'Batu Belig', groupBy: ''},
{value: 'Karangasem', groupBy: ''},
{value: 'Kedungu', groupBy: ''},
{value: 'Kerobokan', groupBy: ''},
{value: 'Ketewel', groupBy: ''},
{value: 'Kuta', groupBy: ''},
{value: 'Lovina', groupBy: ''},
{value: 'Medewi', groupBy: ''},
{value: 'Megwi', groupBy: ''},
{value: 'North Bali', groupBy: ''},
{value: 'Pecatu', groupBy: ''},
{value: 'Saba', groupBy: ''},
{value: 'Sanur', groupBy: ''},
{value: 'Sukawati', groupBy: ''},
{value: 'Umalas', groupBy: ''},
{value: 'Bukit', groupBy: 'Bukit'},
{value: 'Balangan', groupBy: 'Bukit'},
{value: 'Bingin', groupBy: 'Bukit'},
{value: 'Jimbaran', groupBy: 'Bukit'},
{value: 'Nusa Dua', groupBy: 'Bukit'},
{value: 'Padang Padang', groupBy: 'Bukit'},
{value: 'Pecatu', groupBy: 'Bukit'},
{value: 'Uluwatu', groupBy: 'Bukit'},
{value: 'Ungasan', groupBy: 'Bukit'},
{value: 'Buwit', groupBy: 'Buwit'},
{value: 'Tabanan', groupBy: 'Buwit'},
{value: 'Canggu', groupBy: 'Canggu'},
{value: 'Babakan', groupBy: 'Canggu'},
{value: 'Batu Bolong', groupBy: 'Canggu'},
{value: 'Berawa', groupBy: 'Canggu'},
{value: 'Cemagi', groupBy: 'Canggu'},
{value: 'Echo Beach', groupBy: 'Canggu'},
{value: 'Kayu Tulang', groupBy: 'Canggu'},
{value: 'Nelayan', groupBy: 'Canggu'},
{value: 'North', groupBy: 'Canggu'},
{value: 'Nyanyi', groupBy: 'Canggu'},
{value: 'Padonan', groupBy: 'Canggu'},
{value: 'Pantai Lima', groupBy: 'Canggu'},
{value: 'Pererenan', groupBy: 'Canggu'},
{value: 'Seseh', groupBy: 'Canggu'},
{value: 'Tiying Tutul', groupBy: 'Canggu'},
{value: 'Tumbak Bayuh', groupBy: 'Canggu'},
{value: 'Other Islands', groupBy: 'Other Islands'},
{value: 'Lombok', groupBy: 'Other Islands'},
{value: 'Sumba', groupBy: 'Other Islands'},
{value: 'Seminyak', groupBy: 'Seminyak'},
{value: 'Batu Belig', groupBy: 'Seminyak'},
{value: 'Drupadi', groupBy: 'Seminyak'},
{value: 'Legian', groupBy: 'Seminyak'},
{value: 'Oberoi', groupBy: 'Seminyak'},
{value: 'Petitenget', groupBy: 'Seminyak'},
{value: 'Tabanan', groupBy: 'Tabanan'},
{value: 'Kedungu', groupBy: 'Tabanan'},
{value: 'Tanah Lot', groupBy: 'Tabanan'},
{value: 'Ubud', groupBy: 'Ubud'},
{value: 'Central', groupBy: 'Ubud'},
{value: 'Other', groupBy: 'Ubud'},
{value: 'Sayan', groupBy: 'Ubud'},
{value: 'Tegalalang', groupBy: 'Ubud'},
{value: 'Tegallalang', groupBy: 'Ubud'},
]
