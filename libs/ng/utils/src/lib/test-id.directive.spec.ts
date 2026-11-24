import { Component, Provider, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestIdConfig, provideTestIdContext, TestIdDirective } from './test-id.directive';

@Component({
  selector: 'dasch-ng-test-inner',
  imports: [TestIdDirective],
  providers: [provideTestIdContext('addressForm')],
  template: `<button daschNgTestId="submit" [daschNgTestIdTokens]="['Home', 7]" [daschNgTestIdIndex]="index()">Save</button>`,
})
class InnerComponent {
  readonly index = signal<number | undefined>(0);
}

@Component({
  imports: [InnerComponent, TestIdDirective],
  providers: [provideTestIdContext('checkout')],
  template: `<a daschNgTestId="back">Back</a><dasch-ng-test-inner />`,
})
class OuterComponent {}

@Component({ imports: [TestIdDirective], template: `<i [daschNgTestId]="name()"></i>` })
class PlainComponent {
  readonly name = signal('solo');
}

function render<T>(type: new () => T, providers: Provider[] = []) {
  TestBed.configureTestingModule({ providers });
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

describe('TestIdDirective', () => {
  it('chains the context through nested providers and builds a kebab-case id', () => {
    const el: HTMLElement = render(OuterComponent).nativeElement;

    expect(el.querySelector('a')?.getAttribute('data-test-id')).toBe('checkout-back');
    expect(el.querySelector('button')?.getAttribute('data-test-id')).toBe('checkout-address-form-submit-home-7-0');
  });

  it('works without any context and leaves out an empty index', () => {
    const el: HTMLElement = render(PlainComponent).nativeElement;
    expect(el.querySelector('i')?.getAttribute('data-test-id')).toBe('solo');
  });

  it('updates the id when an input changes', () => {
    const fixture = render(OuterComponent);
    const inner = fixture.debugElement.children[1].componentInstance as InnerComponent;

    inner.index.set(undefined);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button').getAttribute('data-test-id')).toBe('checkout-address-form-submit-home-7');
  });

  it('uses a configured attribute name', () => {
    const el: HTMLElement = render(PlainComponent, [provideTestIdConfig({ attribute: 'data-cy' })]).nativeElement;
    expect(el.querySelector('i')?.getAttribute('data-cy')).toBe('solo');
    expect(el.querySelector('i')?.hasAttribute('data-test-id')).toBe(false);
  });

  it('writes nothing when switched off', () => {
    const el: HTMLElement = render(PlainComponent, [provideTestIdConfig({ enabled: false })]).nativeElement;
    expect(el.querySelector('i')?.hasAttribute('data-test-id')).toBe(false);
  });

  it('removes the attribute when nothing is left to build an id from', () => {
    const fixture = render(PlainComponent);
    const el: HTMLElement = fixture.nativeElement;

    fixture.componentInstance.name.set('!!!');
    fixture.detectChanges();

    expect(el.querySelector('i')?.hasAttribute('data-test-id')).toBe(false);
  });
});
