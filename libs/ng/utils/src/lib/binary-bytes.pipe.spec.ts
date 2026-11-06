import { BinaryBytesPipe } from './binary-bytes.pipe';

describe('BinaryBytesPipe', () => {
  const pipe = new BinaryBytesPipe();

  it('formats with base 1024 and IEC units', () => {
    expect(pipe.transform(0)).toBe('0 B');
    expect(pipe.transform(1023)).toBe('1023 B');
    expect(pipe.transform(1024)).toBe('1 KiB');
    expect(pipe.transform(1536)).toBe('1.5 KiB');
    expect(pipe.transform(10_485_760)).toBe('10 MiB');
    expect(pipe.transform(1_073_741_824)).toBe('1 GiB');
    expect(pipe.transform(1_610_612_736, 1)).toBe('1.5 GiB');
  });

  it('respects precision', () => {
    expect(pipe.transform(1_000_000)).toBe('976.56 KiB');
    expect(pipe.transform(1_000_000, 0)).toBe('977 KiB');
  });

  it('caps at the largest unit', () => {
    expect(pipe.transform(1024 ** 9)).toBe('1024 YiB');
  });

  it('rejects invalid input like decimalBytes', () => {
    expect(pipe.transform(Number.NaN)).toBe('Invalid Number');
    expect(pipe.transform(null)).toBe('Invalid Number');
    expect(pipe.transform('1024')).toBe('Invalid Number');
    expect(pipe.transform(0.5)).toBe('Invalid Number');
    expect(pipe.transform(-5)).toBe('Invalid Number');
  });
});
