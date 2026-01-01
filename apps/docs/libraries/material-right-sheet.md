# Material Right Sheet

Angular Material extension providing a right-side sheet component, similar to `MatBottomSheet` but opening from the right side of the screen.

## Installation

```bash
npm install @dasch-ng/material-right-sheet
```

## Features

- **Material Design**: Follows Angular Material design patterns and theming
- **Flexible Positioning**: Opens from the right side of the screen
- **Configurable Width**: Customizable sheet width (default: 420px)
- **Backdrop Support**: Optional backdrop with custom styling
- **Accessibility**: Built with ARIA labels and keyboard navigation support
- **Type-safe**: Full TypeScript support with generics for data and results
- **Navigation Aware**: Automatically closes on browser navigation

## MatRightSheet Service

The main service for opening right sheets.

**Use case:** Open side panels, settings, filters, or additional content from the right side of the screen.

### Example

```typescript
import { Component, inject } from '@angular/core';
import { MatRightSheet } from '@dasch-ng/material-right-sheet';

@Component({
  selector: 'app-main',
  template: ` <button (click)="openSettings()">Open Settings</button> `,
})
export class MainComponent {
  private rightSheet = inject(MatRightSheet);

  openSettings() {
    const sheetRef = this.rightSheet.open(SettingsSheetComponent, {
      data: { userId: 123 },
      width: '500px',
    });

    sheetRef.afterDismissed().subscribe((result) => {
      console.log('Sheet dismissed with result:', result);
    });
  }
}
```

**Methods:**

- `open<T, D, R>(component, config?)`: Open a right sheet with a component
- `open<T, D, R>(template, config?)`: Open a right sheet with a template
- `dismiss<R>(result?)`: Dismiss the currently open right sheet

[View API Documentation →](../api/@dasch-ng/material-right-sheet/classes/MatRightSheet.html)

---

## MatRightSheetRef

Reference to an opened right sheet instance.

**Use case:** Control and communicate with the opened right sheet from within the sheet component.

### Example

```typescript
import { Component, inject } from '@angular/core';
import { MatRightSheetRef } from '@dasch-ng/material-right-sheet';

@Component({
  selector: 'app-settings-sheet',
  template: `
    <h2>Settings</h2>
    <button (click)="save()">Save</button>
    <button (click)="cancel()">Cancel</button>
  `,
})
export class SettingsSheetComponent {
  private sheetRef = inject(MatRightSheetRef<SettingsSheetComponent>);

  save() {
    const result = { saved: true };
    this.sheetRef.dismiss(result);
  }

  cancel() {
    this.sheetRef.dismiss();
  }
}
```

**Methods:**

- `dismiss(result?)`: Close the sheet with an optional result
- `afterDismissed()`: Observable that emits when the sheet is dismissed

[View API Documentation →](../api/@dasch-ng/material-right-sheet/classes/MatRightSheetRef.html)

---

## Configuration Options

### MatRightSheetConfig

Configure the appearance and behavior of the right sheet:

| Option              | Type                 | Default    | Description                                  |
| ------------------- | -------------------- | ---------- | -------------------------------------------- |
| `data`              | `D`                  | `null`     | Data to pass to the sheet component          |
| `width`             | `string`             | `'420px'`  | Width of the right sheet                     |
| `hasBackdrop`       | `boolean`            | `true`     | Whether to show a backdrop                   |
| `backdropClass`     | `string`             | -          | Custom CSS class for the backdrop            |
| `disableClose`      | `boolean`            | `false`    | Disable closing via escape or backdrop click |
| `panelClass`        | `string \| string[]` | -          | Custom CSS classes for the sheet container   |
| `ariaLabel`         | `string`             | `null`     | ARIA label for accessibility                 |
| `autoFocus`         | `AutoFocusTarget`    | `'dialog'` | Where to focus when opened                   |
| `restoreFocus`      | `boolean`            | `true`     | Restore focus when closed                    |
| `closeOnNavigation` | `boolean`            | `true`     | Close on browser navigation                  |
| `direction`         | `Direction`          | -          | Text layout direction (ltr/rtl)              |
| `scrollStrategy`    | `ScrollStrategy`     | `block()`  | Scroll strategy for the overlay              |

### Example with Configuration

```typescript
import { Component, inject } from '@angular/core';
import { MatRightSheet } from '@dasch-ng/material-right-sheet';

@Component({
  selector: 'app-main',
  template: `<button (click)="openFilters()">Filters</button>`,
})
export class MainComponent {
  private rightSheet = inject(MatRightSheet);

  openFilters() {
    this.rightSheet.open(FiltersComponent, {
      width: '600px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      disableClose: false,
      panelClass: ['custom-panel', 'filters-panel'],
      ariaLabel: 'Filter settings',
      data: {
        filters: ['price', 'category', 'rating'],
      },
    });
  }
}
```

---

## Injecting Data

Use `MAT_RIGHT_SHEET_DATA` to inject data into the sheet component:

```typescript
import { Component, inject } from '@angular/core';
import { MAT_RIGHT_SHEET_DATA, MatRightSheetRef } from '@dasch-ng/material-right-sheet';

interface SheetData {
  userId: number;
  userName: string;
}

@Component({
  selector: 'app-user-details-sheet',
  template: `
    <h2>User Details</h2>
    <p>ID: {{ data.userId }}</p>
    <p>Name: {{ data.userName }}</p>
    <button (click)="close()">Close</button>
  `,
})
export class UserDetailsSheetComponent {
  data = inject<SheetData>(MAT_RIGHT_SHEET_DATA);
  private sheetRef = inject(MatRightSheetRef);

  close() {
    this.sheetRef.dismiss();
  }
}
```

---

## Theming

The right sheet supports Angular Material theming.

### Add Theme Styles

Import the theming mixin in your global styles:

```scss
@use '@angular/material' as mat;
@use '@dasch-ng/material-right-sheet/theming' as right-sheet;

// Include the theme mixin with your Material theme
@include right-sheet.mat-right-sheet-theme($your-theme);
```

### Custom Panel Styling

Apply custom styles using `panelClass`:

```typescript
this.rightSheet.open(MyComponent, {
  panelClass: 'custom-right-sheet',
});
```

```scss
.custom-right-sheet {
  background-color: #f5f5f5;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);

  .mat-right-sheet-container {
    padding: 24px;
  }
}
```

---

## Common Patterns

### Filters Panel

```typescript
import { Component, inject } from '@angular/core';
import { MatRightSheet, MAT_RIGHT_SHEET_DATA, MatRightSheetRef } from '@dasch-ng/material-right-sheet';
import { FormsModule } from '@angular/forms';

interface FilterData {
  minPrice: number;
  maxPrice: number;
  category: string;
}

@Component({
  selector: 'app-filters',
  imports: [FormsModule],
  template: `
    <h2>Filters</h2>
    <label>
      Min Price:
      <input type="number" [(ngModel)]="filters.minPrice" />
    </label>
    <label>
      Max Price:
      <input type="number" [(ngModel)]="filters.maxPrice" />
    </label>
    <label>
      Category:
      <input type="text" [(ngModel)]="filters.category" />
    </label>
    <button (click)="apply()">Apply Filters</button>
    <button (click)="reset()">Reset</button>
  `,
})
export class FiltersComponent {
  filters = inject<FilterData>(MAT_RIGHT_SHEET_DATA);
  private sheetRef = inject(MatRightSheetRef<FiltersComponent, FilterData>);

  apply() {
    this.sheetRef.dismiss(this.filters);
  }

  reset() {
    this.sheetRef.dismiss(null);
  }
}
```

### Settings Panel

```typescript
import { Component, inject, signal } from '@angular/core';
import { MatRightSheet, MatRightSheetRef } from '@dasch-ng/material-right-sheet';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  template: `
    <div class="settings-panel">
      <h2>Settings</h2>

      <section>
        <h3>Notifications</h3>
        <label>
          <input type="checkbox" [(ngModel)]="emailNotifications" />
          Email notifications
        </label>
        <label>
          <input type="checkbox" [(ngModel)]="pushNotifications" />
          Push notifications
        </label>
      </section>

      <section>
        <h3>Privacy</h3>
        <label>
          <input type="checkbox" [(ngModel)]="publicProfile" />
          Public profile
        </label>
      </section>

      <div class="actions">
        <button (click)="save()">Save</button>
        <button (click)="cancel()">Cancel</button>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  private sheetRef = inject(MatRightSheetRef);

  emailNotifications = signal(true);
  pushNotifications = signal(false);
  publicProfile = signal(true);

  save() {
    const settings = {
      emailNotifications: this.emailNotifications(),
      pushNotifications: this.pushNotifications(),
      publicProfile: this.publicProfile(),
    };
    this.sheetRef.dismiss(settings);
  }

  cancel() {
    this.sheetRef.dismiss();
  }
}
```

### Details View

```typescript
import { Component, inject } from '@angular/core';
import { MAT_RIGHT_SHEET_DATA } from '@dasch-ng/material-right-sheet';
import { AsyncPipe } from '@angular/common';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-product-details',
  imports: [AsyncPipe],
  template: `
    <div class="product-details">
      <h2>{{ product.name }}</h2>
      <p class="description">{{ product.description }}</p>
      <p class="price">{{ product.price | currency }}</p>
      <button>Add to Cart</button>
    </div>
  `,
})
export class ProductDetailsComponent {
  product = inject<Product>(MAT_RIGHT_SHEET_DATA);
}
```

---

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/@dasch-ng/material-right-sheet/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/material/right-sheet).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
