# @dasch-ng/material-right-sheet

Angular Material extension providing a right-side sheet component, similar to MatBottomSheet but opening from the right side of the screen.

## Installation

```bash
npm install @dasch-ng/material-right-sheet
```

## Features

- **Material Design**: Follows Angular Material design patterns and theming
- **Flexible Positioning**: Opens from the right side of the screen
- **Custom Theming**: Full support for Angular Material theming system
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Built with accessibility best practices
- **Type-safe**: Full TypeScript support

## Basic Usage

### Opening a Right Sheet

```typescript
import { MatRightSheet } from '@dasch-ng/material-right-sheet';

@Component({
  selector: 'app-example',
  template: ` <button (click)="openRightSheet()">Open Right Sheet</button> `,
})
export class ExampleComponent {
  constructor(private rightSheet: MatRightSheet) {}

  openRightSheet() {
    this.rightSheet.open(MySheetComponent, {
      data: { name: 'John' },
    });
  }
}
```

### Sheet Component

```typescript
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from '@dasch-ng/material-right-sheet';

@Component({
  selector: 'app-my-sheet',
  template: `
    <h2>Hello {{ data.name }}</h2>
    <button (click)="close()">Close</button>
  `,
})
export class MySheetComponent {
  constructor(
    private sheetRef: MatRightSheetRef<MySheetComponent>,
    @Inject(MAT_RIGHT_SHEET_DATA) public data: { name: string },
  ) {}

  close() {
    this.sheetRef.dismiss();
  }
}
```

### Theming

Import the theming file in your global styles:

```scss
@use '@dasch-ng/material-right-sheet/theming' as right-sheet;

@include right-sheet.mat-right-sheet-theme($your-theme);
```

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/material-right-sheet/) for detailed information.

## Running Tests

```bash
nx test material-right-sheet
```

## License

MIT
