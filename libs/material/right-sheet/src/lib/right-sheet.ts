/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Overlay} from '@angular/cdk/overlay';
import {ComponentType,} from '@angular/cdk/portal';
import {Inject, Injectable, InjectionToken, Injector, OnDestroy, Optional, SkipSelf, TemplateRef,} from '@angular/core';
import {MAT_RIGHT_SHEET_DATA, MatRightSheetConfig,} from './right-sheet.config';
import {MatRightSheetContainer} from './right-sheet.container';
import {MatRightSheetModule} from './right-sheet.module';
import {MatRightSheetRef} from './right-sheet.ref';
import {Dialog} from '@angular/cdk/dialog';

/** Injection token that can be used to specify default right sheet options. */
export const MAT_RIGHT_SHEET_DEFAULT_OPTIONS =
  new InjectionToken<MatRightSheetConfig>('mat-right-sheet-default-options');

/**
 * Service to trigger Material Design right sheets.
 */
@Injectable({ providedIn: MatRightSheetModule })
export class MatRightSheet implements OnDestroy {
  private _rightSheetRefAtThisLevel: MatRightSheetRef<any> | null = null;
  private _dialog!: Dialog;

  /** Reference to the currently opened right sheet. */
  get _openedRightSheetRef(): MatRightSheetRef<any> | null {
    const parent = this._parentRightSheet;
    return parent
      ? parent._openedRightSheetRef
      : this._rightSheetRefAtThisLevel;
  }

  set _openedRightSheetRef(value: MatRightSheetRef<any> | null) {
    if (this._parentRightSheet) {
      this._parentRightSheet._openedRightSheetRef = value;
    } else {
      this._rightSheetRefAtThisLevel = value;
    }
  }

  constructor(
    private readonly _overlay: Overlay,
    injector: Injector,
    @Optional()
    @SkipSelf()
    private readonly _parentRightSheet: MatRightSheet,
    @Optional()
    @Inject(MAT_RIGHT_SHEET_DEFAULT_OPTIONS)
    private readonly _defaultOptions?: MatRightSheetConfig
  ) {
    this._dialog = injector.get(Dialog);
  }

  /**
   * Opens a right sheet containing the given component.
   * @param component Type of the component to load into the right sheet.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened right sheet.
   */
  open<T, D = any, R = any>(
    component: ComponentType<T>,
    config?: MatRightSheetConfig<D>
  ): MatRightSheetRef<T, R>;

  /**
   * Opens a right sheet containing the given template.
   * @param template TemplateRef to instantiate as the right sheet content.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened right sheet.
   */
  open<T, D = any, R = any>(
    template: TemplateRef<T>,
    config?: MatRightSheetConfig<D>
  ): MatRightSheetRef<T, R>;

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatRightSheetConfig<D>
  ): MatRightSheetRef<T, R> {
    const _config = {
      ...(this._defaultOptions || new MatRightSheetConfig()),
      ...config,
    };
    let ref: MatRightSheetRef<T, R>;

    this._dialog.open<R, D, T>(componentOrTemplateRef, {
      ..._config,
      // Disable closing since we need to sync it up to the animation ourselves.
      disableClose: true,
      width: _config.width || '420px',
      height: '100vh',
      container: MatRightSheetContainer,
      scrollStrategy:
        _config.scrollStrategy || this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .global()
        .top('0')
        .right('0')
        .bottom('0'),
      templateContext: () => ({ rightSheetRef: ref }),
      providers: (cdkRef, _cdkConfig, container) => {
        ref = new MatRightSheetRef(
          cdkRef,
          _config,
          container as MatRightSheetContainer
        );
        return [
          { provide: MatRightSheetRef, useValue: ref },
          { provide: MAT_RIGHT_SHEET_DATA, useValue: _config.data },
        ];
      },
    });

    // When the right sheet is dismissed, clear the reference to it.
    ref!.afterDismissed().subscribe(() => {
      // Clear the right sheet ref if it hasn't already been replaced by a newer one.
      if (this._openedRightSheetRef === ref) {
        this._openedRightSheetRef = null;
      }
    });

    if (this._openedRightSheetRef) {
      // If a right sheet is already in view, dismiss it and enter the
      // new right sheet after exit animation is complete.
      this._openedRightSheetRef
        .afterDismissed()
        .subscribe(() => ref.containerInstance?.enter());
      this._openedRightSheetRef.dismiss();
    } else {
      // If no right sheet is in view, enter the new right sheet.
      ref!.containerInstance.enter();
    }

    this._openedRightSheetRef = ref!;
    return ref!;
  }

  /**
   * Dismisses the currently-visible right sheet.
   * @param result Data to pass to the right sheet instance.
   */
  dismiss<R = any>(result?: R): void {
    if (this._openedRightSheetRef) {
      this._openedRightSheetRef.dismiss(result);
    }
  }

  ngOnDestroy() {
    if (this._rightSheetRefAtThisLevel) {
      this._rightSheetRefAtThisLevel.dismiss();
    }
  }
}
