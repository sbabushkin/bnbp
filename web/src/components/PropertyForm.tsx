import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Zoom from '@mui/material/Zoom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { FC, useMemo } from 'react';
import { usePropertyStore } from '../store/propertyStore';
import { NodeType } from '../store/filterTypes';

const style = {
  zIndex: 1,
  width: 400,
  bgcolor: 'background.paper',
  padding: '50px 40px',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

type PropertyFormType = {
  openId: string | null;
  setOpenId: (val: string | null) => void;
}

export const PropertyForm: FC<PropertyFormType> = ({ openId, setOpenId }) => {
  const nodes = usePropertyStore((store) => store.nodes)

  const nodesFields = useMemo(() => {
    const findNode = nodes.find((node) => node.id === openId)

    return findNode || {} as NodeType
  }, [openId, nodes])

  return (
      <Modal
        open={!!openId}
        onClose={() => setOpenId(null)}
      >
        <Zoom in={!!openId}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6">
              Change fields
            </Typography>
            <TextField defaultValue={nodesFields.bathroomsCount} variant="outlined" label="Baths" type='number' />
            <TextField defaultValue={nodesFields.bedroomsCount} variant="outlined" label="Beds" type='number' />
            <TextField defaultValue={nodesFields.landSize} variant="outlined" label="Land size" type='number' />
            <TextField defaultValue={nodesFields.buildingSize} variant="outlined" label="Build size" type='number' />
            <TextField defaultValue={nodesFields.priceIdr} variant="outlined" label="Price Idr" type='number' />
            <TextField defaultValue={nodesFields.priceUsd} variant="outlined" label="Price Usd" type='number' />

            <Stack spacing={2} direction="row" minWidth={'100%'}>
              <Button fullWidth variant='contained' onClick={() => setOpenId(null)}>Save</Button>
              <Button fullWidth variant='outlined' onClick={() => setOpenId(null)}>Close</Button>
            </Stack>
          </Box>
        </Zoom>
      </Modal>
  );
}

export default PropertyForm;