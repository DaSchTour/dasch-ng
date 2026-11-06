import { booleanAttribute, Directive, effect, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export interface UniqueValidatorOptions {
  /** Compare strings ignoring case. Default `false`. */
  caseInsensitive?: boolean;
}

/**
 * Fails with `{ notUnique: true }` when the value is already in `existing`,
 * e.g. a name that another item uses. Empty values pass.
 */
export function uniqueValidator(existing: readonly unknown[], options: UniqueValidatorOptions = {}): ValidatorFn {
  const normalize = (value: unknown) => (options.caseInsensitive && typeof value === 'string' ? value.toLocaleLowerCase() : value);
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    if (value == null || value === '') {
      return null;
    }
    const candidate = normalize(value);
    return existing.some((item) => normalize(item) === candidate) ? { notUnique: true } : null;
  };
}

/**
 * Template-driven version of {@link uniqueValidator}. Re-validates when the list changes.
 *
 * ```html
 * <input ngModel [validateUnique]="existingNames" caseInsensitive />
 * ```
 */
@Directive({
  selector: '[validateUnique]',
  providers: [{ provide: NG_VALIDATORS, useExisting: UniqueValidatorDirective, multi: true }],
})
export class UniqueValidatorDirective implements Validator {
  readonly existing = input.required<readonly unknown[] | null | undefined>({ alias: 'validateUnique' });
  readonly caseInsensitive = input(false, { transform: booleanAttribute });

  private onChange?: () => void;

  constructor() {
    effect(() => {
      this.existing();
      this.caseInsensitive();
      this.onChange?.();
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return uniqueValidator(this.existing() ?? [], { caseInsensitive: this.caseInsensitive() })(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}
