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
    }
  }
`;

export type UpdatePropertyInput = {
  id: string;
  location?: string;
  bathroomsCount?: number;
  bedroomsCount?: number;
  landSize?: number;
  buildingSize?: number;
  priceIdr?: number;
  priceUsd?: number;
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
