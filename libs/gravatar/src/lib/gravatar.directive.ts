import { Directive, Host, HostBinding, Input, numberAttribute } from '@angular/core';
import { generateGravatarLink } from './generate-gravatar-link';
import { GravatarFallback } from './gravatar';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: 'img[gravatar]', standalone: true })
export class GravatarDirective {
  @Input({ required: true }) email!: string;
  @HostBinding('attr.width')
  @HostBinding('attr.height')
  @Input({ required: true, transform: numberAttribute })
  size!: number;
  @Input({ required: true }) fallback!: GravatarFallback;

  @Input()
  @HostBinding('src')
  get src() {
    return this._src ?? generateGravatarLink(this.email, this.size, this.fallback);
  }

  set src(value: string | null | undefined) {
    this._src = value;
  }

  private _src: string | null | undefined;
}
