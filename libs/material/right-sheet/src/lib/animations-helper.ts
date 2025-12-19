/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ANIMATION_MODULE_TYPE, inject } from '@angular/core';

/**
 * Returns whether animations have been disabled by DI. Must be called in a DI context.
 * @docs-private
 */
export function _animationsDisabled(): boolean {
  return inject(ANIMATION_MODULE_TYPE, { optional: true }) === 'NoopAnimations';
}
