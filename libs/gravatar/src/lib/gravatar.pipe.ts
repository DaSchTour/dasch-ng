import { Pipe, PipeTransform } from '@angular/core';

import { generateGravatarLink } from './generate-gravatar-link';

@Pipe({
  name: 'gravatar',
  standalone: true,
})
export class GravatarPipe implements PipeTransform {
  public transform(email: string, size = 16, fallback = 'identicon'): unknown {
    return generateGravatarLink(email, size, fallback);
  }
}
