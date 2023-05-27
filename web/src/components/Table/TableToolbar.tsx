import { usePropertyStore } from "../../store/propertyStore";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FiltersDrawer from "../FiltersDrawer";
import Container from "@mui/material/Container";
import { chunkNumberByClass } from "../../utils/formatPrice";

export default function TableToolbar() {
  const ownership = usePropertyStore((state) => state.filters.ownership);
  const pricePerSqm = usePropertyStore((state) => state.average.pricePerSqm);

  return (
    <Toolbar sx={{ pl: { sm: 2 } }}>
      <Container>
        <Typography variant="subtitle2">Ownership: <strong>{ownership}</strong></Typography>
        <Typography variant="h6">
          Average price per sqm: <strong>{chunkNumberByClass(pricePerSqm || '0')}</strong>
        </Typography>
      </Container>

      <FiltersDrawer />
    </Toolbar>
  );
}