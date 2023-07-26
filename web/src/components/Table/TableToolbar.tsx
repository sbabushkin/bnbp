import { usePropertyStore } from "../../store/propertyStore";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FiltersDrawer from "../FiltersDrawer";
import Container from "@mui/material/Container";
import { chunkNumberByClass } from "../../utils/formatPrice";
import styles from './Table.module.scss'

export default function TableToolbar() {
  const { average, nodes, rates, filters } = usePropertyStore((state) => state);

  // const priceIdr = average.priceUsd && rates[0]?.amount ? average.priceUsd * rates[0]?.amount : 0;

  // TODO: do it on server side
  const freeholdNodes = nodes.filter((node: any) => node.landSize && (node.ownership == 'freehold'));
  const freeholdNodesLandPriceSum = freeholdNodes.reduce(
    (sum: number, node: any) => node.priceUsd / node.landSize + sum,
    0
  );

  const freeholdAvarageLandPrice = freeholdNodes.length ? freeholdNodesLandPriceSum /  freeholdNodes.length : 0;

  const currencyRate: any = rates[0]?.amount || 0;
  // const pricePerSqm: any = (average.pricePerSqm || 0) * currencyRate;
  const leaseHoldLandPricePerAre: any = average.landSize ? ((average.priceUsd || 0 ) / average.landSize * 100).toString() : 0;
  const leaseHoldLandPricePerAreIdr: any = average.landSize ? ((average.priceUsd || 0) / average.landSize * 100 * currencyRate).toString() : 0;
  const leaseHoldLandPricePerArePerYear: any = average.landSize && average.leaseYearsLeft ? (average.priceUsd || 0 / average.leaseYearsLeft / average.landSize * 100).toString() : 0;
  const leaseHoldLandPricePerArePerYearIdr: any = average.landSize && average.leaseYearsLeft ? (average.priceUsd || 0 / average.leaseYearsLeft / average.landSize * 100 * currencyRate).toString() : 0;
  const freeholdLandPricePerAre: any = freeholdAvarageLandPrice && average.landSize ? (freeholdAvarageLandPrice * 100).toString() : 0;
  const freeholdLandPricePerAreIdr: any = freeholdAvarageLandPrice && average.landSize ? (freeholdAvarageLandPrice * 100 * currencyRate).toString() : 0;


  // const leaseholdBuildingPricePerSqmPerYear: any = average.leaseYearsLeft && average.pricePerSqm ? (average.pricePerSqm / average.leaseYearsLeft) : 0;
  // const filteredBuildingPricePerSqm = nodes
  //   .filter((node: any) => node.buildingSize && node.priceIdr)
  //   .map((node: any) => node.priceIdr / node.buildingSize)
  //   .reduce((aggr, item, index) => {
  //
  //   }, 0);

  return (
    <Toolbar sx={{ pl: { sm: 2 } }}>
      <Container maxWidth={false} disableGutters>
        <Typography variant="h6">
          Filter Results:
        </Typography>


        <div className={styles.avg_wrapper}>
          { filters.type.length > 0 &&
            <Typography variant="caption">
              <strong>Property type:</strong> {filters.type.join(', ')}
            </Typography>
          }
          { filters.source.length > 0 &&
            <Typography variant="caption">
              <strong>Source:</strong> {filters.source.join(', ')}
            </Typography>
          }
          { filters.locations.length > 0 &&
            <Typography variant="caption">
            <strong>Location:</strong> {filters.locations.map(item => item.value).join(', ')}
            </Typography>
          }
          { filters.ownership.length > 0 &&
            <Typography variant="caption">
            <strong>Ownership:</strong> {filters.ownership.map((val: string) => val.charAt(0).toUpperCase() + val.slice(1)).join(', ')}
            </Typography>
          }
          { (filters.bedroomsCount || []).length > 0 &&
            <Typography variant="caption">
            <strong>Bedrooms count:</strong> {(filters.bedroomsCount || []).map(item => item).join(', ')}
            </Typography>
          }
          { (filters.bathroomsCount || []).length > 0 &&
            <Typography variant="caption">
            <strong>Bathrooms count:</strong> {(filters.bathroomsCount || []).map(item => item).join(', ')}
            </Typography>
          }
          <Typography variant="caption">
            <strong>No. of listings:</strong> {chunkNumberByClass(nodes.length.toString())}
          </Typography>
          <Typography variant="caption">
            <strong>Currency rate (USD/IDR):</strong> {chunkNumberByClass(currencyRate).toString()}
          </Typography>
          <Typography variant="caption">
            <strong>Average land size:</strong> {chunkNumberByClass((average.landSize || 0).toString())}
          </Typography>
          <Typography variant="caption">
            <strong>Average building size:</strong> {chunkNumberByClass((average.buildingSize || 0).toString())}
          </Typography>
          <Typography variant="caption">
            <strong>Average price:</strong> ${chunkNumberByClass((average.priceUsd || 0).toString())}
            {/*/ {chunkNumberByClass(priceIdr.toString())}*/}
          </Typography>
          <Typography variant="caption">
            <strong>Average no. of Bedrooms:</strong> {chunkNumberByClass((average.bedroomsCount || 0).toString())}
          </Typography>
          <Typography variant="caption">
            <strong>Average no. of Bathrooms:</strong> {chunkNumberByClass((average.bathroomsCount || 0).toString())}
          </Typography>

          {!filters.ownership.includes('freehold') &&
              <Typography variant="caption" >
                <strong>Average Lease Years:</strong> {chunkNumberByClass((average.leaseYearsLeft || 0).toString())}
              </Typography>
          }

          {average.priceUsd && average.buildingSize &&
            <Typography variant="caption">
              <strong>Average building price per sqm:</strong>
              &nbsp;${chunkNumberByClass((average.priceUsd / average.buildingSize).toString())}
              {/*/ {chunkNumberByClass(pricePerSqm.toString())}*/}
            </Typography>
          }

          {average.priceUsd && average.buildingSize && average.leaseYearsLeft &&
              <Typography variant="caption">
                <strong>Average Leasehold Building price per sqm per year:</strong>
                &nbsp;${chunkNumberByClass((average.priceUsd / average.buildingSize / average.leaseYearsLeft).toString())}
              </Typography>
          }

          {filters.type.includes('land') &&
            <>
              <Typography variant="caption">
                <strong>Average Leasehold Land price per are (100sqm):</strong>
                &nbsp;${chunkNumberByClass(leaseHoldLandPricePerAre.toString())}
                &nbsp;/ {chunkNumberByClass(leaseHoldLandPricePerAreIdr.toString())}
              </Typography>
              <Typography variant="caption">
                <strong>Average Leasehold Land price per are per year(100sqm):</strong>
                &nbsp;${chunkNumberByClass(leaseHoldLandPricePerArePerYear.toString())}
                &nbsp;/ {chunkNumberByClass(leaseHoldLandPricePerArePerYearIdr.toString())}
              </Typography>
              <Typography variant="caption">
                <strong>Average Freehold Land price per are (100sqm):</strong>
                &nbsp;${chunkNumberByClass(freeholdLandPricePerAre.toString())}
                &nbsp;/ {chunkNumberByClass(freeholdLandPricePerAreIdr.toString())}
              </Typography>
            </>
          }

        </div>
      </Container>

      <FiltersDrawer />
    </Toolbar>
  );
}
