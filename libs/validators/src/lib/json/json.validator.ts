import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

/**
 * Fails with `{ invalidJson: { message } }` when a string value is not valid JSON.
 * Empty and non-string values pass; combine with `Validators.required` if needed.
 */
export const jsonValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return { invalidJson: { message: error instanceof Error ? error.message : String(error) } };
  }
};

/** Template-driven version of {@link jsonValidator}: `<textarea ngModel validateJson></textarea>`. */
@Directive({
  selector: '[validateJson]',
  providers: [{ provide: NG_VALIDATORS, useExisting: JsonValidatorDirective, multi: true }],
})
export class JsonValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return jsonValidator(control);
  }
}
