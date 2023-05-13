export function diffOfArrays<T, R>(oldValues: T[], newValues: T[], comparator: (T) => R = (T) => T): [R[], R[]] {
  const valuesToAdd: R[] = [];
  const oldValuesMap = new Map<R, boolean>(oldValues.map((ov) => [comparator(ov), false]));
  newValues.forEach((nv) => {
    const newValue = comparator(nv);
    if (oldValuesMap.has(newValue)) {
      oldValuesMap.set(newValue, true);
    } else {
      valuesToAdd.push(newValue);
    }
  });

  const valuesToDelete: R[] = [];
  oldValues.forEach((ov) => {
    const oldValue = comparator(ov);
    if (oldValuesMap.get(oldValue) === false) {
      valuesToDelete.push(oldValue);
    }
  });

  return [valuesToDelete, valuesToAdd];
}

export function generateArray<T>(length: number, generator: (index: number) => T): T[] {
  const res: T[] = [];
  for (let i = 0; i < length; i += 1) {
    res[i] = generator(i);
  }
  return res;
}

export async function generateArrayAsync<T>(length: number, generator: (index: number) => Promise<T>): Promise<T[]> {
  const res: T[] = [];
  for (let i = 0; i < length; i += 1) {
    res[i] = await generator(i);
  }
  return res;
}
