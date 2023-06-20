import { usePropertyStore } from "../../store/propertyStore";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FiltersDrawer from "../FiltersDrawer";
import Container from "@mui/material/Container";
import { chunkNumberByClass } from "../../utils/formatPrice";
import styles from './Table.module.scss'

export default function TableToolbar() {
  const { average, nodes, rates } = usePropertyStore((state) => state);

  const priceIdr = average.priceUsd && rates[0]?.amount ? average.priceUsd * rates[0]?.amount : 0;

  // TODO: do it on server side
  const freeholdNodes = nodes.filter((node: any) => node.landSize && (node.ownership == 'freehold'));
  const freeholdNodesLandPriceSum = freeholdNodes.reduce(
    (sum: number, node: any) => node.priceUsd / node.landSize + sum,
    0
  );

  const freeholdAvarageLandPrice = freeholdNodes.length ? freeholdNodesLandPriceSum /  freeholdNodes.length : 0;

  const currencyRate: any = rates[0]?.amount || 0;
  const pricePerSqm: any = (average.pricePerSqm || 0) * currencyRate;
  const leaseHoldLandPricePerAre: any = average.landSize ? ((average.priceUsd || 0 ) / average.landSize * 100).toString() : 0;
  const leaseHoldLandPricePerAreIdr: any = average.landSize ? ((average.priceUsd || 0) / average.landSize * 100 * currencyRate).toString() : 0;
  const leaseHoldLandPricePerArePerYear: any = average.landSize && average.leaseYearsLeft ? (average.priceUsd || 0 / average.leaseYearsLeft / average.landSize * 100).toString() : 0;
  const leaseHoldLandPricePerArePerYearIdr: any = average.landSize && average.leaseYearsLeft ? (average.priceUsd || 0 / average.leaseYearsLeft / average.landSize * 100 * currencyRate).toString() : 0;
  const freeholdLandPricePerAre: any = freeholdAvarageLandPrice && average.landSize ? (freeholdAvarageLandPrice * 100).toString() : 0;
  const freeholdLandPricePerAreIdr: any = freeholdAvarageLandPrice && average.landSize ? (freeholdAvarageLandPrice * 100 * currencyRate).toString() : 0;


  const leaseholdBuildingPricePerSqmPerYear: any = average.leaseYearsLeft && average.pricePerSqm ? (average.pricePerSqm / average.leaseYearsLeft) : 0;
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
          Averages:
        </Typography>
        <div className={styles.avg_wrapper}>
          <Typography variant="caption">
            Count units: <strong>{chunkNumberByClass(nodes.length.toString())}</strong>
          </Typography>
          <Typography variant="caption">
            Currency rate (USD/IDR): <strong>{chunkNumberByClass(currencyRate.toString())}</strong>
          </Typography>
          <Typography variant="caption">
            Land size: <strong>{chunkNumberByClass((average.landSize || 0).toString())}</strong>
          </Typography>
          <Typography variant="caption">
            Building size: <strong>{chunkNumberByClass((average.buildingSize || 0).toString())}</strong>
          </Typography>
          <Typography variant="caption">
            Price: <strong>${chunkNumberByClass((average.priceUsd || 0).toString())} / <strong>{chunkNumberByClass(priceIdr.toString())}</strong></strong>
          </Typography>
          <Typography variant="caption">
            No. of Bedrooms: <strong>{chunkNumberByClass((average.bedroomsCount || 0).toString())}</strong>
          </Typography>
          <Typography variant="caption">
            No. of Bathrooms: <strong>{chunkNumberByClass((average.bathroomsCount || 0).toString())}</strong>
          </Typography>

          <Typography variant="caption">
            Price per sqm:
            <strong>
              &nbsp;${chunkNumberByClass((average.pricePerSqm || 0).toString())} / {chunkNumberByClass(pricePerSqm.toString())}
            </strong>
          </Typography>



          <Typography variant="caption">
            Lease Years: <strong>{chunkNumberByClass((average.leaseYearsLeft || 0).toString())}</strong>
          </Typography>
          <Typography variant="caption">
            Leasehold Building price per sqm per year:
            <strong>
              &nbsp;${chunkNumberByClass(leaseholdBuildingPricePerSqmPerYear.toString())}
            </strong>
          </Typography>

          <Typography variant="caption">
            Leasehold Land price per are (100sqm):
            <strong>
              &nbsp;${chunkNumberByClass(leaseHoldLandPricePerAre.toString())}
              &nbsp;/ {chunkNumberByClass(leaseHoldLandPricePerAreIdr.toString())}
            </strong>
          </Typography>

          <Typography variant="caption">
            Leasehold Land price per are per year(100sqm):
            <strong>
              &nbsp;${chunkNumberByClass(leaseHoldLandPricePerArePerYear.toString())}
              &nbsp;/ {chunkNumberByClass(leaseHoldLandPricePerArePerYearIdr.toString())}
            </strong>
          </Typography>


          <Typography variant="caption">
            Freehold Land price per are (100sqm):
            <strong>
              &nbsp;${chunkNumberByClass(freeholdLandPricePerAre.toString())}
              &nbsp;/ {chunkNumberByClass(freeholdLandPricePerAreIdr.toString())}
            </strong>
          </Typography>
        </div>
      </Container>

      <FiltersDrawer />
    </Toolbar>
  );
}
