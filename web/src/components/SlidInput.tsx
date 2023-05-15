import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

type SlidInputProps = {
  max: number;
  title: string;
  onChange: (val: number) => void;
  value?: number;
}
export default function SlidInput({ max, title, value, onChange }: SlidInputProps) {

  const handleSliderChange = React.useCallback((event: Event, newValue: number | number[]) => {
    onChange(Array.isArray(newValue) ? newValue[0] : newValue)
  }, [onChange]);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? 0 : Number(event.target.value))
  }, [onChange]);

  const handleBlur = React.useCallback(() => {
    if (Number(value ?? 0) < 0) {
      onChange(0)
    } else if (Number(value ?? 0) > max) {
      onChange(max)
    }
  }, [onChange, value, max]);

  return (
    <>
      <ListItem>
        <Typography id="input-slider-rooms" gutterBottom>
          {title}
        </Typography>
      </ListItem>
      <ListItem>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Input
              value={value}
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{ step: 1, min: 1, max, type: 'number', 'aria-labelledby': 'input-slider-rooms'}}
              style={{ width: '70px' }}
            />
          </Grid>
          <Grid item xs>
            <Slider
              value={value}
              onChange={handleSliderChange}
              aria-labelledby="input-slider-rooms"
              max={max}
              min={1}
            />
          </Grid>
        </Grid>
      </ListItem>
    </>
  );
}