import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { DEFAULT_BREAKPOINTS, injectActiveBreakpoint, injectBreakpoint, provideBreakpoints } from './breakpoints';

/** Stand-in for BreakpointObserver where the test decides which queries match. */
class FakeObserver {
  readonly matching = new BehaviorSubject<ReadonlySet<string>>(new Set());
  isMatched(query: string) {
    return this.matching.value.has(query);
  }
  observe(queries: string | string[]): Observable<BreakpointState> {
    const list = Array.isArray(queries) ? queries : [queries];
    return this.matching.pipe(
      map((set) => ({
        matches: list.some((q) => set.has(q)),
        breakpoints: Object.fromEntries(list.map((q) => [q, set.has(q)])),
      })),
    );
  }
}

const MOBILE = '(max-width: 767.98px)';
const DESKTOP = '(min-width: 768px)';

function setup(fake: FakeObserver, breakpoints = { mobile: MOBILE, desktop: DESKTOP }) {
  TestBed.configureTestingModule({
    providers: [provideBreakpoints(breakpoints), { provide: BreakpointObserver, useValue: fake }],
  });
  return TestBed.inject(Injector);
}

describe('breakpoints', () => {
  it('injectBreakpoint follows the media query', () => {
    const fake = new FakeObserver();
    const injector = setup(fake);
    const mobile = runInInjectionContext(injector, () => injectBreakpoint('mobile'));

    expect(mobile()).toBe(false);
    fake.matching.next(new Set([MOBILE]));
    expect(mobile()).toBe(true);
    fake.matching.next(new Set([DESKTOP]));
    expect(mobile()).toBe(false);
  });

  it('injectBreakpoint starts with the current match', () => {
    const fake = new FakeObserver();
    fake.matching.next(new Set([MOBILE]));
    const mobile = runInInjectionContext(setup(fake), () => injectBreakpoint('mobile'));
    expect(mobile()).toBe(true);
  });

  it('injectBreakpoint throws for an unknown name', () => {
    const injector = setup(new FakeObserver());
    expect(() => runInInjectionContext(injector, () => injectBreakpoint('tablet'))).toThrow(/Unknown breakpoint "tablet"/);
  });

  it('injectActiveBreakpoint returns the matching name, or null', () => {
    const fake = new FakeObserver();
    const active = runInInjectionContext(setup(fake), () => injectActiveBreakpoint());

    expect(active()).toBeNull();
    fake.matching.next(new Set([DESKTOP]));
    expect(active()).toBe('desktop');
    fake.matching.next(new Set([MOBILE]));
    expect(active()).toBe('mobile');
  });

  it('injectActiveBreakpoint picks the first match in map order when queries overlap', () => {
    const fake = new FakeObserver();
    const active = runInInjectionContext(setup(fake), () => injectActiveBreakpoint());
    fake.matching.next(new Set([MOBILE, DESKTOP]));
    expect(active()).toBe('mobile');
  });

  it('provideBreakpoints replaces the defaults instead of merging', () => {
    const fake = new FakeObserver();
    const injector = setup(fake);
    expect(() => runInInjectionContext(injector, () => injectBreakpoint('xs'))).toThrow();
  });

  it('works with the real BreakpointObserver and the default breakpoints', () => {
    TestBed.configureTestingModule({});
    const active = TestBed.runInInjectionContext(() => injectActiveBreakpoint());
    expect(Object.keys(DEFAULT_BREAKPOINTS)).toContain(active());
    const matching = Object.keys(DEFAULT_BREAKPOINTS).filter((name) => TestBed.runInInjectionContext(() => injectBreakpoint(name))());
    expect(matching).toEqual([active()]);
  });
});
