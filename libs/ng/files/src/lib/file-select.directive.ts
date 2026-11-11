import { Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * `ControlValueAccessor` for `<input type="file">`. The value is a `File` (or `null`) for a
 * single file input and a `File[]` when the input has the `multiple` attribute.
 *
 * Works with `formControl`, `formControlName` and `ngModel`. Browsers do not allow setting
 * files on an input from code, so writing a value only resets the input (for `null` or `[]`);
 * other values are kept in the model but not shown by the native input.
 * Signal forms are not supported (their `FormValueControl` contract needs a writable value).
 *
 * @example
 * ```html
 * <input type="file" fileSelect multiple [formControl]="files" />
 * ```
 */
@Directive({
  selector: 'input[type=file][fileSelect]',
  host: {
    '(change)': 'onChange()',
    '(blur)': 'onTouched()',
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileSelectDirective), multi: true }],
})
export class FileSelectDirective implements ControlValueAccessor {
  private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  private onModelChange: (value: File | File[] | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected onChange(): void {
    const files = Array.from(this.input.files ?? []);
    this.onModelChange(this.input.multiple ? files : (files[0] ?? null));
  }

  writeValue(value: File | File[] | null): void {
    if (value == null || (Array.isArray(value) && !value.length)) {
      this.input.value = '';
    }
  }

  registerOnChange(fn: (value: File | File[] | null) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.input.disabled = disabled;
  }
}
