# Keyboard Shortcuts

App-wide keyboard shortcuts for Angular with platform-aware labels: one document listener, automatic cleanup, and a pipe that shows `⌘K` on a Mac and `Ctrl+K` everywhere else.

## Installation

```bash
npm install @dasch-ng/keyboard-shortcuts
```

Peer dependencies: `@angular/core` and `@angular/common`.

## Features

- **One listener**: all shortcuts share a single `keydown` listener on the document
- **Safe in forms**: events from inputs, textareas, selects and contenteditable elements are ignored unless you opt in
- **Automatic cleanup**: shortcuts registered in a constructor or field initializer are removed when the component is destroyed
- **Platform aware**: Cmd on macOS, Ctrl on Windows and Linux, with matching labels
- **SSR-safe**: nothing is registered on the server, and platform detection returns `'other'`

## Registering shortcuts

```typescript
import { Component, inject } from '@angular/core';
import { KeyboardShortcuts } from '@dasch-ng/keyboard-shortcuts';

@Component({
  selector: 'app-search',
  template: `...`,
})
export class SearchComponent {
  private readonly shortcuts = inject(KeyboardShortcuts);

  constructor() {
    // Removed automatically when the component is destroyed.
    this.shortcuts.register({
      key: 'k',
      meta: true,
      label: 'Open search',
      action: () => this.open(),
    });
  }

  open() {}
}
```

Outside an injection context, call the returned function to remove the shortcut:

```typescript
const unregister = shortcuts.register({ key: 'Escape', action: () => close() });
// later
unregister();
```

### Options

| Option          | Type                             | Description                                                             |
| --------------- | -------------------------------- | ----------------------------------------------------------------------- |
| `key`           | `string`                         | Key as in `KeyboardEvent.key`, compared case-insensitively              |
| `meta`          | `boolean`                        | Cmd on macOS, Ctrl on Windows and Linux                                 |
| `shift`         | `boolean`                        | Shift                                                                   |
| `alt`           | `boolean`                        | Alt on Windows and Linux, Option on macOS                               |
| `action`        | `(event: KeyboardEvent) => void` | Runs on match. The browser default is prevented                         |
| `label`         | `string`                         | Description, for a help dialog                                          |
| `allowInInputs` | `boolean`                        | Also fire while typing in an input, textarea, select or contenteditable |

### Matching rules

- `meta` means **Cmd on macOS and Ctrl on every other platform**. The other key is not accepted: Ctrl+K does not trigger a `meta` shortcut on a Mac, and Cmd+K does not on Windows.
- Modifiers match exactly. A shortcut without `shift` does not fire when Shift is held. Register `?` as `{ key: '?', shift: true }`.
- With Alt held, macOS reports special characters as the key. Letters and digits therefore also match the physical key (`event.code`), so `{ key: 'k', alt: true }` works on every platform.
- If several shortcuts match the same event, all of them run.

## Showing shortcuts

The `shortcut` pipe renders a shortcut for the current platform. It adds no markup or styles, so wrap it in `<kbd>` yourself.

```typescript
import { ShortcutPipe } from '@dasch-ng/keyboard-shortcuts';

@Component({
  imports: [ShortcutPipe],
  template: `<kbd>{{ { key: 'k', meta: true } | shortcut }}</kbd>`,
})
export class HintComponent {}
```

| Platform        | Output for `{ key: 'k', meta: true, shift: true, alt: true }` |
| --------------- | ------------------------------------------------------------- |
| macOS           | `⌥⇧⌘K`                                                        |
| Windows / Linux | `Ctrl+Alt+Shift+K`                                            |

The pipe takes optional `{ platform, labels }`. Override single words, for example to translate them:

```html
<kbd>{{ shortcut | shortcut: { labels: { meta: 'Strg' } } }}</kbd>
```

## Platform helpers

```typescript
import { platform, modifierLabels, formatShortcut } from '@dasch-ng/keyboard-shortcuts';

platform(); // 'mac' | 'windows' | 'linux' | 'other'
modifierLabels('mac'); // { meta: '⌘', shift: '⇧', alt: '⌥' }
formatShortcut({ key: 's', meta: true }, { platform: 'windows' }); // 'Ctrl+S'
```

`platform()` reads `navigator.userAgentData.platform` and falls back to `navigator.platform` and the user agent. Without `navigator` (server-side rendering) it returns `'other'`.

## Help dialog

`KeyboardShortcuts.shortcuts` is a readonly signal with all registered shortcuts in registration order:

```typescript
@Component({
  imports: [ShortcutPipe],
  template: `
    @for (s of shortcuts.shortcuts(); track s) {
      @if (s.label) {
        <div>
          {{ s.label }} <kbd>{{ s | shortcut }}</kbd>
        </div>
      }
    }
  `,
})
export class ShortcutHelpComponent {
  protected readonly shortcuts = inject(KeyboardShortcuts);
}
```

## Relation to EventModifiersPlugin

`@dasch-ng/utils` offers `EventModifiersPlugin` for `.prevent` and `.stop` on template event bindings, for example `(keydown.enter.prevent)`. That binds to one element in a template. This library handles shortcuts that work anywhere in the app, are registered in code and are shown in the UI. Use the plugin for element-level key handling and this library for global shortcuts.

## API Reference

See the [API Reference](../api/@dasch-ng/keyboard-shortcuts/) for all types and functions.

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/keyboard-shortcuts).

## License

MIT
