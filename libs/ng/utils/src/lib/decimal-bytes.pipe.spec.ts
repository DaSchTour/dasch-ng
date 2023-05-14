import { DecimalBytesPipe } from './decimal-bytes.pipe';

describe('DecimalBytesPipe', () => {
  let pipe: DecimalBytesPipe;

  beforeEach(() => {
    pipe = new DecimalBytesPipe();
  });

  it('should return with an empty or invalid input', () => {
    expect(pipe.transform(Number.NaN)).toEqual('Invalid Number');
    expect(pipe.transform(null)).toEqual('Invalid Number');
    expect(pipe.transform(0.3)).toEqual('Invalid Number');
    expect(pipe.transform(0.76)).toEqual('Invalid Number');
  });

  it('should return a formatted bytes to larger units', () => {
    expect(pipe.transform(0)).toEqual('0 B');
    expect(pipe.transform(535)).toEqual('535 B');
    expect(pipe.transform(1000)).toEqual('1 KB');
    expect(pipe.transform(1024)).toEqual('1.02 KB');
    expect(pipe.transform(1024, 1)).toEqual('1 KB');
    expect(pipe.transform(138_540)).toEqual('138.54 KB');
    expect(pipe.transform(138_540, 1)).toEqual('138.5 KB');
    expect(pipe.transform(1_571_800)).toEqual('1.57 MB');
    expect(pipe.transform(1_571_800, 4)).toEqual('1.5718 MB');
    expect(pipe.transform(10_000_000)).toEqual('10 MB');
    expect(pipe.transform(10_485_760)).toEqual('10.49 MB');
    expect(pipe.transform(10_201_000, 3)).toEqual('10.201 MB');
    expect(pipe.transform(3.818_61e10)).toEqual('38.19 GB');
    expect(pipe.transform(1.890_381_861e14)).toEqual('189.04 TB');
    expect(pipe.transform(5.357_65e16)).toEqual('53.58 PB');
  });
});
