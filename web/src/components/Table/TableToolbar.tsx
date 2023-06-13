import { usePropertyStore } from "../../store/propertyStore";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FiltersDrawer from "../FiltersDrawer";
import Container from "@mui/material/Container";
import { chunkNumberByClass } from "../../utils/formatPrice";

export default function TableToolbar() {
  const pricePerSqm = usePropertyStore((state) => state.average.pricePerSqm);

  return (
    <Toolbar sx={{ pl: { sm: 2 } }}>
      <Container maxWidth={false} disableGutters>
        <Typography variant="h6">
          Number of units: <strong>{chunkNumberByClass('1256')}</strong>
        </Typography>
        <Typography variant="h6">
          Average price per sqm: <strong>{chunkNumberByClass(pricePerSqm || '0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average land size: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average building size: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average price IDR: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average price USD: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average no. of Bedrooms: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average Building price per sqm: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average Building price per sqm per year: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average Leasehold Land price per are (100sqm), IDR: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average Leasehold Land price per are (100sqm), USD: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average Freehold Land price per are (100sqm), IDR: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
        <Typography variant="h6">
          Average Freehold Land price per are (100sqm), USD: <strong>{chunkNumberByClass('0')}</strong>
        </Typography>
      </Container>

      <FiltersDrawer />
    </Toolbar>
  );
}
