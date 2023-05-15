import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

function valuetext(value: number) {
  return `${value}°C`;
}

const minDistance = 1000;

type RangeSlideProps = {
  max: number;
  title: string;
  value: [number, number];
  setValue: (val: [number, number]) => void;
}

export default function RangeSlide({ max, title, value, setValue }: RangeSlideProps) {
  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
    } else {
      setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
    }
  };

  const handleInputChangeMin = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue([Math.min(Number(event.target.value), value[1] - minDistance), value[1]]);
  };

  const handleInputChangeMax = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue([value[0], Math.max(Number(event.target.value), value[0] + minDistance)]);
  };

  const handleBlurMin = (event: any) => {
    const num = Number(event.target.value)
    if (num < 0) {
      setValue([0, value[1]]);
    } else if (num > value[1]) {
      setValue([value[1] - minDistance, value[1]]);
    }
  };

  const handleBlurMax = (event: any) => {
    const num = Number(event.target.value)
    if (num > max) {
      setValue([value[0], max]);
    } else if (num < value[0]) {
      setValue([value[0], value[0] + minDistance]);
    }
  };

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
              value={value[0]}
              onChange={handleInputChangeMin}
              onBlur={handleBlurMin}
              inputProps={{ step: 1, min: 1, max, type: 'number', 'aria-labelledby': 'input-slider-rooms'}}
              style={{ width: '170px' }}
            />
          </Grid>
          <Grid item xs>
            <Slider
              getAriaLabel={() => 'Minimum distance shift'}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              disableSwap
              max={max}
            />
          </Grid>
          <Grid item>
            <Input
              value={value[1]}
              onChange={handleInputChangeMax}
              onBlur={handleBlurMax}
              inputProps={{ step: 1, min: 1, max, type: 'number', 'aria-labelledby': 'input-slider-rooms'}}
              style={{ width: '170px' }}
            />
          </Grid>
        </Grid>
      </ListItem>
    </>
  );
}