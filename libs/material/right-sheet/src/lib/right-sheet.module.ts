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
import { MatRightSheet } from './right-sheet';

@NgModule({
  imports: [
    DialogModule,
    MatCommonModule,
    PortalModule,
    MatRightSheetContainer,
  ],
  exports: [MatRightSheetContainer, MatCommonModule],
  providers: [MatRightSheet],
})
export class MatRightSheetModule {}
