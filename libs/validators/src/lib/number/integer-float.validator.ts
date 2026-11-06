import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

function isEmpty(value: unknown): boolean {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

/** Fails with `{ invalidInteger: true }` unless the value is an integer (number or numeric string). Empty values pass. */
export const integerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  isEmpty(control.value) || Number.isInteger(Number(control.value)) ? null : { invalidInteger: true };

/** Fails with `{ invalidFloat: true }` unless the value is a finite number (number or numeric string). Empty values pass. */
export const floatValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  isEmpty(control.value) || Number.isFinite(Number(control.value)) ? null : { invalidFloat: true };

/** Template-driven version of {@link integerValidator}: `<input ngModel validateInteger />`. */
@Directive({
  selector: '[validateInteger]',
  providers: [{ provide: NG_VALIDATORS, useExisting: IntegerValidatorDirective, multi: true }],
})
export class IntegerValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return integerValidator(control);
  }
}

/** Template-driven version of {@link floatValidator}: `<input ngModel validateFloat />`. */
@Directive({
  selector: '[validateFloat]',
  providers: [{ provide: NG_VALIDATORS, useExisting: FloatValidatorDirective, multi: true }],
})
export class FloatValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return floatValidator(control);
  }
}
