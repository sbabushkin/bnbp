import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Zoom from '@mui/material/Zoom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import { FC, useCallback, useState } from 'react';
import { usePropertyStore } from '../store/propertyStore';
import { NodeType } from '../store/filterTypes';
import { locationOptions } from '../helpers/constants';
import { UpdatePropertyInput } from '../api/updatePropertyApi';

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
  const node = usePropertyStore((store) => store.nodes.find((node) => node.id === openId) || {} as NodeType)
  const [form, updateForm] = useState<UpdatePropertyInput>({id: ''})
  const { updateProperty } = usePropertyStore((store) => store.actions)

  const handleApply = useCallback(() => {
    const input: UpdatePropertyInput = {
      id: node.id,
      ...(form.location ? { location: form.location } : {}),
      ...(form.propertyType ? { propertyType: form.propertyType } : {}),
      ...(form.bathroomsCount ? { bathroomsCount: Number(form.bathroomsCount) } : {}),
      ...(form.bedroomsCount ? { bedroomsCount: Number(form.bedroomsCount) } : {}),
      ...(form.landSize ? { landSize: Number(form.landSize) } : {}),
      ...(form.buildingSize ? { buildingSize: Number(form.buildingSize) } : {}),
      ...(form.priceIdr ? { priceIdr: Number(form.priceIdr) } : {}),
      ...(form.priceUsd ? { priceUsd: Number(form.priceUsd) } : {}),
    }
    if(Object.values(input).length > 1) {
      updateProperty(input)
    }
    setOpenId(null)
    updateForm({id: ''})
  }, [setOpenId, updateProperty, node, form])

  const useFieldChange = (fieldName: keyof NodeType) => useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    updateForm((prev) => ({ ...prev, [fieldName]: e.target.value }))
  }, [fieldName])

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
          <Autocomplete
            options={locationOptions}
            groupBy={(opt) => opt.groupBy}
            getOptionLabel={(option) => option.value}
            defaultValue={{value: node.location, groupBy: ''}}
            filterSelectedOptions
            fullWidth
            disableClearable
            onChange={(_, elem) => updateForm((prev) => ({ ...prev, location: elem?.value || '' }))}
            renderInput={(params) => (<TextField {...params} label="Location" placeholder="search" />)}
          />

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Property type {node.propertyType}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={node.propertyType}
              label="Property type"
              onChange={useFieldChange('propertyType')
              // (ev: any, elem: any) => updateForm((prev) => {
              //   return ({ ...prev, propertyType: ev.target.value || '' }) // TODO: fix selected
              // })
            }
            >
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="land">Land</MenuItem>
              <MenuItem value="hotel/resort">Hotel/Resort</MenuItem>
            </Select>
          </FormControl>
          <TextField
            defaultValue={node.leaseExpiryYear}
            variant="outlined"
            label="Lease Expiry Year"
            type='number'
            onChange={useFieldChange('leaseExpiryYear')}
            size='small'
          />


          <Stack spacing={2} direction="row" minWidth={'100%'}>
            <TextField
              defaultValue={node.bathroomsCount}
              variant="outlined"
              label="Baths"
              type='number'
              onChange={useFieldChange('bathroomsCount')}
              size='small'
            />
            <TextField
              defaultValue={node.bedroomsCount}
              variant="outlined"
              label="Beds"
              type='number'
              onChange={useFieldChange('bedroomsCount')}
              size='small'
            />
          </Stack>

          <Stack spacing={2} direction="row" minWidth={'100%'}>
            <TextField
              defaultValue={node.landSize}
              variant="outlined"
              label="Land size"
              type='number'
              onChange={useFieldChange('landSize')}
              size='small'
            />
            <TextField
              defaultValue={node.buildingSize}
              variant="outlined"
              label="Build size"
              type='number'
              onChange={useFieldChange('buildingSize')}
              size='small'
            />
          </Stack>

          {/*<TextField*/}
          {/*  defaultValue={node.priceIdr}*/}
          {/*  variant="outlined"*/}
          {/*  label="Price Idr"*/}
          {/*  type='number'*/}
          {/*  onChange={useFieldChange('priceIdr')}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  defaultValue={node.priceUsd}*/}
          {/*  variant="outlined"*/}
          {/*  label="Price Usd"*/}
          {/*  type='number'*/}
          {/*  onChange={useFieldChange('priceUsd')}*/}
          {/*/>*/}

          <Stack spacing={2} direction="row" minWidth={'100%'}>
            <Button fullWidth variant='contained' size='large' onClick={handleApply}>Save</Button>
            <Button fullWidth variant='outlined' size='large' onClick={() => setOpenId(null)}>Close</Button>
          </Stack>
        </Box>
      </Zoom>
    </Modal>
  );
}

export default PropertyForm;
