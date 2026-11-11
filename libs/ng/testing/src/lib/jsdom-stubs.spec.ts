import { installIntersectionObserverStub, installJsdomStubs, installMatchMediaStub, installResizeObserverStub, installTextEncoderStub } from './jsdom-stubs';

type Target = Record<string, unknown>;
const globals = globalThis as unknown as Target;
const stubbed = ['IntersectionObserver', 'ResizeObserver', 'TextEncoder'];

describe('jsdom stubs', () => {
  const originals = new Map<string, unknown>();

  beforeEach(() => {
    for (const name of [...stubbed, 'matchMedia']) {
      originals.set(name, globals[name]);
      delete globals[name];
    }
  });

  afterEach(() => {
    for (const [name, value] of originals) {
      if (value === undefined) delete globals[name];
      else globals[name] = value;
    }
  });

  it('installs matchMedia that does not match', () => {
    installMatchMediaStub();
    const query = window.matchMedia('(min-width: 1px)');
    expect(query.matches).toBe(false);
    expect(query.media).toBe('(min-width: 1px)');
  });

  it('installs IntersectionObserver and ResizeObserver stubs', () => {
    installIntersectionObserverStub();
    installResizeObserverStub();
    const el = document.createElement('div');
    new IntersectionObserver(() => undefined).observe(el);
    new ResizeObserver(() => undefined).observe(el);
    expect(new IntersectionObserver(() => undefined).takeRecords()).toEqual([]);
  });

  it('encodes UTF-8 like the native TextEncoder', () => {
    const native = new (originals.get('TextEncoder') as typeof TextEncoder)();
    installTextEncoderStub();
    const text = 'aé€😀';
    expect(Array.from(new TextEncoder().encode(text))).toEqual(Array.from(native.encode(text)));
  });

  it('keeps APIs that already exist', () => {
    const existing = class {};
    globals['ResizeObserver'] = existing;
    const matchMedia = () => ({}) as MediaQueryList;
    window.matchMedia = matchMedia;
    installJsdomStubs();
    expect(globals['ResizeObserver']).toBe(existing);
    expect(window.matchMedia).toBe(matchMedia);
  });

  it('installs everything at once', () => {
    installJsdomStubs();
    for (const name of [...stubbed, 'matchMedia']) {
      expect(globals[name]).toBeDefined();
    }
  });
});
