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
import { FilterType } from '../api/useGetDataHook';

export default function TemporaryDrawer({fetchData, setFilters, max, filters}: any) {
  const [state, setState] = React.useState(false);

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState((prev) => !prev);
  };

  const handleApply = React.useCallback(() => {
    fetchData()
    setState((prev) => !prev);
  }, [fetchData])

  const handleReset = React.useCallback(() => {
    setFilters({})
    fetchData()
    setState((prev) => !prev);
  }, [setFilters, fetchData])

  const useHandleTypeChange = (typeName: string) => React.useCallback((_: any, val: boolean) => {
    setFilters((prev: any) => {
      if(val) {
        return {...prev, type: prev.type ? [...prev.type, typeName] : []} as FilterType
      } else {
        return { ...prev, type: prev.type ? prev.type.filter((s: string) => s !== typeName) : []}
      }
    })
  }, [typeName])

  const handleChangeLocation = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev: any) => ({
      ...prev,
      location: event.target.value,
    }))
  }, [setFilters])

  const handleChangeBedroomsCount = React.useCallback((value: number) => {
    setFilters((prev: any) => ({
      ...prev,
      bedroomsCount: value,
    }))
  }, [setFilters])

  const handleChangeBathroomsCount = React.useCallback((value: number) => {
    setFilters((prev: any) => ({
      ...prev,
      bathroomsCount: value,
    }))
  }, [setFilters])

  const handleChangePrice = React.useCallback((value: [number, number]) => {
    setFilters((prev: any) => ({
      ...prev,
      priceUsd: value,
    }))
  }, [setFilters])

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
                control={<Checkbox checked={filters.type?.includes('villa')} />}
                label="Villa"
                onChange={useHandleTypeChange('villa')}
              />
              <FormControlLabel
                control={<Checkbox checked={filters.type?.includes('apartment')} />}
                label="Apartment"
                onChange={useHandleTypeChange('apartment')}
              />
              <FormControlLabel
                control={<Checkbox checked={filters.type?.includes('house')} />}
                label="House"
                onChange={useHandleTypeChange('house')}
              />
              <FormControlLabel
                control={<Checkbox checked={filters.type?.includes('land')} />}
                label="Land"
                onChange={useHandleTypeChange('land')}
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
              onChange={handleChangeBedroomsCount}
              value={filters.bedroomsCount ?? 0}
            />
            <SlidInput
              max={max.bathroomsCount || 10}
              title="Bathrooms count"
              onChange={handleChangeBathroomsCount}
              value={filters.bathroomsCount ?? 0}
            />

            <Divider />

            <RangeSlide
              max={max.priceUsd || 99999999}
              title="Price usd"
              setValue={handleChangePrice}
              value={filters.priceUsd ?? [100, 99999999]}
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