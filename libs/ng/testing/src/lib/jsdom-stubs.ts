/** Minimal `matchMedia` that never matches. Installed only if `window.matchMedia` is missing. */
export function installMatchMediaStub(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'function') return;
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

/** No-op `IntersectionObserver` that never reports entries. Installed only if missing. */
export function installIntersectionObserverStub(): void {
  if ('IntersectionObserver' in globalThis) return;
  class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = '0px';
    readonly thresholds: readonly number[] = [0];
    observe(): void {
      // no-op
    }
    unobserve(): void {
      // no-op
    }
    disconnect(): void {
      // no-op
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

/** No-op `ResizeObserver` that never reports entries. Installed only if missing. */
export function installResizeObserverStub(): void {
  if ('ResizeObserver' in globalThis) return;
  class ResizeObserverStub {
    observe(): void {
      // no-op
    }
    unobserve(): void {
      // no-op
    }
    disconnect(): void {
      // no-op
    }
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

/** UTF-8 `TextEncoder` (`encode` only). Installed only if missing. */
export function installTextEncoderStub(): void {
  if ('TextEncoder' in globalThis) return;
  class TextEncoderStub {
    readonly encoding = 'utf-8';
    encode(input = ''): Uint8Array {
      const bytes: number[] = [];
      for (const part of encodeURIComponent(input).split(/(%[0-9A-F]{2})/i)) {
        if (part.startsWith('%')) bytes.push(parseInt(part.slice(1), 16));
        else for (let i = 0; i < part.length; i++) bytes.push(part.charCodeAt(i));
      }
      return new Uint8Array(bytes);
    }
  }
  globalThis.TextEncoder = TextEncoderStub as unknown as typeof TextEncoder;
}

/**
 * Installs every stub above. Each one is added only where the environment lacks the API.
 * Call it once from a test setup file.
 */
export function installJsdomStubs(): void {
  installMatchMediaStub();
  installIntersectionObserverStub();
  installResizeObserverStub();
  installTextEncoderStub();
}
