import { apolloMutation } from "./graphqlClient";
import { gql } from '@apollo/client';

export const propertyMutation = gql`
  mutation UpdateProperty($input: UpdatePropertyInput!) {
    updateProperty(input: $input) {
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
      leaseExpiryYear
    }
  }
`;

export type UpdatePropertyInput = {
  id: string;
  location?: string;
  propertyType?: string;
  bathroomsCount?: number;
  bedroomsCount?: number;
  landSize?: number;
  buildingSize?: number;
  priceIdr?: number;
  priceUsd?: number;
  leaseExpiryYear?: number;
}

export const updatePropertyApi = async (input: UpdatePropertyInput) => {
  const { updateProperty } = await apolloMutation<any, { input: UpdatePropertyInput }>({
    mutation: propertyMutation,
    variables: {
      input
    }
  });

  return updateProperty
}
