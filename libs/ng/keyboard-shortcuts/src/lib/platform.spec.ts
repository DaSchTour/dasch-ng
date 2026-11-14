import { formatShortcut, modifierLabels, platform } from './platform';

describe('platform', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('prefers userAgentData.platform', () => {
    vi.stubGlobal('navigator', { userAgentData: { platform: 'macOS' }, platform: 'Win32', userAgent: '' });
    expect(platform()).toBe('mac');
  });

  it.each([
    ['MacIntel', 'mac'],
    ['iPhone', 'mac'],
    ['Win32', 'windows'],
    ['Linux x86_64', 'linux'],
    ['Plan9', 'other'],
  ])('maps navigator.platform %s to %s', (value, expected) => {
    vi.stubGlobal('navigator', { platform: value });
    expect(platform()).toBe(expected);
  });

  it('falls back to the user agent', () => {
    vi.stubGlobal('navigator', { platform: '', userAgent: 'Mozilla/5.0 (X11; CrOS x86_64)' });
    expect(platform()).toBe('linux');
  });

  it('returns other without navigator (SSR)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(platform()).toBe('other');
  });
});

describe('formatShortcut', () => {
  it('uses symbols in Apple order on macOS', () => {
    expect(formatShortcut({ key: 'k', meta: true, shift: true, alt: true }, { platform: 'mac' })).toBe('⌥⇧⌘K');
  });

  it('uses words elsewhere', () => {
    expect(formatShortcut({ key: 'k', meta: true, shift: true, alt: true }, { platform: 'windows' })).toBe('Ctrl+Alt+Shift+K');
  });

  it('keeps named keys as they are', () => {
    expect(formatShortcut({ key: 'Escape' }, { platform: 'linux' })).toBe('Escape');
  });

  it('lets labels be overridden', () => {
    expect(formatShortcut({ key: 's', meta: true }, { platform: 'linux', labels: { meta: 'Strg' } })).toBe('Strg+S');
  });

  it('exposes default labels', () => {
    expect(modifierLabels('mac').meta).toBe('⌘');
    expect(modifierLabels('other').meta).toBe('Ctrl');
  });
});
