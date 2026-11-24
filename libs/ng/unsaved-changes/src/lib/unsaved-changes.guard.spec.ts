import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { UNSAVED_CHANGES_CONFIRM, UNSAVED_CHANGES_MESSAGE } from './unsaved-changes-confirm';
import { formHasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

@Component({ template: 'edit' })
class EditComponent {
  readonly dirty = signal(false);
  hasUnsavedChanges = () => this.dirty();
}

@Component({ template: 'other' })
class OtherComponent {}

function setup(confirm?: () => unknown) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'edit', component: EditComponent, canDeactivate: [unsavedChangesGuard] },
        { path: 'other', component: OtherComponent },
      ]),
      ...(confirm ? [{ provide: UNSAVED_CHANGES_CONFIRM, useValue: confirm }] : []),
    ],
  });
}

describe('unsavedChangesGuard', () => {
  it('navigates without asking when nothing changed', async () => {
    const confirm = vi.fn(() => false);
    setup(confirm);
    const harness = await RouterTestingHarness.create('/edit');

    await harness.navigateByUrl('/other');

    expect(TestBed.inject(Router).url).toBe('/other');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('stays when the confirm answers false', async () => {
    setup(() => false);
    const harness = await RouterTestingHarness.create('/edit');
    harness.routeDebugElement?.componentInstance.dirty.set(true);

    await harness.navigateByUrl('/other');

    expect(TestBed.inject(Router).url).toBe('/edit');
  });

  it('leaves when the confirm answers true', async () => {
    setup(() => true);
    const harness = await RouterTestingHarness.create('/edit');
    harness.routeDebugElement?.componentInstance.dirty.set(true);

    await harness.navigateByUrl('/other');

    expect(TestBed.inject(Router).url).toBe('/other');
  });

  it('accepts an Observable answer', async () => {
    setup(() => of(true));
    const harness = await RouterTestingHarness.create('/edit');
    harness.routeDebugElement?.componentInstance.dirty.set(true);

    await harness.navigateByUrl('/other');

    expect(TestBed.inject(Router).url).toBe('/other');
  });

  it('accepts a Promise answer', async () => {
    setup(() => Promise.resolve(false));
    const harness = await RouterTestingHarness.create('/edit');
    harness.routeDebugElement?.componentInstance.dirty.set(true);

    await harness.navigateByUrl('/other');

    expect(TestBed.inject(Router).url).toBe('/edit');
  });

  it('works with a signal as hasUnsavedChanges', async () => {
    @Component({ template: '' })
    class SignalComponent {
      readonly hasUnsavedChanges = signal(true);
    }
    const confirm = vi.fn(() => false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'sig', component: SignalComponent, canDeactivate: [unsavedChangesGuard] },
          { path: 'other', component: OtherComponent },
        ]),
        { provide: UNSAVED_CHANGES_CONFIRM, useValue: confirm },
      ],
    });
    const harness = await RouterTestingHarness.create('/sig');

    await harness.navigateByUrl('/other');

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(Router).url).toBe('/sig');
  });

  describe('default confirm', () => {
    it('calls window.confirm with the configured message', async () => {
      const spy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      setup();
      TestBed.overrideProvider(UNSAVED_CHANGES_MESSAGE, { useValue: 'Discard?' });
      const harness = await RouterTestingHarness.create('/edit');
      harness.routeDebugElement?.componentInstance.dirty.set(true);

      await harness.navigateByUrl('/other');

      expect(spy).toHaveBeenCalledWith('Discard?');
      expect(TestBed.inject(Router).url).toBe('/edit');
      spy.mockRestore();
    });
  });
});

describe('formHasUnsavedChanges', () => {
  it('reads a FormGroup', () => {
    const group = new FormGroup({ name: new FormControl('') });
    expect(formHasUnsavedChanges(group)).toBe(false);
    group.controls.name.markAsDirty();
    expect(formHasUnsavedChanges(group)).toBe(true);
  });

  it('reads an NgForm', () => {
    const ngForm = new NgForm([], []);
    expect(formHasUnsavedChanges(ngForm)).toBe(false);
    ngForm.control.markAsDirty();
    expect(formHasUnsavedChanges(ngForm)).toBe(true);
  });

  it('reads a signal form', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ name: '' }));
      expect(formHasUnsavedChanges(f)).toBe(false);
      f.name().markAsDirty();
      expect(formHasUnsavedChanges(f)).toBe(true);
    });
  });
});
