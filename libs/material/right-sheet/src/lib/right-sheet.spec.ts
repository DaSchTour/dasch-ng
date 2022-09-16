import { Directionality } from '@angular/cdk/bidi';
import { A, ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer, ScrollStrategy } from '@angular/cdk/overlay';
import { _supportsShadowDom } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import {
  Component,
  Directive,
  Inject,
  Injector,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  inject,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MAT_RIGHT_SHEET_DEFAULT_OPTIONS, MatRightSheet } from './right-sheet';
import {
  MAT_RIGHT_SHEET_DATA,
  MatRightSheetConfig,
} from './right-sheet.config';
import { MatRightSheetModule } from './right-sheet.module';
import { MatRightSheetRef } from './right-sheet.ref';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ModifierKeys } from '@angular/cdk/testing';

/** Used to generate unique IDs for events. */
let uniqueIds = 0;

/**
 * Creates a browser MouseEvent with the specified options.
 * @docs-private
 */
export function createMouseEvent(
  type: string,
  clientX = 0,
  clientY = 0,
  offsetX = 1,
  offsetY = 1,
  button = 0,
  modifiers: ModifierKeys = {}
) {
  // Note: We cannot determine the position of the mouse event based on the screen
  // because the dimensions and position of the browser window are not available
  // To provide reasonable `screenX` and `screenY` coordinates, we simply use the
  // client coordinates as if the browser is opened in fullscreen.
  const screenX = clientX;
  const screenY = clientY;

  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true, // Required for shadow DOM events.
    view: window,
    detail: 0,
    relatedTarget: null,
    screenX,
    screenY,
    clientX,
    clientY,
    ctrlKey: modifiers.control,
    altKey: modifiers.alt,
    shiftKey: modifiers.shift,
    metaKey: modifiers.meta,
    button: button,
    buttons: 1,
  });

  // The `MouseEvent` constructor doesn't allow us to pass these properties into the constructor.
  // Override them to `1`, because they're used for fake screen reader event detection.
  if (offsetX != null) {
    defineReadonlyEventProperty(event, 'offsetX', offsetX);
  }

  if (offsetY != null) {
    defineReadonlyEventProperty(event, 'offsetY', offsetY);
  }

  return event;
}

/**
 * Creates a browser `PointerEvent` with the specified options. Pointer events
 * by default will appear as if they are the primary pointer of their type.
 * https://www.w3.org/TR/pointerevents2/#dom-pointerevent-isprimary.
 *
 * For example, if pointer events for a multi-touch interaction are created, the non-primary
 * pointer touches would need to be represented by non-primary pointer events.
 *
 * @docs-private
 */
export function createPointerEvent(
  type: string,
  clientX = 0,
  clientY = 0,
  offsetX?: number,
  offsetY?: number,
  options: PointerEventInit = { isPrimary: true }
) {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true, // Required for shadow DOM events.
    view: window,
    clientX,
    clientY,
    ...options,
  });

  if (offsetX != null) {
    defineReadonlyEventProperty(event, 'offsetX', offsetX);
  }

  if (offsetY != null) {
    defineReadonlyEventProperty(event, 'offsetY', offsetY);
  }

  return event;
}

/**
 * Creates a browser TouchEvent with the specified pointer coordinates.
 * @docs-private
 */
export function createTouchEvent(
  type: string,
  pageX = 0,
  pageY = 0,
  clientX = 0,
  clientY = 0
) {
  // We cannot use the `TouchEvent` or `Touch` because Firefox and Safari lack support.
  // TODO: Switch to the constructor API when it is available for Firefox and Safari.
  const event = document.createEvent('UIEvent');
  const touchDetails = {
    pageX,
    pageY,
    clientX,
    clientY,
    identifier: uniqueIds++,
  };

  // TS3.6 removes the initUIEvent method and suggests porting to "new UIEvent()".
  (event as any).initUIEvent(type, true, true, window, 0);

  // Most of the browsers don't have a "initTouchEvent" method that can be used to define
  // the touch details.
  defineReadonlyEventProperty(event, 'touches', [touchDetails]);
  defineReadonlyEventProperty(event, 'targetTouches', [touchDetails]);
  defineReadonlyEventProperty(event, 'changedTouches', [touchDetails]);

  return event;
}

/**
 * Creates a keyboard event with the specified key and modifiers.
 * @docs-private
 */
export function createKeyboardEvent(
  type: string,
  keyCode: number = 0,
  key: string = '',
  modifiers: ModifierKeys = {}
) {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true, // Required for shadow DOM events.
    view: window,
    keyCode: keyCode,
    key: key,
    shiftKey: modifiers.shift,
    metaKey: modifiers.meta,
    altKey: modifiers.alt,
    ctrlKey: modifiers.control,
  });
}

/**
 * Creates a fake event object with any desired event type.
 * @docs-private
 */
export function createFakeEvent(
  type: string,
  bubbles = false,
  cancelable = true,
  composed = true
) {
  return new Event(type, { bubbles, cancelable, composed });
}

/**
 * Defines a readonly property on the given event object. Readonly properties on an event object
 * are always set as configurable as that matches default readonly properties for DOM event objects.
 */
function defineReadonlyEventProperty(
  event: Event,
  propertyName: string,
  value: any
) {
  Object.defineProperty(event, propertyName, {
    get: () => value,
    configurable: true,
  });
}

/**
 * Utility to dispatch any event on a Node.
 * @docs-private
 */
export function dispatchEvent<T extends Event>(
  node: Node | Window,
  event: T
): T {
  node.dispatchEvent(event);
  return event;
}

/**
 * Shorthand to dispatch a fake event on a specified node.
 * @docs-private
 */
export function dispatchFakeEvent(
  node: Node | Window,
  type: string,
  bubbles?: boolean
): Event {
  return dispatchEvent(node, createFakeEvent(type, bubbles));
}

/**
 * Shorthand to dispatch a keyboard event with a specified key code and
 * optional modifiers.
 * @docs-private
 */
export function dispatchKeyboardEvent(
  node: Node,
  type: string,
  keyCode?: number,
  key?: string,
  modifiers?: ModifierKeys
): KeyboardEvent {
  return dispatchEvent(
    node,
    createKeyboardEvent(type, keyCode, key, modifiers)
  );
}

/**
 * Shorthand to dispatch a mouse event on the specified coordinates.
 * @docs-private
 */
export function dispatchMouseEvent(
  node: Node,
  type: string,
  clientX = 0,
  clientY = 0,
  offsetX?: number,
  offsetY?: number,
  button?: number,
  modifiers?: ModifierKeys
): MouseEvent {
  return dispatchEvent(
    node,
    createMouseEvent(
      type,
      clientX,
      clientY,
      offsetX,
      offsetY,
      button,
      modifiers
    )
  );
}

/**
 * Shorthand to dispatch a pointer event on the specified coordinates.
 * @docs-private
 */
export function dispatchPointerEvent(
  node: Node,
  type: string,
  clientX = 0,
  clientY = 0,
  offsetX?: number,
  offsetY?: number,
  options?: PointerEventInit
): PointerEvent {
  return dispatchEvent(
    node,
    createPointerEvent(type, clientX, clientY, offsetX, offsetY, options)
  ) as PointerEvent;
}

/**
 * Shorthand to dispatch a touch event on the specified coordinates.
 * @docs-private
 */
export function dispatchTouchEvent(
  node: Node,
  type: string,
  pageX = 0,
  pageY = 0,
  clientX = 0,
  clientY = 0
) {
  return dispatchEvent(
    node,
    createTouchEvent(type, pageX, pageY, clientX, clientY)
  );
}

describe('MatRightSheet', () => {
  let rightSheet: MatRightSheet;
  let overlayContainerElement: HTMLElement;
  let viewportRuler: ViewportRuler;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let mockLocation: SpyLocation;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatRightSheetModule, NoopAnimationsModule],
      declarations: [
        ComponentWithChildViewContainer,
        ComponentWithTemplateRef,
        ContentElementDialog,
        PizzaMsg,
        TacoMsg,
        DirectiveWithViewContainer,
        RightSheetWithInjectedData,
        ShadowDomComponent,
      ],
      providers: [{ provide: Location, useClass: SpyLocation }],
    }).compileComponents();
  }));

  beforeEach(inject(
    [MatRightSheet, OverlayContainer, ViewportRuler, Location],
    (
      bs: MatRightSheet,
      oc: OverlayContainer,
      vr: ViewportRuler,
      l: Location
    ) => {
      rightSheet = bs;
      viewportRuler = vr;
      overlayContainerElement = oc.getContainerElement();
      mockLocation = l as SpyLocation;
    }
  ));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(
      ComponentWithChildViewContainer
    );

    viewContainerFixture.detectChanges();
    testViewContainerRef =
      viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open a right sheet with a component', () => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(rightSheetRef.instance instanceof PizzaMsg).toBe(true);
    expect(rightSheetRef.instance.rightSheetRef).toBe(rightSheetRef);
  });

  it('should open a right sheet with a template', () => {
    const templateRefFixture = TestBed.createComponent(
      ComponentWithTemplateRef
    );
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.detectChanges();

    const rightSheetRef = rightSheet.open(
      templateRefFixture.componentInstance.templateRef,
      {
        data: { value: 'Knees' },
      }
    );

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.rightSheetRef).toBe(
      rightSheetRef
    );
  });

  it('should position the right sheet at the right on screen', () => {
    rightSheet.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector(
      'mat-right-sheet-container'
    )!;
    const containerRect = containerElement.getBoundingClientRect();
    const viewportSize = viewportRuler.getViewportSize();
    const viewportRect = viewportRuler.getViewportRect();

    // 8 is the scrollbar width
    expect(Math.floor(containerRect.left)).toBe(8);
    expect(Math.floor(containerRect.right)).toBe(428);
    expect(
      Math.floor(containerRect.bottom) - Math.floor(containerRect.top)
    ).toBe(Math.floor(viewportRect.bottom));
    expect(Math.floor(containerRect.height)).toBe(
      Math.floor(viewportSize.height)
    );
  });

  it('should have the width provided with config', () => {
    rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
      width: '220px',
    });

    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector(
      'mat-right-sheet-container'
    )!;
    const containerRect = containerElement.getBoundingClientRect();
    const viewportSize = viewportRuler.getViewportSize();
    const viewportRect = viewportRuler.getViewportRect();

    // 8 is the scrollbar width
    expect(Math.floor(containerRect.left)).toBe(8);
    expect(Math.floor(containerRect.right)).toBe(228);
    expect(
      Math.floor(containerRect.bottom) - Math.floor(containerRect.top)
    ).toBe(Math.floor(viewportRect.bottom));
    expect(Math.floor(containerRect.height)).toBe(
      Math.floor(viewportSize.height)
    );
  });

  it('should emit when the right sheet opening animation is complete', fakeAsync(() => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });
    const spy = jasmine.createSpy('afterOpened spy');

    rightSheetRef.afterOpened().subscribe(spy);
    viewContainerFixture.detectChanges();

    // callback should not be called before animation is complete
    expect(spy).not.toHaveBeenCalled();

    flushMicrotasks();
    expect(spy).toHaveBeenCalled();
  }));

  it('should use the correct injector', () => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });
    viewContainerFixture.detectChanges();
    const injector = rightSheetRef.instance.injector;

    expect(rightSheetRef.instance.rightSheetRef).toBe(rightSheetRef);
    expect(
      injector.get<DirectiveWithViewContainer>(DirectiveWithViewContainer)
    ).toBeTruthy();
  });

  it('should open a right sheet with a component and no ViewContainerRef', () => {
    const rightSheetRef = rightSheet.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(rightSheetRef.instance instanceof PizzaMsg).toBe(true);
    expect(rightSheetRef.instance.rightSheetRef).toBe(rightSheetRef);
  });

  it('should apply the correct role to the container element', () => {
    rightSheet.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector(
      'mat-right-sheet-container'
    )!;
    expect(containerElement.getAttribute('role')).toBe('dialog');
  });

  it('should close a right sheet via the escape key', fakeAsync(() => {
    rightSheet.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

    const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeNull();
    expect(event.defaultPrevented).toBe(true);
  }));

  it('should not close a right sheet via the escape key with a modifier', fakeAsync(() => {
    rightSheet.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

    const event = createKeyboardEvent('keydown', ESCAPE, undefined, {
      alt: true,
    });
    dispatchEvent(document.body, event);
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  }));

  it('should close when clicking on the overlay backdrop', fakeAsync(() => {
    rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector(
      '.cdk-overlay-backdrop'
    ) as HTMLElement;

    backdrop.click();
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeFalsy();
  }));

  it('should dispose of right sheet if view container is destroyed while animating', fakeAsync(() => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });

    rightSheetRef.dismiss();
    viewContainerFixture.detectChanges();
    viewContainerFixture.destroy();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-dialog-container')
    ).toBeNull();
  }));

  it('should emit the backdropClick stream when clicking on the overlay backdrop', fakeAsync(() => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });
    const spy = jasmine.createSpy('backdropClick spy');

    rightSheetRef.backdropClick().subscribe(spy);
    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector(
      '.cdk-overlay-backdrop'
    ) as HTMLElement;

    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);

    viewContainerFixture.detectChanges();
    flush();

    // Additional clicks after the right sheet was closed should not be emitted
    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should emit the keyboardEvent stream when key events target the overlay', fakeAsync(() => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });
    const spy = jasmine.createSpy('keyboardEvent spy');

    rightSheetRef.keydownEvents().subscribe(spy);
    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector(
      '.cdk-overlay-backdrop'
    ) as HTMLElement;
    const container = overlayContainerElement.querySelector(
      'mat-right-sheet-container'
    ) as HTMLElement;
    dispatchKeyboardEvent(document.body, 'keydown', A);
    dispatchKeyboardEvent(backdrop, 'keydown', A);
    dispatchKeyboardEvent(container, 'keydown', A);

    expect(spy).toHaveBeenCalledTimes(3);
  }));

  it('should allow setting the layout direction', () => {
    rightSheet.open(PizzaMsg, { direction: 'rtl' });

    viewContainerFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector(
      '.cdk-global-overlay-wrapper'
    )!;

    expect(overlayPane.getAttribute('dir')).toBe('rtl');
  });

  it('should inject the correct direction in the instantiated component', () => {
    const rightSheetRef = rightSheet.open(PizzaMsg, { direction: 'rtl' });

    viewContainerFixture.detectChanges();

    expect(rightSheetRef.instance.directionality.value).toBe('rtl');
  });

  it('should fall back to injecting the global direction if none is passed by the config', () => {
    const rightSheetRef = rightSheet.open(PizzaMsg, {});

    viewContainerFixture.detectChanges();

    expect(rightSheetRef.instance.directionality.value).toBe('ltr');
  });

  it('should be able to set a custom panel class', () => {
    rightSheet.open(PizzaMsg, {
      panelClass: 'custom-panel-class',
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    expect(
      overlayContainerElement.querySelector('.custom-panel-class')
    ).toBeTruthy();
  });

  it('should be able to set a custom aria-label', () => {
    rightSheet.open(PizzaMsg, {
      ariaLabel: 'Hello there',
      viewContainerRef: testViewContainerRef,
    });
    viewContainerFixture.detectChanges();

    const container = overlayContainerElement.querySelector(
      'mat-right-sheet-container'
    )!;
    expect(container.getAttribute('aria-label')).toBe('Hello there');
  });

  it('should be able to get dismissed through the service', fakeAsync(() => {
    rightSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    rightSheet.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBe(0);
  }));

  it('should dismiss the right sheet when the service is destroyed', fakeAsync(() => {
    rightSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    rightSheet.ngOnDestroy();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBe(0);
  }));

  it('should open a new right sheet after dismissing a previous sheet', fakeAsync(() => {
    const config: MatRightSheetConfig = {
      viewContainerRef: testViewContainerRef,
    };
    let rightSheetRef: MatRightSheetRef<any> = rightSheet.open(
      PizzaMsg,
      config
    );

    viewContainerFixture.detectChanges();

    rightSheetRef.dismiss();
    viewContainerFixture.detectChanges();

    // Wait for the dismiss animation to finish.
    flush();
    rightSheetRef = rightSheet.open(TacoMsg, config);
    viewContainerFixture.detectChanges();

    // Wait for the open animation to finish.
    flush();
    expect(rightSheetRef.containerInstance._animationState)
      .withContext(`Expected the animation state would be 'visible'.`)
      .toBe('visible');
  }));

  it('should remove past right sheets when opening new ones', fakeAsync(() => {
    rightSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    rightSheet.open(TacoMsg);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent).toContain('Taco');
  }));

  it('should not throw when opening multiple right sheet in quick succession', fakeAsync(() => {
    expect(() => {
      for (let i = 0; i < 3; i++) {
        rightSheet.open(PizzaMsg);
        viewContainerFixture.detectChanges();
      }

      flush();
    }).not.toThrow();
  }));

  it('should remove right sheet if another is shown while its still animating open', fakeAsync(() => {
    rightSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    rightSheet.open(TacoMsg);
    viewContainerFixture.detectChanges();

    tick();
    expect(overlayContainerElement.textContent).toContain('Taco');
    tick(500);
  }));

  it('should emit after being dismissed', fakeAsync(() => {
    const rightSheetRef = rightSheet.open(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    rightSheetRef.afterDismissed().subscribe(spy);
    viewContainerFixture.detectChanges();

    rightSheetRef.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should be able to pass a result back to the dismissed stream', fakeAsync(() => {
    const rightSheetRef = rightSheet.open<PizzaMsg, any, number>(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    rightSheetRef.afterDismissed().subscribe(spy);
    viewContainerFixture.detectChanges();

    rightSheetRef.dismiss(1337);
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).toHaveBeenCalledWith(1337);
  }));

  it('should be able to pass data when dismissing through the service', fakeAsync(() => {
    const rightSheetRef = rightSheet.open<PizzaMsg, any, number>(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    rightSheetRef.afterDismissed().subscribe(spy);
    viewContainerFixture.detectChanges();

    rightSheet.dismiss(1337);
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).toHaveBeenCalledWith(1337);
  }));

  it('should close the right sheet when going forwards/backwards in history', fakeAsync(() => {
    rightSheet.open(PizzaMsg);

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeTruthy();

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeFalsy();
  }));

  it('should close the right sheet when the location hash changes', fakeAsync(() => {
    rightSheet.open(PizzaMsg);

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeTruthy();

    mockLocation.simulateHashChange('');
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeFalsy();
  }));

  it('should allow the consumer to disable closing a right sheet on navigation', fakeAsync(() => {
    rightSheet.open(PizzaMsg, { closeOnNavigation: false });

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeTruthy();

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeTruthy();
  }));

  it('should be able to attach a custom scroll strategy', fakeAsync(() => {
    const scrollStrategy: ScrollStrategy = {
      attach: () => {},
      enable: jasmine.createSpy('scroll strategy enable spy'),
      disable: () => {},
    };

    rightSheet.open(PizzaMsg, { scrollStrategy });
    expect(scrollStrategy.enable).toHaveBeenCalled();
  }));

  describe('passing in data', () => {
    it('should be able to pass in data', () => {
      const config = {
        data: {
          stringParam: 'hello',
          dateParam: new Date(),
        },
      };

      const instance = rightSheet.open(
        RightSheetWithInjectedData,
        config
      ).instance;

      expect(instance.data.stringParam).toBe(config.data.stringParam);
      expect(instance.data.dateParam).toBe(config.data.dateParam);
    });

    it('should default to null if no data is passed', () => {
      expect(() => {
        const rightSheetRef = rightSheet.open(RightSheetWithInjectedData);
        expect(rightSheetRef.instance.data).toBeNull();
      }).not.toThrow();
    });
  });

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', fakeAsync(() => {
      rightSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop'
      ) as HTMLElement;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(
        overlayContainerElement.querySelector('mat-right-sheet-container')
      ).toBeTruthy();
    }));

    it('should prevent closing via the escape key', fakeAsync(() => {
      rightSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      viewContainerFixture.detectChanges();
      flush();

      expect(
        overlayContainerElement.querySelector('mat-right-sheet-container')
      ).toBeTruthy();
    }));

    it('should allow for the disableClose option to be updated while open', fakeAsync(() => {
      const rightSheetRef = rightSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop'
      ) as HTMLElement;
      backdrop.click();

      expect(
        overlayContainerElement.querySelector('mat-right-sheet-container')
      ).toBeTruthy();

      rightSheetRef.disableClose = false;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(
        overlayContainerElement.querySelector('mat-right-sheet-container')
      ).toBeFalsy();
    }));
  });

  describe('hasBackdrop option', () => {
    it('should have a backdrop', () => {
      rightSheet.open(PizzaMsg, {
        hasBackdrop: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(
        overlayContainerElement.querySelector('.cdk-overlay-backdrop')
      ).toBeTruthy();
    });

    it('should not have a backdrop', () => {
      rightSheet.open(PizzaMsg, {
        hasBackdrop: false,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(
        overlayContainerElement.querySelector('.cdk-overlay-backdrop')
      ).toBeFalsy();
    });
  });

  describe('backdropClass option', () => {
    it('should have default backdrop class', () => {
      rightSheet.open(PizzaMsg, {
        backdropClass: '',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(
        overlayContainerElement.querySelector('.cdk-overlay-dark-backdrop')
      ).toBeTruthy();
    });

    it('should have custom backdrop class', () => {
      rightSheet.open(PizzaMsg, {
        backdropClass: 'custom-backdrop-class',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(
        overlayContainerElement.querySelector('.custom-backdrop-class')
      ).toBeTruthy();
    });
  });

  describe('focus management', () => {
    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => document.body.appendChild(overlayContainerElement));
    afterEach(() => overlayContainerElement.remove());

    it('should focus the right sheet container by default', fakeAsync(() => {
      rightSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.tagName)
        .withContext('Expected right sheet container to be focused.')
        .toBe('MAT-RIGHT-SHEET-CONTAINER');
    }));

    it('should create a focus trap if autoFocus is disabled', fakeAsync(() => {
      rightSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: false,
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      const focusTrapAnchors = overlayContainerElement.querySelectorAll(
        '.cdk-focus-trap-anchor'
      );

      expect(focusTrapAnchors.length).toBeGreaterThan(0);
    }));

    it(
      'should focus the first tabbable element of the right sheet on open when' +
        'autoFocus is set to "first-tabbable"',
      fakeAsync(() => {
        rightSheet.open(PizzaMsg, {
          viewContainerRef: testViewContainerRef,
          autoFocus: 'first-tabbable',
        });

        viewContainerFixture.detectChanges();
        flushMicrotasks();

        expect(document.activeElement!.tagName)
          .withContext(
            'Expected first tabbable element (input) in the dialog to be focused.'
          )
          .toBe('INPUT');
      })
    );

    it(
      'should focus the right sheet element on open when autoFocus is set to ' +
        '"dialog" (the default)',
      fakeAsync(() => {
        rightSheet.open(PizzaMsg, {
          viewContainerRef: testViewContainerRef,
        });

        viewContainerFixture.detectChanges();
        flushMicrotasks();

        const container = overlayContainerElement.querySelector(
          '.mat-right-sheet-container'
        ) as HTMLInputElement;

        expect(document.activeElement)
          .withContext('Expected container to be focused on open')
          .toBe(container);
      })
    );

    it(
      'should focus the right sheet element on open when autoFocus is set to ' +
        '"first-heading"',
      fakeAsync(() => {
        rightSheet.open(ContentElementDialog, {
          viewContainerRef: testViewContainerRef,
          autoFocus: 'first-heading',
        });

        viewContainerFixture.detectChanges();
        flushMicrotasks();

        const firstHeader = overlayContainerElement.querySelector(
          'h1[tabindex="-1"]'
        ) as HTMLInputElement;

        expect(document.activeElement)
          .withContext('Expected first header to be focused on open')
          .toBe(firstHeader);
      })
    );

    it(
      'should focus the first element that matches the css selector on open when ' +
        'autoFocus is set to a css selector',
      fakeAsync(() => {
        rightSheet.open(ContentElementDialog, {
          viewContainerRef: testViewContainerRef,
          autoFocus: 'p',
        });

        viewContainerFixture.detectChanges();
        flushMicrotasks();

        const firstParagraph = overlayContainerElement.querySelector(
          'p[tabindex="-1"]'
        ) as HTMLInputElement;

        expect(document.activeElement)
          .withContext('Expected first paragraph to be focused on open')
          .toBe(firstParagraph);
      })
    );

    it('should re-focus trigger element when right sheet closes', fakeAsync(() => {
      const button = document.createElement('button');
      button.id = 'right-sheet-trigger';
      document.body.appendChild(button);
      button.focus();

      const rightSheetRef = rightSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe(
        'right-sheet-trigger',
        'Expected the focus to change when sheet was opened.'
      );

      rightSheetRef.dismiss();
      expect(document.activeElement!.id).not.toBe(
        'right-sheet-trigger',
        'Expcted the focus not to have changed before the animation finishes.'
      );

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement!.id)
        .withContext(
          'Expected that the trigger was refocused after the sheet is closed.'
        )
        .toBe('right-sheet-trigger');

      button.remove();
    }));

    it('should be able to disable focus restoration', fakeAsync(() => {
      const button = document.createElement('button');
      button.id = 'right-sheet-trigger';
      document.body.appendChild(button);
      button.focus();

      const rightSheetRef = rightSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: false,
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe(
        'right-sheet-trigger',
        'Expected the focus to change when sheet was opened.'
      );

      rightSheetRef.dismiss();
      expect(document.activeElement!.id).not.toBe(
        'right-sheet-trigger',
        'Expcted the focus not to have changed before the animation finishes.'
      );

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement!.id).not.toBe(
        'right-sheet-trigger',
        'Expected the trigger not to be refocused on close.'
      );

      button.remove();
    }));

    it('should not move focus if it was moved outside the sheet while animating', fakeAsync(() => {
      // Create a element that has focus before the right sheet is opened.
      const button = document.createElement('button');
      const otherButton = document.createElement('button');
      const body = document.body;
      button.id = 'right-sheet-trigger';
      otherButton.id = 'other-button';
      body.appendChild(button);
      body.appendChild(otherButton);
      button.focus();

      const rightSheetRef = rightSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe(
        'right-sheet-trigger',
        'Expected the focus to change when the right sheet was opened.'
      );

      // Start the closing sequence and move focus out of right sheet.
      rightSheetRef.dismiss();
      otherButton.focus();

      expect(document.activeElement!.id)
        .withContext('Expected focus to be on the alternate button.')
        .toBe('other-button');

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id)
        .withContext('Expected focus to stay on the alternate button.')
        .toBe('other-button');

      button.remove();
      otherButton.remove();
    }));

    it('should re-focus trigger element inside the shadow DOM when the right sheet is dismissed', fakeAsync(() => {
      if (!_supportsShadowDom()) {
        return;
      }

      viewContainerFixture.destroy();
      const fixture = TestBed.createComponent(ShadowDomComponent);
      fixture.detectChanges();
      const button = fixture.debugElement.query(
        By.css('button')
      )!.nativeElement;

      button.focus();

      const ref = rightSheet.open(PizzaMsg);
      flushMicrotasks();
      fixture.detectChanges();
      flushMicrotasks();

      const spy = spyOn(button, 'focus').and.callThrough();
      ref.dismiss();
      flushMicrotasks();
      fixture.detectChanges();
      tick(500);

      expect(spy).toHaveBeenCalled();
    }));
  });
});

describe('MatRightSheet with parent MatRightSheet', () => {
  let parentRightSheet: MatRightSheet;
  let childRightSheet: MatRightSheet;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatRightSheet>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatRightSheetModule, NoopAnimationsModule],
      declarations: [ComponentThatProvidesMatRightSheet],
    }).compileComponents();
  }));

  beforeEach(inject(
    [MatRightSheet, OverlayContainer],
    (bs: MatRightSheet, oc: OverlayContainer) => {
      parentRightSheet = bs;
      overlayContainerElement = oc.getContainerElement();
      fixture = TestBed.createComponent(ComponentThatProvidesMatRightSheet);
      childRightSheet = fixture.componentInstance.rightSheet;
      fixture.detectChanges();
    }
  ));

  it('should close right sheets opened by parent when opening from child', fakeAsync(() => {
    parentRightSheet.open(PizzaMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected a right sheet to be opened')
      .toContain('Pizza');

    childRightSheet.open(TacoMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext(
        'Expected parent right sheet to be dismissed by opening from child'
      )
      .toContain('Taco');
  }));

  it('should close right sheets opened by child when opening from parent', fakeAsync(() => {
    childRightSheet.open(PizzaMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected a right sheet to be opened')
      .toContain('Pizza');

    parentRightSheet.open(TacoMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext(
        'Expected child right sheet to be dismissed by opening from parent'
      )
      .toContain('Taco');
  }));

  it('should not close parent right sheet when child is destroyed', fakeAsync(() => {
    parentRightSheet.open(PizzaMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected a right sheet to be opened')
      .toContain('Pizza');

    childRightSheet.ngOnDestroy();
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected a right sheet to stay open')
      .toContain('Pizza');
  }));
});

describe('MatRightSheet with default options', () => {
  let rightSheet: MatRightSheet;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(fakeAsync(() => {
    const defaultConfig: MatRightSheetConfig = {
      hasBackdrop: false,
      disableClose: true,
      autoFocus: 'dialog',
    };

    TestBed.configureTestingModule({
      imports: [MatRightSheetModule, NoopAnimationsModule],
      declarations: [
        ComponentWithChildViewContainer,
        DirectiveWithViewContainer,
      ],
      providers: [
        { provide: MAT_RIGHT_SHEET_DEFAULT_OPTIONS, useValue: defaultConfig },
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject(
    [MatRightSheet, OverlayContainer],
    (b: MatRightSheet, oc: OverlayContainer) => {
      rightSheet = b;
      overlayContainerElement = oc.getContainerElement();
    }
  ));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(
      ComponentWithChildViewContainer
    );

    viewContainerFixture.detectChanges();
    testViewContainerRef =
      viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should use the provided defaults', () => {
    rightSheet.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

    viewContainerFixture.detectChanges();

    expect(
      overlayContainerElement.querySelector('.cdk-overlay-backdrop')
    ).toBeFalsy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeTruthy();
    expect(document.activeElement!.tagName).not.toBe('INPUT');
  });

  it('should be overridable by open() options', fakeAsync(() => {
    rightSheet.open(PizzaMsg, {
      hasBackdrop: true,
      disableClose: false,
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    expect(
      overlayContainerElement.querySelector('.cdk-overlay-backdrop')
    ).toBeTruthy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(
      overlayContainerElement.querySelector('mat-right-sheet-container')
    ).toBeFalsy();
  }));
});

@Directive({ selector: 'dir-with-view-container' })
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({ template: `<dir-with-view-container></dir-with-view-container>` })
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer)
  childWithViewContainer!: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `<ng-template let-data let-rightSheetRef="rightSheetRef">
    Cheese {{ localValue }} {{ data?.value
    }}{{ setRef(rightSheetRef) }}</ng-template
  >`,
})
class ComponentWithTemplateRef {
  localValue!: string;
  rightSheetRef!: MatRightSheetRef<any>;

  @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;

  setRef(rightSheetRef: MatRightSheetRef<any>): string {
    this.rightSheetRef = rightSheetRef;
    return '';
  }
}

@Component({ template: '<p>Pizza</p> <input> <button>Close</button>' })
class PizzaMsg {
  constructor(
    public rightSheetRef: MatRightSheetRef<PizzaMsg>,
    public injector: Injector,
    public directionality: Directionality
  ) {}
}

@Component({ template: '<p>Taco</p>' })
class TacoMsg {}

@Component({
  template: `
    <h1>This is the title</h1>
    <p>This is the paragraph</p>
  `,
})
class ContentElementDialog {}

@Component({
  template: '',
  providers: [MatRightSheet],
})
class ComponentThatProvidesMatRightSheet {
  constructor(public rightSheet: MatRightSheet) {}
}

@Component({ template: '' })
class RightSheetWithInjectedData {
  constructor(@Inject(MAT_RIGHT_SHEET_DATA) public data: any) {}
}

@Component({
  template: `<button>I'm a button</button>`,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class ShadowDomComponent {}
