import { ComponentFixture, TestBed } from '@angular/core/testing';

/**
 * Settles a fixture in a zoneless test.
 *
 * Runs change detection on the fixture, flushes effects and ticks the application
 * (`TestBed.tick()`), then waits one microtask so promise callbacks can run, and renders
 * their result in a second pass. It never calls `fixture.whenStable()`, which can hang
 * when the app keeps a task open (timers, polling, pending requests).
 *
 * @example
 * ```ts
 * fixture.componentInstance.count.set(2);
 * await flushUI(fixture);
 * expect(fixture.nativeElement.textContent).toContain('2');
 * ```
 */
export async function flushUI(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  TestBed.tick();
  await Promise.resolve();
  fixture.detectChanges();
  TestBed.tick();
}
