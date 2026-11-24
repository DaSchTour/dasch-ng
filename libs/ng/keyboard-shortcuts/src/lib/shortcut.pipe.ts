import { Pipe, PipeTransform } from '@angular/core';
import { formatShortcut, FormatShortcutOptions, ShortcutKeys } from './platform';

/**
 * Renders a shortcut with the symbols of the current platform, see {@link formatShortcut}.
 *
 * @example
 * ```html
 * <kbd>{{ { key: 'k', meta: true } | shortcut }}</kbd>
 * ```
 */
@Pipe({ name: 'shortcut' })
export class ShortcutPipe implements PipeTransform {
  transform(shortcut: ShortcutKeys, options?: FormatShortcutOptions): string {
    return formatShortcut(shortcut, options);
  }
}
