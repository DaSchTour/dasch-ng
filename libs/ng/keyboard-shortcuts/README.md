# @dasch-ng/keyboard-shortcuts

App-wide keyboard shortcuts for Angular with platform-aware labels.

## Installation

```bash
npm install @dasch-ng/keyboard-shortcuts
```

## Features

- One document listener for all shortcuts
- Ignores events from inputs, textareas, selects and contenteditable elements unless `allowInInputs` is set
- Automatic cleanup when registered in an injection context
- `meta` means Cmd on macOS and Ctrl on every other platform
- `platform()` helper and a `shortcut` pipe that shows `⌘K` or `Ctrl+K`
- SSR-safe

## Basic Usage

```typescript
import { Component, inject } from '@angular/core';
import { KeyboardShortcuts, ShortcutPipe } from '@dasch-ng/keyboard-shortcuts';

@Component({
  selector: 'app-search',
  imports: [ShortcutPipe],
  template: `<kbd>{{ { key: 'k', meta: true } | shortcut }}</kbd>`,
})
export class SearchComponent {
  constructor() {
    inject(KeyboardShortcuts).register({
      key: 'k',
      meta: true,
      label: 'Open search',
      action: () => this.open(),
    });
  }

  open() {}
}
```

`register()` returns a function that removes the shortcut. `KeyboardShortcuts.shortcuts` is a readonly signal of all registered shortcuts, handy for a help dialog.

## API Reference

See the [full documentation](https://dasch.ng/libraries/keyboard-shortcuts) and the [API reference](https://dasch.ng/api/@dasch-ng/keyboard-shortcuts/).

## Running Tests

```bash
nx test keyboard-shortcuts
```

## License

MIT
