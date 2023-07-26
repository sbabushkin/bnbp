import { apolloQuery } from "./graphqlClient";
import { gql } from '@apollo/client';
import { FilterOwnershipOption, FilterSourceOption, FilterType, FilterTypeOption } from '../store/filterTypes'

export interface MaxValues {
  bedroomsCount?: number;
  bathroomsCount?: number;
  priceUsd?: number;
}

export const propertiesQuery = gql`
  query GetProperties($filter: PropertyFilter) {
    
    currencyRates(first:1, orderBy: CREATED_DESC, filter: {
      from: {
        equalTo: "USD"
      }
    }) {
      amount
      from
      to
      created
    }
    
    propertiesConnection(filter: $filter) {
      aggregates {
        max {
          bedroomsCount
          bathroomsCount
          priceUsd
        }
        average {
          pricePerSqm
          bedroomsCount
          bathroomsCount
          leaseYearsLeft
          landSize
          buildingSize
          priceIdr
          priceUsd
          freeholdLandPrice
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
        leaseYearsLeft
        leaseExpiryYear
        priceIdr
        priceUsd
      }
    }
  }
`;

type FilterQuery = {
  propertyType?: { in: FilterTypeOption[] };
  ownership?: { in: FilterOwnershipOption[] };
  source?: { in: FilterSourceOption[] };
  locations?: { in: string[] };
  bedroomsCount?:  { greaterThanOrEqualTo: number };
  bathroomsCount?:  { greaterThanOrEqualTo: number };
  priceUsd?: { lessThanOrEqualTo: number; greaterThanOrEqualTo: number; };
  isValid?: { equalTo: boolean; };
}

export const fetchDataApi = async (filterStore: FilterType) => {
  const queryFilter: FilterQuery = {
    isValid: { equalTo: true },
    ...(filterStore.type.length ? { propertyType: { in: filterStore.type } } : {}),
    ...(filterStore.ownership.length ? { ownership: { in: filterStore.ownership } } : {}),
    ...(filterStore.source.length ? { source: { in: filterStore.source } } : {}),
    ...(filterStore.locations.length ? { location: { in: filterStore.locations.map(({value}) => value) } } : {}),
    ...(filterStore.bedroomsCount.length ? { bedroomsCount: { in: filterStore.bedroomsCount } } : {}),
    ...(filterStore.bathroomsCount.length ? { bathroomsCount: { in: filterStore.bathroomsCount } } : {}),
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
    nodes: data?.propertiesConnection?.nodes ?? [],
    rates: data?.currencyRates ?? []
  }
}
