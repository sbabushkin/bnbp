import { usePropertyStore } from "../../store/propertyStore";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FiltersDrawer from "../FiltersDrawer";
import Container from "@mui/material/Container";
import { chunkNumberByClass } from "../../utils/formatPrice";
import styles from './Table.module.scss'

export default function TableToolbar() {
  const average = usePropertyStore((state) => state.average);

  return (
    <Toolbar sx={{ pl: { sm: 2 } }}>
      <Container maxWidth={false} disableGutters>
        <Typography variant="h6">
          Averages:
        </Typography>
        <div className={styles.avg_wrapper}>
          <Typography variant="caption">
            Count units: <strong>{chunkNumberByClass('1256')}</strong>
          </Typography>
          <Typography variant="caption">
            Price per sqm: <strong>{chunkNumberByClass(average.pricePerSqm || '0')}</strong>
          </Typography>
          <Typography variant="caption">
            Land size: <strong>{chunkNumberByClass('101010')}</strong>
          </Typography>
          <Typography variant="caption">
            Building size: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Price IDR: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Price USD: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            No. of Bedrooms: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Building price per sqm: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Building price per sqm per year: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Leasehold Land price per are (100sqm), IDR: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Leasehold Land price per are (100sqm), USD: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Freehold Land price per are (100sqm), IDR: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
          <Typography variant="caption">
            Freehold Land price per are (100sqm), USD: <strong>{chunkNumberByClass('1002030')}</strong>
          </Typography>
        </div>
      </Container>

      <FiltersDrawer />
    </Toolbar>
  );
}
