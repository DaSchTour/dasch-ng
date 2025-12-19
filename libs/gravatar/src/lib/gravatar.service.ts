import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { generateGravatarLink } from './generate-gravatar-link';
import { hashEmail } from './hash-email';
import { GravatarResponse } from './gravatar';

@Injectable({
  providedIn: 'root',
})
export class GravatarService {
  private readonly http = inject(HttpClient);

  public generateLink(email: string, size = 16, fallback = 'identicon') {
    return generateGravatarLink(email, size, fallback);
  }

  public getContact(email: string) {
    return this.http.get<GravatarResponse>(`https://www.gravatar.com/${hashEmail(email)}.json`);
  }
}
