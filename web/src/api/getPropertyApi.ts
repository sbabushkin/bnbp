import { apolloQuery } from "./graphqlClient";
import { gql } from '@apollo/client';
import { FilterOwnershipOption, FilterType, FilterTypeOption } from '../store/filterTypes'

export interface MaxValues {
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
        url
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

type FilterQuery = {
  propertyType?: { in: FilterTypeOption[] };
  ownership?: { in: FilterOwnershipOption[] };
  locations?: { in: string[] };
  bedroomsCount?:  { greaterThanOrEqualTo: number };
  bathroomsCount?:  { greaterThanOrEqualTo: number };
  priceUsd?: { lessThanOrEqualTo: number; greaterThanOrEqualTo: number; };
}

export const fetchDataApi = async (filterStore: FilterType) => {
  const queryFilter: FilterQuery = {
    ...(filterStore.type.length ? { propertyType: { in: filterStore.type } } : {}),
    ...(filterStore.ownership.length ? { ownership: { in: filterStore.ownership } } : {}),
    ...(filterStore.locations.length ? { location: { in: filterStore.locations.map(({value}) => value) } } : {}),
    ...(filterStore.bedroomsCount ? { bedroomsCount: { greaterThanOrEqualTo: filterStore.bedroomsCount } } : {}),
    ...(filterStore.bathroomsCount ? { bathroomsCount: { greaterThanOrEqualTo: filterStore.bathroomsCount } } : {}),
    ...(filterStore.priceUsd ? {
      priceUsd: { lessThanOrEqualTo: filterStore.priceUsd[0], greaterThanOrEqualTo: filterStore.priceUsd[1] }
    } : {}),
  }

  const data = await apolloQuery<any, { filter?: FilterQuery }>({
    query: propertiesQuery,
    variables: Object.keys(queryFilter).length ? { filter: queryFilter } : {},
  });

  return {
    aggregates: data?.propertiesConnection?.aggregates ?? {},
    nodes: data?.propertiesConnection?.nodes ?? []
  }
}
