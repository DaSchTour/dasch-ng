import { Directive, ElementRef, inject } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[type=number]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: NativeNumberValidatorDirective,
      multi: true,
    },
  ],
})
export class NativeNumberValidatorDirective implements Validator {
  private readonly elementRef: ElementRef<HTMLInputElement> =
    inject(ElementRef);

  validate(): ValidationErrors | null {
    return this.elementRef.nativeElement.checkValidity()
      ? null
      : { invalidNumber: true };
  }
}
