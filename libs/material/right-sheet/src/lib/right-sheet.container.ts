/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { AnimationEvent } from '@angular/animations';
import {
  FocusMonitor,
  FocusTrapFactory,
  InteractivityChecker,
} from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { matRightSheetAnimations } from './right-sheet.animations';
import { CdkDialogContainer, DialogConfig } from '@angular/cdk/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet } from '@angular/cdk/portal';

// TODO(crisbeto): consolidate some logic between this, MatDialog and MatSnackBar

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
@Component({
  selector: 'mat-right-sheet-container',
  templateUrl: './right-sheet.container.html',
  styleUrls: ['./right-sheet.container.scss'],
  // In Ivy embedded views will be change detected from their declaration place, rather than where
  // they were stamped out. This means that we can't have the bottom sheet container be OnPush,
  // because it might cause the sheets that were opened from a template not to be out of date.
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  animations: [matRightSheetAnimations.rightSheetState],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'mat-right-sheet-container',
    tabindex: '-1',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-label]': '_config.ariaLabel',
    '[@state]': '_animationState',
    '(@state.start)': '_onAnimationStart($event)',
    '(@state.done)': '_onAnimationDone($event)',
  },
  standalone: true,
  imports: [CdkPortalOutlet],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MatRightSheetContainer
  extends CdkDialogContainer
  implements OnDestroy
{
  private _breakpointSubscription: Subscription;

  /** The state of the bottom sheet animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Emits whenever the state of the animation changes. */
  _animationStateChanged = new EventEmitter<AnimationEvent>();

  /** Whether the component has been destroyed. */
  private _destroyed?: boolean;

  constructor(
    elementRef: ElementRef,
    focusTrapFactory: FocusTrapFactory,
    @Optional() @Inject(DOCUMENT) document: any,
    config: DialogConfig,
    checker: InteractivityChecker,
    ngZone: NgZone,
    overlayRef: OverlayRef,
    breakpointObserver: BreakpointObserver,
    focusMonitor?: FocusMonitor
  ) {
    super(
      elementRef,
      focusTrapFactory,
      document,
      config,
      checker,
      ngZone,
      overlayRef,
      focusMonitor
    );

    this._breakpointSubscription = breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(() => {
        this._toggleClass(
          'mat-right-sheet-container-medium',
          breakpointObserver.isMatched(Breakpoints.Medium)
        );
        this._toggleClass(
          'mat-right-sheet-container-large',
          breakpointObserver.isMatched(Breakpoints.Large)
        );
        this._toggleClass(
          'mat-right-sheet-container-xlarge',
          breakpointObserver.isMatched(Breakpoints.XLarge)
        );
      });
  }

  /** Begin animation of bottom sheet entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = 'visible';
      this._changeDetectorRef.detectChanges();
    }
  }

  /** Begin animation of the bottom sheet exiting from view. */
  exit(): void {
    if (!this._destroyed) {
      this._animationState = 'hidden';
      this._changeDetectorRef.markForCheck();
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._breakpointSubscription.unsubscribe();
    this._destroyed = true;
  }

  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'visible') {
      this._trapFocus();
    }

    this._animationStateChanged.emit(event);
  }

  _onAnimationStart(event: AnimationEvent) {
    this._animationStateChanged.emit(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected override _captureInitialFocus(): void {}

  private _toggleClass(cssClass: string, add: boolean) {
    this._elementRef.nativeElement.classList.toggle(cssClass, add);
  }
}
