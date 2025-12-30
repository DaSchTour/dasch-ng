# @dasch-ng/validators

Collection of Angular form validators for common validation scenarios.

## Installation

```bash
npm install @dasch-ng/validators
```

## Features

- **Hex Validator**: Validates hexadecimal color codes and values
- **Number Validator**: Enhanced number validation with range support
- **Directive-based**: Easy integration with Angular Reactive and Template-driven forms
- **Type-safe**: Full TypeScript support with proper typings

## Basic Usage

### Hex Validator

```typescript
import { HexValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-example',
  imports: [HexValidatorDirective, ReactiveFormsModule],
  template: `
    <input type="text" [formControl]="colorControl" hexValidator placeholder="#FF5733" />
    <div *ngIf="colorControl.errors?.['hex']">Invalid hex color code</div>
  `,
})
export class ExampleComponent {
  colorControl = new FormControl('');
}
```

### Number Validator

```typescript
import { NumberValidatorDirective } from '@dasch-ng/validators';

@Component({
  selector: 'app-example',
  imports: [NumberValidatorDirective, FormsModule],
  template: ` <input type="text" [(ngModel)]="value" numberValidator [min]="0" [max]="100" /> `,
})
export class ExampleComponent {
  value = '';
}
```

## Available Validators

- **hexValidator** - Validates hexadecimal values (with or without `#` prefix)
- **numberValidator** - Validates numeric input with optional min/max constraints
- **nativeNumberValidator** - Enhanced native number input validation

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/validators/) for detailed information.

## Running Tests

```bash
nx test validators
```

## License

MIT
