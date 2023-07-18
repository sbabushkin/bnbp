import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { ListItemText } from '@mui/material';

const minDistance = 100;

type RangeSlideProps = {
  max: number;
  value: [number, number];
  setValue: (val: [number, number]) => void;
}

export default function RangeSlide({ max, value, setValue }: RangeSlideProps) {
  const handleChangeRange = (
    _: Event,
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

  const handleBlurMin = (event: React.FocusEvent<HTMLInputElement>) => {
    const num = Number(event.target.value)
    if (num < 0) {
      setValue([0, value[1]]);
    } else if (num > value[1]) {
      setValue([value[1] - minDistance, value[1]]);
    }
  };

  const handleBlurMax = (event: React.FocusEvent<HTMLInputElement>) => {
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
        <Slider
          value={value}
          onChange={handleChangeRange}
          max={max}
        />
      </ListItem>
      <ListItem>
        <ListItemText>Price USD from:</ListItemText>
        <Input
          value={value[0]}
          onChange={handleInputChangeMin}
          onBlur={handleBlurMin}
          sx={{width: 160}}
          inputProps={{ step: 1, min: 1, max, type: 'number', 'aria-labelledby': 'input-slider-rooms'}}
        />
      </ListItem>
      <ListItem>
        <ListItemText>Price USD to:</ListItemText>
        <Input
          value={value[1]}
          onChange={handleInputChangeMax}
          onBlur={handleBlurMax}
          sx={{width: 160}}
          inputProps={{ step: 1, min: 1, max, type: 'number', 'aria-labelledby': 'input-slider-rooms'}}
        />
      </ListItem>
    </>
  );
}
