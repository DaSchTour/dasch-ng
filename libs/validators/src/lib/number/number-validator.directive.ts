import { Directive } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

export const NUMBER_REGEX = /^[-]?([\d,.' ]+)$/;

@Directive({
  selector: '[validateNumber]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: NumberValidatorDirective,
      multi: true,
    },
  ],
})
export class NumberValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (typeof value !== 'string') {
      return null;
    }
    return NUMBER_REGEX.test(value) ? null : { invalidNumber: true };
  }
}
