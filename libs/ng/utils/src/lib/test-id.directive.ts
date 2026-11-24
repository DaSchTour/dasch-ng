import { Directive, effect, ElementRef, inject, input, InjectionToken, Provider, Renderer2 } from '@angular/core';

/** Joined test id context of the current injector. Use {@link provideTestIdContext} to extend it. */
export const TEST_ID_CONTEXT = new InjectionToken<string>('TEST_ID_CONTEXT');

/** Options for {@link provideTestIdConfig}. */
export interface TestIdConfig {
  /** Attribute written to the element. Default: `'data-test-id'`. */
  attribute?: string;
  /** Set to `false` to write no attributes, e.g. in production builds. Default: `true`. */
  enabled?: boolean;
}

/** Holds the {@link TestIdConfig}. */
export const TEST_ID_CONFIG = new InjectionToken<TestIdConfig>('TEST_ID_CONFIG', { providedIn: 'root', factory: () => ({}) });

/** Sets the {@link TestIdConfig}. */
export function provideTestIdConfig(config: TestIdConfig): Provider {
  return { provide: TEST_ID_CONFIG, useValue: config };
}

/**
 * Adds a name to the test id context. Chains through the injector tree: nested components and
 * routes inherit the parent names, so `'checkout'` and then `'address'` give `checkout-address`.
 */
export function provideTestIdContext(name: string): Provider {
  return {
    provide: TEST_ID_CONTEXT,
    useFactory: () => [inject(TEST_ID_CONTEXT, { skipSelf: true, optional: true }), name].filter(Boolean).join('-'),
  };
}

/** Lower-cases, splits camelCase and replaces everything but letters and digits with single dashes. */
function kebab(value: string | number): string {
  return String(value)
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z\d]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Writes a stable test id attribute: kebab-case of context, base, tokens and index,
 * e.g. `checkout-address-submit-0`.
 *
 * @example
 * ```html
 * <button daschNgTestId="submit" [daschNgTestIdIndex]="i">Save</button>
 * ```
 */
@Directive({ selector: '[daschNgTestId]' })
export class TestIdDirective {
  private readonly renderer = inject(Renderer2);
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly context = inject(TEST_ID_CONTEXT, { optional: true });
  private readonly config = inject(TEST_ID_CONFIG);

  /** Base name of the id. */
  readonly base = input.required<string>({ alias: 'daschNgTestId' });
  /** Extra parts after the base, e.g. a record id. */
  readonly tokens = input<readonly (string | number)[]>([], { alias: 'daschNgTestIdTokens' });
  /** Position in a list, appended last. */
  readonly index = input<number | undefined>(undefined, { alias: 'daschNgTestIdIndex' });

  constructor() {
    effect(() => {
      if (this.config.enabled === false) return;
      const name = this.config.attribute ?? 'data-test-id';
      const parts = [this.context, this.base(), ...this.tokens(), this.index()].filter((part) => part !== null && part !== undefined);
      const id = parts.map(kebab).filter(Boolean).join('-');
      if (id) this.renderer.setAttribute(this.element, name, id);
      else this.renderer.removeAttribute(this.element, name);
    });
  }
}
