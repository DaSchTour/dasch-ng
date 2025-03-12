import { NgModule } from '@angular/core';

import { GravatarPipe } from './gravatar.pipe';
import { GravatarDirective } from './gravatar.directive';

@NgModule({
  imports: [GravatarPipe, GravatarDirective],
  exports: [GravatarPipe, GravatarDirective],
})
export class GravatarPipeModule {}
