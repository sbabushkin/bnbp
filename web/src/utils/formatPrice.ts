export const evenRound = (num: number, decimalPlaces = 0) => {
  const d = decimalPlaces;
  const m = 10 ** d;
  const n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
  const i = Math.floor(n);
  const f = n - i;
  const e = 1e-8; // Allow for rounding errors in f
  // eslint-disable-next-line no-nested-ternary
  const r = f > 0.5 - e && f < 0.5 + e ? (i % 2 === 0 ? i : i + 1) : Math.round(n);
  return d ? r / m : r;
};

export const chunkNumberByClass = (number: string) => {
  if (!number || number.length === 0) {
    return '0';
  }
  const [commonInt, restInt] = String(evenRound(+number)).split('.');
  return `${commonInt.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}${
    restInt ? `,${restInt}` : ''
  }`;
};
