# Validators

Collection of reusable Angular form validators for common validation scenarios.

## Installation

```bash
npm install @dasch-ng/validators
```

## Features

- **Hex Validation**: Validate hexadecimal color codes and values
- **Number Validation**: Enhanced number validation with flexible input formats
- **Native Number Validation**: Leverage browser's native number input validation
- **Directive-based**: Easy integration with Angular forms
- **Standalone**: All validators are standalone and tree-shakeable
- **Type-safe**: Full TypeScript support with proper typings

## HexValidatorDirective

Validates hexadecimal values with optional `#` prefix.

**Use case:** Validate color picker inputs, hex color codes, or any hexadecimal values.

### Example

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HexValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-color-picker',
  imports: [ReactiveFormsModule, HexValidatorDirective],
  template: `
    <div class="form-group">
      <label for="color">Color (Hex)</label>
      <input id="color" type="text" [formControl]="colorControl" validateHex placeholder="#FF5733" />
      @if (colorControl.errors?.['invalidHex']) {
        <div class="error">Please enter a valid hex color (e.g., #FF5733)</div>
      }
      <div class="color-preview" [style.backgroundColor]="colorControl.value"></div>
    </div>
  `,
  styles: [
    `
      .color-preview {
        width: 50px;
        height: 50px;
        border: 1px solid #ccc;
        margin-top: 8px;
      }
      .error {
        color: red;
        font-size: 0.875rem;
        margin-top: 4px;
      }
    `,
  ],
})
export class ColorPickerComponent {
  colorControl = new FormControl('#FF5733');
}
```

**Validation:**

- Accepts hex values with or without `#` prefix
- Default length: 6 characters (RGB)
- Validates format: `#?[0-9A-Fa-f]{6}`

**Error Key:** `invalidHex`

[View API Documentation →](../api/@dasch-ng/validators/classes/HexValidatorDirective.html)

---

## NumberValidatorDirective

Validates numeric input with support for various number formats.

**Use case:** Validate text inputs that should contain numbers, supporting different regional formats.

### Example

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NumberValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-price-input',
  imports: [ReactiveFormsModule, NumberValidatorDirective],
  template: `
    <div class="form-group">
      <label for="price">Price</label>
      <input id="price" type="text" [formControl]="priceControl" validateNumber placeholder="1,234.56" />
      @if (priceControl.errors?.['invalidNumber']) {
        <div class="error">Please enter a valid number</div>
      }
    </div>
  `,
})
export class PriceInputComponent {
  priceControl = new FormControl('');
}
```

**Validation:**

- Supports negative numbers
- Accepts commas, periods, apostrophes, and spaces as separators
- Pattern: `/^[-]?([\d,.' ]+)$/`

**Examples of valid inputs:**

- `1234`
- `-1234`
- `1,234.56`
- `1'234.56`
- `1 234.56`

**Error Key:** `invalidNumber`

[View API Documentation →](../api/@dasch-ng/validators/classes/NumberValidatorDirective.html)

---

## NativeNumberValidatorDirective

Leverages the browser's native number input validation.

**Use case:** Automatically validate `<input type="number">` elements using browser constraints.

### Example

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NativeNumberValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-quantity-input',
  imports: [ReactiveFormsModule, NativeNumberValidatorDirective],
  template: `
    <div class="form-group">
      <label for="quantity">Quantity</label>
      <input id="quantity" type="number" [formControl]="quantityControl" min="1" max="100" step="1" />
      @if (quantityControl.errors?.['invalidNumber']) {
        <div class="error">Please enter a valid quantity (1-100)</div>
      }
    </div>
  `,
})
export class QuantityInputComponent {
  quantityControl = new FormControl(1);
}
```

**Validation:**

- Automatically applied to all `<input type="number">` elements
- Uses browser's native `checkValidity()` method
- Respects `min`, `max`, and `step` attributes

**Error Key:** `invalidNumber`

[View API Documentation →](../api/@dasch-ng/validators/classes/NativeNumberValidatorDirective.html)

---

## hexValidator Function

Standalone validation function for programmatic use.

### Example

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { hexValidator } from '@dasch-ng/validators';

@Component({
  selector: 'app-theme-editor',
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group">
      <label for="primaryColor">Primary Color</label>
      <input id="primaryColor" type="text" [formControl]="primaryColorControl" placeholder="#007bff" />
      @if (primaryColorControl.errors?.['hex']) {
        <div class="error">Invalid hex color</div>
      }
    </div>
  `,
})
export class ThemeEditorComponent {
  primaryColorControl = new FormControl('#007bff', [
    Validators.required,
    (control) => {
      const value = control.value;
      return value && !hexValidator(value) ? { hex: true } : null;
    },
  ]);
}
```

**Signature:**

```typescript
function hexValidator(value: string, length?: number): boolean;
```

**Parameters:**

- `value`: The string to validate
- `length`: Expected length of hex value (default: 6)

**Returns:** `true` if valid, `false` otherwise

[View API Documentation →](../api/@dasch-ng/validators/functions/hexValidator.html)

---

## Common Patterns

### Form with Multiple Validators

```typescript
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HexValidatorDirective, NumberValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, HexValidatorDirective, NumberValidatorDirective],
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Product Name</label>
        <input id="name" type="text" formControlName="name" placeholder="Enter product name" />
        @if (productForm.get('name')?.errors?.['required']) {
          <div class="error">Name is required</div>
        }
      </div>

      <div class="form-group">
        <label for="price">Price</label>
        <input id="price" type="text" formControlName="price" validateNumber placeholder="99.99" />
        @if (productForm.get('price')?.errors?.['required']) {
          <div class="error">Price is required</div>
        }
        @if (productForm.get('price')?.errors?.['invalidNumber']) {
          <div class="error">Invalid price format</div>
        }
      </div>

      <div class="form-group">
        <label for="color">Color</label>
        <input id="color" type="text" formControlName="color" validateHex placeholder="#FF5733" />
        @if (productForm.get('color')?.errors?.['invalidHex']) {
          <div class="error">Invalid color code</div>
        }
      </div>

      <button type="submit" [disabled]="productForm.invalid">Submit</button>
    </form>
  `,
})
export class ProductFormComponent {
  productForm = this.fb.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    color: ['#000000'],
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.productForm.valid) {
      console.log('Form data:', this.productForm.value);
    }
  }
}
```

### Custom Hex Length Validation

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { hexValidator } from '@dasch-ng/validators';

@Component({
  selector: 'app-hex-with-alpha',
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group">
      <label>Color with Alpha (8 chars)</label>
      <input type="text" [formControl]="colorControl" placeholder="#FF5733AA" />
      @if (colorControl.errors?.['hex']) {
        <div class="error">Invalid hex color with alpha</div>
      }
    </div>
  `,
})
export class HexWithAlphaComponent {
  colorControl = new FormControl('#FF5733AA', [
    (control) => {
      const value = control.value;
      // Validate 8-character hex (RGBA)
      return value && !hexValidator(value, 8) ? { hex: true } : null;
    },
  ]);
}
```

### Conditional Number Validation

```typescript
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumberValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-discount-form',
  imports: [ReactiveFormsModule, NumberValidatorDirective],
  template: `
    <form [formGroup]="discountForm">
      <label>
        <input type="checkbox" formControlName="hasDiscount" />
        Apply Discount
      </label>

      @if (discountForm.get('hasDiscount')?.value) {
        <div class="form-group">
          <label for="discountAmount">Discount Amount</label>
          <input id="discountAmount" type="text" formControlName="discountAmount" validateNumber placeholder="10.50" />
          @if (discountForm.get('discountAmount')?.errors?.['required']) {
            <div class="error">Discount amount is required</div>
          }
          @if (discountForm.get('discountAmount')?.errors?.['invalidNumber']) {
            <div class="error">Invalid number format</div>
          }
        </div>
      }
    </form>
  `,
})
export class DiscountFormComponent {
  discountForm = this.fb.group({
    hasDiscount: [false],
    discountAmount: [''],
  });

  constructor(private fb: FormBuilder) {
    // Add/remove validators based on checkbox
    this.discountForm.get('hasDiscount')?.valueChanges.subscribe((checked) => {
      const discountControl = this.discountForm.get('discountAmount');
      if (checked) {
        discountControl?.setValidators([Validators.required]);
      } else {
        discountControl?.clearValidators();
      }
      discountControl?.updateValueAndValidity();
    });
  }
}
```

### Template-Driven Forms

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HexValidatorDirective, NumberValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, HexValidatorDirective, NumberValidatorDirective],
  template: `
    <form #settingsForm="ngForm">
      <div class="form-group">
        <label for="bgColor">Background Color</label>
        <input id="bgColor" type="text" name="backgroundColor" [(ngModel)]="settings.backgroundColor" validateHex required #bgColor="ngModel" />
        @if (bgColor.errors?.['required']) {
          <div class="error">Background color is required</div>
        }
        @if (bgColor.errors?.['invalidHex']) {
          <div class="error">Invalid hex color</div>
        }
      </div>

      <div class="form-group">
        <label for="maxItems">Max Items</label>
        <input id="maxItems" type="number" name="maxItems" [(ngModel)]="settings.maxItems" min="1" max="100" #maxItems="ngModel" />
        @if (maxItems.errors?.['invalidNumber']) {
          <div class="error">Invalid number</div>
        }
      </div>

      <button [disabled]="settingsForm.invalid">Save</button>
    </form>
  `,
})
export class SettingsComponent {
  settings = {
    backgroundColor: '#ffffff',
    maxItems: 10,
  };
}
```

---

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/@dasch-ng/validators/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/validators).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
