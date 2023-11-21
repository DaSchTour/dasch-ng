import { hexValidator } from './hex.validator';

describe('hexValidator', () => {
  it('ff00ff: should return true for valid hex string', () => {
    expect(hexValidator('ff00ff')).toBe(true);
  });

  it('#ff00FF: should return true for valid hex string', () => {
    expect(hexValidator('#ff00FF')).toBe(true);
  });

  it('Wfs0ff: should return false for invalid hex string', () => {
    expect(hexValidator('Wfs0ff')).toBe(false);
  });

  it('ff: should return false as it is to short for default length of 6', () => {
    expect(hexValidator('ff')).toBe(false);
  });

  it('ff: should return true if length of 2 is given', () => {
    expect(hexValidator('ff', 2)).toBe(true);
  });
});
