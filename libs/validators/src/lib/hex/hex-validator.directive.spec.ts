import { FormControl } from '@angular/forms';
import { HexValidatorDirective } from './hex-validator.directive';

describe('HexValidatorDirective', () => {
  const directive = new HexValidatorDirective();
  const validate = (value: unknown) => directive.validate(new FormControl(value));

  it('passes valid hex values and empty values', () => {
    expect(validate('#ff00FF')).toBeNull();
    expect(validate('ff00ff')).toBeNull();
    expect(validate('')).toBeNull();
    expect(validate(null)).toBeNull();
  });

  it('fails invalid hex values', () => {
    expect(validate('Wfs0ff')).toEqual({ invalidHex: true });
    expect(validate('#ff')).toEqual({ invalidHex: true });
    expect(validate('#ff00ff00')).toEqual({ invalidHex: true });
  });
});
