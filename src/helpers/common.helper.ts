import { differenceInCalendarDays } from 'date-fns';
import { parsePhoneNumber } from 'libphonenumber-js';
import { WrongDateInterval } from '../common/exceptions';

const punycode = require('punycode/');

export const isSet = (value: any) => value !== null && value !== undefined;
export const isEmpty = (value: any) => value === null || value === undefined || value === '';
export const trimValue = (value: any) => (typeof value === 'string' ? value.trim() : value);

export const parsePrice = (value: string) => value ? value.replace(/\D/g, '') : 0;
export const parseText = (value: string) => value ? value.replace(/\W/g, '') : '';
export const parseNumeric = (value: string) => value ? value.replace(/\D/g, '') : 0;

export const parseSquare = (value: string) => {
  if (!value) return 0;
  const regex = /[0-9.,]+/g;
  const match = value.match(regex);
  return match ? parseFloat(match[0].replace(',', '.')) : 0;
}

export const formatString = (str: string, ...args: any) => {
  let matches = -1;
  return str.replace(
    /\?\?/g, () => {
      matches += 1;
      return args[matches] || '';
    },
  );
};

export const getParsedPhone = (phoneString: string) => parsePhoneNumber(phoneString, 'RU').number.slice(1);

export const removeHTML = (htmlString: string) => htmlString.replace(/<[^>]+>/g, '');

export const decodeCyrillicUrl = (url: string) => (
  url?.split('/')?.map((stringPart: string) => punycode.toUnicode(decodeURI(stringPart)))?.join('/')
);

export const getDateInternal = (start: string, finish: string): number => {
  const startDate = new Date(start);
  const finishDate = new Date(finish);

  if (startDate > finishDate) {
    throw new WrongDateInterval();
  }

  return differenceInCalendarDays(finishDate, startDate) + 1;
};

// TODO: move to common data
export const evenRound = (num: number, decimalPlaces: number) => {
  const d = decimalPlaces || 0;
  const m = 10 ** d;
  const n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
  const i = Math.floor(n);
  const f = n - i;
  const e = 1e-8; // Allow for rounding errors in f
  // eslint-disable-next-line no-nested-ternary
  const r = f > 0.5 - e && f < 0.5 + e ? (i % 2 === 0 ? i : i + 1) : Math.round(n);
  return d ? r / m : r;
};

export const evenRoundTwoDigit = (num: number) => evenRound(num, 2);
export const evenRoundFourDigit = (num: number) => evenRound(num, 4);

export const codeGenerator = (length = 4) => Array.from(Array(length))
  .map(() => Math.floor(Math.random() * 10))
  .join('');
