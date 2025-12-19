/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusMonitor, FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  DOCUMENT,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ENTER_ANIMATION, EXIT_ANIMATION } from './right-sheet.animations';
import { CdkDialogContainer, DialogConfig } from '@angular/cdk/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { _animationsDisabled } from './animations-helper';

// TODO(crisbeto): consolidate some logic between this, MatDialog and MatSnackBar

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
@Component({
  selector: 'mat-right-sheet-container',
  templateUrl: './right-sheet.container.html',
  styleUrl: './right-sheet.container.scss',
  // In Ivy embedded views will be change detected from their declaration place, rather than where
  // they were stamped out. This means that we can't have the bottom sheet container be OnPush,
  // because it might cause the sheets that were opened from a template not to be out of date.
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'mat-right-sheet-container',
    '[class.mat-right-sheet-container-animations-enabled]': '!_animationsDisabled',
    '[class.mat-right-sheet-container-enter]': '_animationState === "visible"',
    '[class.mat-right-sheet-container-exit]': '_animationState === "hidden"',
    tabindex: '-1',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-label]': '_config.ariaLabel',
    '(animationstart)': '_handleAnimationEvent(true, $event.animationName)',
    '(animationend)': '_handleAnimationEvent(false, $event.animationName)',
    '(animationcancel)': '_handleAnimationEvent(false, $event.animationName)',
  },
  imports: [CdkPortalOutlet],
})
export class MatRightSheetContainer extends CdkDialogContainer implements OnDestroy {
  private _breakpointSubscription: Subscription;
  protected _animationsDisabled = _animationsDisabled();

  /** The state of the bottom sheet animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Emits whenever the state of the animation changes. */
  _animationStateChanged = new EventEmitter<{
    toState: 'visible' | 'hidden';
    phase: 'start' | 'done';
  }>();

  /** Whether the component has been destroyed. */
  private _destroyed = false;

  constructor(...args: unknown[]);

  constructor() {
    super();

    const elementRef = inject(ElementRef);
    const breakpointObserver = inject(BreakpointObserver);

    this._breakpointSubscription = breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(() => {
        const classList = (elementRef.nativeElement as HTMLElement).classList;

        classList.toggle(
          'mat-right-sheet-container-medium',
          breakpointObserver.isMatched(Breakpoints.Medium),
        );
        classList.toggle(
          'mat-right-sheet-container-large',
          breakpointObserver.isMatched(Breakpoints.Large),
        );
        classList.toggle(
          'mat-right-sheet-container-xlarge',
          breakpointObserver.isMatched(Breakpoints.XLarge),
        );
      });
  }

  /** Begin animation of bottom sheet entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = 'visible';
      this._changeDetectorRef.markForCheck();
      this._changeDetectorRef.detectChanges();
      if (this._animationsDisabled) {
        this._simulateAnimation(ENTER_ANIMATION);
      }
    }
  }

  /** Begin animation of the bottom sheet exiting from view. */
  exit(): void {
    if (!this._destroyed) {
      this._elementRef.nativeElement.setAttribute('mat-exit', '');
      this._animationState = 'hidden';
      this._changeDetectorRef.markForCheck();
      if (this._animationsDisabled) {
        this._simulateAnimation(EXIT_ANIMATION);
      }
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._breakpointSubscription.unsubscribe();
    this._destroyed = true;
  }

  private _simulateAnimation(name: typeof ENTER_ANIMATION | typeof EXIT_ANIMATION) {
    this._ngZone.run(() => {
      this._handleAnimationEvent(true, name);
      setTimeout(() => this._handleAnimationEvent(false, name));
    });
  }

  protected override _trapFocus(): void {
    // The right sheet starts off-screen and animates in, and at the same time we trap focus
    // within it. With some styles this appears to cause the page to jump around. See:
    // https://github.com/angular/components/issues/30774. Preventing the browser from
    // scrolling resolves the issue and isn't really necessary since the right sheet
    // normally isn't scrollable.
    super._trapFocus({ preventScroll: true });
  }

  protected _handleAnimationEvent(isStart: boolean, animationName: string) {
    const isEnter = animationName === ENTER_ANIMATION;
    const isExit = animationName === EXIT_ANIMATION;

    if (isEnter || isExit) {
      this._animationStateChanged.emit({
        toState: isEnter ? 'visible' : 'hidden',
        phase: isStart ? 'start' : 'done',
      });
    }
  }
}
