import { diffOfArrays } from './array';

describe('Array utility diff test', () => {
  it('Arrays with intersections', () => {
    const newValues = [1, 2, 3];
    const oldValues = [2, 3, 4];
    expect(diffOfArrays(newValues, oldValues)).toStrictEqual([[1], [4]]);
  });

  it('Equal arrays', () => {
    const newValues = [1, 2, 3];
    const oldValues = [1, 2, 3];
    expect(diffOfArrays(newValues, oldValues)).toStrictEqual([[], []]);
  });

  it('Arrays without intersections', () => {
    const newValues = [3];
    const oldValues = [1];
    expect(diffOfArrays(newValues, oldValues)).toStrictEqual([[3], [1]]);
  });

  it('Empty arrays', () => {
    const newValues = [];
    const oldValues = [];
    expect(diffOfArrays(newValues, oldValues)).toStrictEqual([[], []]);
  });
  it('Arrays with intersections and comparator', () => {
    class Sample {
      value: string;

      constructor(value: string) {
        this.value = value;
      }
    }

    const newValues: Sample[] = [
      new Sample('1'),
      new Sample('2'),
      new Sample('3'),
    ];
    const oldValues: Sample[] = [
      new Sample('2'),
      new Sample('3'),
      new Sample('4'),
    ];
    expect(diffOfArrays<Sample, string>(newValues, oldValues, (s: Sample) => s.value))
      .toStrictEqual<[string[], string[]]>([['1'], ['4']]);
  });
});
