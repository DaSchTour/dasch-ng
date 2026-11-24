/** Operating system family, as far as it matters for keyboard shortcuts. */
export type ShortcutPlatform = 'mac' | 'windows' | 'linux' | 'other';

/** The keys of a shortcut, shared by registration and display. */
export interface ShortcutKeys {
  /** The key as in `KeyboardEvent.key`, compared case-insensitively (for example `k`, `Escape`, `/`). */
  key: string;
  /** The primary modifier: Cmd on macOS, Ctrl on every other platform. */
  meta?: boolean;
  shift?: boolean;
  /** Alt on Windows and Linux, Option on macOS. */
  alt?: boolean;
}

/** Words or glyphs shown for each modifier. */
export type ModifierLabels = Record<'meta' | 'shift' | 'alt', string>;

/**
 * Detects the platform. Prefers `navigator.userAgentData.platform` and falls back to `navigator.platform`
 * and the user agent. Returns `'other'` where there is no `navigator` (server-side rendering).
 */
export function platform(): ShortcutPlatform {
  const nav = (globalThis as { navigator?: Navigator & { userAgentData?: { platform?: string } } }).navigator;
  if (!nav) {
    return 'other';
  }
  const name = (nav.userAgentData?.platform || nav.platform || nav.userAgent || '').toLowerCase();
  if (/mac|iphone|ipad|ipod/.test(name)) {
    return 'mac';
  }
  if (/win/.test(name)) {
    return 'windows';
  }
  if (/linux|x11|cros|android/.test(name)) {
    return 'linux';
  }
  return 'other';
}

/** Default modifier labels: `⌘ ⇧ ⌥` on macOS, `Ctrl Shift Alt` elsewhere. */
export function modifierLabels(target: ShortcutPlatform = platform()): ModifierLabels {
  return target === 'mac' ? { meta: '⌘', shift: '⇧', alt: '⌥' } : { meta: 'Ctrl', shift: 'Shift', alt: 'Alt' };
}

/** Options for {@link formatShortcut}. */
export interface FormatShortcutOptions {
  /** Defaults to {@link platform}(). */
  platform?: ShortcutPlatform;
  /** Replaces single labels, for example to translate `Shift`. */
  labels?: Partial<ModifierLabels>;
}

/**
 * Renders a shortcut for the current platform: `⌥⇧⌘K` on macOS (Apple's modifier order, no separator),
 * `Ctrl+Alt+Shift+K` elsewhere.
 */
export function formatShortcut(shortcut: ShortcutKeys, options: FormatShortcutOptions = {}): string {
  const target = options.platform ?? platform();
  const labels = { ...modifierLabels(target), ...options.labels };
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  const mac = target === 'mac';
  const parts = (mac ? (['alt', 'shift', 'meta'] as const) : (['meta', 'alt', 'shift'] as const))
    .filter((modifier) => shortcut[modifier])
    .map((modifier) => labels[modifier]);
  return [...parts, key].join(mac ? '' : '+');
}
