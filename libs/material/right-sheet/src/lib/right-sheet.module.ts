/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { DialogModule } from '@angular/cdk/dialog';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatRightSheetContainer } from './right-sheet.container';

@NgModule({
  imports: [DialogModule, MatCommonModule, PortalModule],
  exports: [MatRightSheetContainer, MatCommonModule],
  declarations: [MatRightSheetContainer],
})
export class MatRightSheetModule {}
