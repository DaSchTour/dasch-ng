import { NgModule } from '@angular/core';

import { GravatarPipe } from './gravatar.pipe';

@NgModule({
  imports: [GravatarPipe],
  exports: [GravatarPipe],
})
export class GravatarPipeModule {}
