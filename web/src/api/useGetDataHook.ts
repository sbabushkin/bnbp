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
      }
      nodes {
        id
        name
        source
        propertyType
        bedroomsSize
        bedroomsCount
        priceIdr
        priceUsd
      }
    }
  }
`;



const useGetDataHook = () => {
  const [data, setData] = useState<IData[]>([])
  const [max, setMax] = useState<MaxValues>({})
  const [filters, setFilters] = useState<FilterType>({
    type: ['villa', 'apartment', 'house', 'land']
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

    const data = await apolloQuery<any, any>({ query: propertiesQuery, variables: {filter: queryFilter} });
    setMax(data?.propertiesConnection?.aggregates?.max ?? {})
    setData(data?.propertiesConnection?.nodes ?? [])
  }, [])

  return { max, data, fetchData, setFilters, filters }
}

export default useGetDataHook
