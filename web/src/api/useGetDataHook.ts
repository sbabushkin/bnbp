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

  const fetchData = useCallback(async () => {
    const queryFilter: any = {}

    if(filters.type?.length) {
      queryFilter.propertyType = { in: filters.type };
    }

    if(filters.location) {
      queryFilter.location = { includesInsensitive: filters.location };
    }

    if(filters.bedroomsCount) {
      queryFilter.bedroomsCount = { greaterThanOrEqualTo: filters.bedroomsCount }
    }

    if(filters.bathroomsCount) {
      queryFilter.bathroomsCount = { greaterThanOrEqualTo: filters.bathroomsCount }
    }

    if(filters.priceUsd) {
      queryFilter.priceUsd = {
        lessThanOrEqualTo: filters.priceUsd[0],
        greaterThanOrEqualTo: filters.priceUsd[1],
      }
    }

    const data = await apolloQuery<any, any>({ query: propertiesQuery, variables: {filter: queryFilter} });
    setMax(data?.propertiesConnection?.aggregates?.max ?? {})
    setData(data?.propertiesConnection?.nodes ?? [])
  }, [filters])

  return { max, data, fetchData, setFilters, filters }
}

export default useGetDataHook
