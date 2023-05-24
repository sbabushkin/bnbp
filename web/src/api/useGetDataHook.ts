import { useCallback, useState } from "react";
import { apolloQuery } from "./graphqlClient";
import { gql } from '@apollo/client';
// import { mockData } from "../helpers/mock";
import { IData } from "../helpers/constants";

export interface FilterType {
  type?: Array<'villa' | 'apartment' | 'house' | 'land'>;
  location?: string;
  bedroomsCount?: number;
  bathroomsCount?: number;
  priceUsd?: [number, number];
  ownership?: 'leasehold' | 'freehold';
}

interface MaxValues {
  bedroomsCount?: number;
  bathroomsCount?: number;
  priceUsd?: number;
}

export const propertiesQuery = gql`
  query GetProperties($filter: PropertyFilter) {
    propertiesConnection(filter: $filter) {
      aggregates {
        max {
          bedroomsCount
          bathroomsCount
          priceUsd
        }
        average {
          pricePerSqm
        }
      }
      nodes {
        id
        name
        source
        propertyType
        ownership
        location
        bathroomsCount
        bedroomsCount
        landSize
        buildingSize
        priceIdr
        priceUsd
      }
    }
  }
`;



const useGetDataHook = () => {
  const [data, setData] = useState<IData[]>([])
  const [max, setMax] = useState<MaxValues>({})
  const [pricePerSqm, setPricePerSqm] = useState<number | null>(null)
  const [filters, setFilters] = useState<FilterType>({
    type: ['villa', 'apartment', 'house', 'land'],
    ownership: 'leasehold',
  })

  const fetchData = useCallback(async (newFilters: any) => {
    const queryFilter: any = {}

    if(newFilters.type?.length) {
      queryFilter.propertyType = { in: newFilters.type };
    }

    if(newFilters.location) {
      queryFilter.location = { includesInsensitive: newFilters.location };
    }

    if(newFilters.bedroomsCount) {
      queryFilter.bedroomsCount = { greaterThanOrEqualTo: newFilters.bedroomsCount }
    }

    if(newFilters.bathroomsCount) {
      queryFilter.bathroomsCount = { greaterThanOrEqualTo: newFilters.bathroomsCount }
    }

    if(newFilters.priceUsd) {
      queryFilter.priceUsd = {
        lessThanOrEqualTo: newFilters.priceUsd[0],
        greaterThanOrEqualTo: newFilters.priceUsd[1],
      }
    }

    if(newFilters.ownership) {
      queryFilter.ownership = { equalTo: newFilters.ownership }
    }

    const data = await apolloQuery<any, any>({ query: propertiesQuery, variables: {filter: queryFilter} });
    setMax(data?.propertiesConnection?.aggregates?.max ?? {})
    setData(data?.propertiesConnection?.nodes ?? [])
    setPricePerSqm(data?.propertiesConnection?.aggregates?.average?.pricePerSqm ?? null)
  }, [])

  return { max, data, fetchData, setFilters, filters, pricePerSqm }
}

export default useGetDataHook
