import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { hexValidator } from './hex.validator';

@Directive({
  selector: '[validateHex]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: HexValidatorDirective,
      multi: true,
    },
  ],
})
export class HexValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value && hexValidator(control.value) ? { invalidHex: true } : null;
  }
}
