import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import RangeSlide from './RangeSlide';
import Stack from '@mui/material/Stack';
import { Autocomplete } from '@mui/material';
import { usePropertyStore } from '../store/propertyStore';
import { locationOptions, propertyTypeOptions } from '../helpers/constants';
import { FilterOwnershipOption } from '../store/filterTypes';

const boxStyles = {
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100vh'
}

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

  return (
    <>
      <Button onClick={toggleDrawer}>Filters</Button>
      <Drawer
        anchor={'right'}
        open={state}
        onClose={toggleDrawer}
      >
        <Box sx={boxStyles}>
          <List sx={{ height: '100%', overflow: 'scroll' }}>
            <ListItem>
              <ListItemText><strong>Filters</strong></ListItemText>
            </ListItem>
            <ListItem>
              <Autocomplete
                multiple
                options={propertyTypeOptions}
                defaultValue={filters.type}
                filterSelectedOptions
                size="small"
                fullWidth
                onChange={(_, value) => propAct.upType(value)}
                renderInput={(params) => (<TextField {...params} label="Property type" placeholder="type" />)}
              />
            </ListItem>

            <ListItem>
              <Autocomplete
                multiple
                options={locationOptions}
                groupBy={(opt) => opt.groupBy}
                getOptionLabel={(option) => option.value}
                defaultValue={filters.locations}
                filterSelectedOptions
                fullWidth
                onChange={(_, value) => propAct.upLocation(value)}
                size="small"
                renderInput={(params) => (<TextField {...params} label="Location" placeholder="search" />)}
              />
            </ListItem>

            <ListItem>
              <Autocomplete
                multiple
                options={['leasehold', 'freehold']}
                defaultValue={filters.ownership}
                fullWidth
                size="small"
                limitTags={2}
                onChange={(_, value) => propAct.upOwnership(value as FilterOwnershipOption[])}
                renderInput={(params) => (<TextField {...params} label="Ownership" />)}
              />
            </ListItem>

            <ListItem>
              <ListItemText>Room counts:</ListItemText>
            </ListItem>

            <ListItem sx={{ display: 'flex', gap: '20px' }}>
              <Autocomplete
                disableClearable
                fullWidth
                options={[1,2,3,4,5,'6+']}
                defaultValue={filters.bedroomsCount || '6+'}
                onChange={(_, value) => propAct.upRoomCount(value === '6+' ? null : Number(value), 'bedroomsCount')}
                renderInput={(params) => <TextField {...params} label="Bedrooms" />}
              />
              <Autocomplete
                disableClearable
                options={[1,2,3,4,5,'6+']}
                defaultValue={filters.bathroomsCount || '6+'}
                fullWidth
                onChange={(_, value) => propAct.upRoomCount(value === '6+' ? null : Number(value), 'bathroomsCount')}
                renderInput={(params) => <TextField {...params} label="Bathrooms" />}
              />
            </ListItem>

            <RangeSlide
              max={max.priceUsd || 99999999}
              setValue={propAct.upPrice}
              value={filters.priceUsd ?? [100, max.priceUsd || 99999999]}
            />

          </List>
          <List>
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
