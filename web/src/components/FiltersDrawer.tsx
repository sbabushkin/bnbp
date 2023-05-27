import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import SlidInput from './SlidInput';
import RangeSlide from './RangeSlide';
import Stack from '@mui/material/Stack';
import { Radio } from '@mui/material';
import { usePropertyStore } from '../store/propertyStore';
import { FilterTypeOption } from '../store/filterTypes';

export const FiltersDrawer: React.FC = () => {
  const [state, setState] = React.useState(false);
  const filters = usePropertyStore((state) => state.filters);
  const propAct = usePropertyStore((state) => state.actions);
  const max = usePropertyStore((state) => state.maxValues);

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in event && (event.type === 'keydown' && event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState((prev) => !prev);
  };

  const handleApply = React.useCallback(() => {
    propAct.fetchData()
    setState((prev) => !prev);
  }, [propAct])

  const handleReset = React.useCallback(() => {
    propAct.reset()
    propAct.fetchData()
    setState((prev) => !prev);
  }, [propAct])

  const useHandleTypeChange = (typeName: FilterTypeOption) => React.useCallback((_: any, val: boolean) => {
    propAct.upType(typeName, val)
  }, [typeName])

  const handleChangeLocation = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    propAct.upLocation(event.target.value)
  }, [propAct])

  return (
    <>
      <Button onClick={toggleDrawer}>Filters</Button>
      <Drawer
        anchor={'right'}
        open={state}
        onClose={toggleDrawer}
      >
        <Box sx={{ width: 650 }}>
          <List>
            <ListItem>
              <ListItemText>Property type</ListItemText>
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={<Checkbox checked={filters.type.includes('villa')} />}
                label="Villa"
                onChange={useHandleTypeChange('villa')}
              />
              <FormControlLabel
                control={<Checkbox checked={filters.type.includes('apartment')} />}
                label="Apartment"
                onChange={useHandleTypeChange('apartment')}
              />
              <FormControlLabel
                control={<Checkbox checked={filters.type.includes('house')} />}
                label="House"
                onChange={useHandleTypeChange('house')}
              />
              <FormControlLabel
                control={<Checkbox checked={filters.type.includes('land')} />}
                label="Land"
                onChange={useHandleTypeChange('land')}
              />
            </ListItem>

            <ListItem>
              <ListItemText>Ownership</ListItemText>
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={<Radio checked={filters.ownership === 'leasehold'} />}
                label="Leasehold"
                onChange={() => propAct.upOwnership('leasehold')}
              />
              <FormControlLabel
                control={<Radio checked={filters.ownership === 'freehold'} />}
                label="Freehold"
                onChange={() => propAct.upOwnership('freehold')}
              />
            </ListItem>

            <ListItem>
              <TextField
                id="outlined-basic"
                label="Location"
                variant="standard"
                fullWidth
                value={filters.location}
                onChange={handleChangeLocation}
              />
            </ListItem>

            <Divider />

            <SlidInput
              max={max.bedroomsCount || 10}
              title="Bedrooms count"
              onChange={(value: number) => propAct.upRoomCount(value, 'bedroomsCount')}
              value={filters.bedroomsCount ?? 0}
            />
            <SlidInput
              max={max.bathroomsCount || 10}
              title="Bathrooms count"
              onChange={(value: number) => propAct.upRoomCount(value, 'bathroomsCount')}
              value={filters.bathroomsCount ?? 0}
            />

            <Divider />

            <RangeSlide
              max={max.priceUsd || 99999999}
              title="Price usd"
              setValue={propAct.upPrice}
              value={filters.priceUsd ?? [100, max.priceUsd || 99999999]}
            />

            <Divider />

            <ListItem>
              <Stack spacing={2} direction="row" minWidth={'100%'}>
                <Button fullWidth variant='contained' onClick={handleApply}>Apply</Button>
                <Button fullWidth variant='outlined' onClick={handleReset}>Reset</Button>
              </Stack>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default FiltersDrawer;
