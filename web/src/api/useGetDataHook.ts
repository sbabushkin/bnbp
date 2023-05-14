import { useEffect, useState } from "react";
import { apolloQuery } from "./graphqlClient";
import { gql } from '@apollo/client';
import { mockData } from "../helpers/mock";
import { IData } from "../helpers/constants";

export const propertiesQuery = gql`
  query GetProperties {
    properties {
      id
      name
      source
      propertyType
      bedroomsSize
      bedroomsCount
      priceIdr
      priceUsd
      propertyPrices {
        id
        priceIdr
        priceUsd
        created
      }
    }
  }
`;


const useGetDataHook = () => {
  const [data, setData] = useState<IData[]>([])
  useEffect(() => {
    const fetchData = async () => {
      const data = await apolloQuery<any, any>({query: propertiesQuery});
      // if(!data?.properties?.length) {
      //   data = mockData
      // }

      setData(data.properties)
    }

    fetchData().catch(console.error);

  }, [])

  return data
}

export default useGetDataHook
