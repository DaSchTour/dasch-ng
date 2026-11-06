import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

/**
 * Fails with `{ blank: true }` when a string value is empty or only whitespace.
 * Unlike `Validators.required`, `'   '` does not pass. Non-string values pass.
 */
export const notBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { blank: true } : null;

/** Template-driven version of {@link notBlankValidator}: `<input ngModel validateNotBlank />`. */
@Directive({
  selector: '[validateNotBlank]',
  providers: [{ provide: NG_VALIDATORS, useExisting: NotBlankValidatorDirective, multi: true }],
})
export class NotBlankValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return notBlankValidator(control);
  }
}
