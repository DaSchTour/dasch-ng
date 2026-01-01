# Gravatar

Generate Gravatar URLs and integrate Gravatar images into your Angular application.

## Installation

```bash
npm install @dasch-ng/gravatar
```

## Features

- **Multiple APIs**: Directive, pipe, and service-based approaches
- **Email Hashing**: Automatic MD5 hashing of email addresses
- **Customizable**: Support for size and fallback image options
- **Type-safe**: Full TypeScript support with typed interfaces
- **Standalone**: All components are standalone and tree-shakeable
- **Profile Data**: Fetch Gravatar profile information via HTTP

## Available Components

### GravatarDirective

Apply Gravatar images directly to `<img>` elements with automatic width/height binding.

**Use case:** Simplest way to display Gravatar avatars with automatic sizing.

#### Example

```typescript
import { Component } from '@angular/core';
import { GravatarDirective } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-user-avatar',
  imports: [GravatarDirective],
  template: ` <img [email]="userEmail" [size]="80" [fallback]="'identicon'" alt="User avatar" /> `,
})
export class UserAvatarComponent {
  userEmail = 'user@example.com';
}
```

**Parameters:**

- `email` (required): Email address to generate Gravatar for
- `size` (required): Image size in pixels (sets both width and height)
- `fallback` (required): Fallback image type

[View API Documentation →](../api/@dasch-ng/gravatar/classes/GravatarDirective.html)

---

### GravatarPipe

Transform email addresses into Gravatar URLs in templates.

**Use case:** When you need more control over the `<img>` element or want to use the URL elsewhere.

#### Example

```typescript
import { Component } from '@angular/core';
import { GravatarPipe } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-user-card',
  imports: [GravatarPipe],
  template: ` <img [src]="userEmail | gravatar: 80 : 'identicon'" alt="User avatar" width="80" height="80" /> `,
})
export class UserCardComponent {
  userEmail = 'user@example.com';
}
```

**Parameters:**

- `email`: Email address (pipe input)
- `size`: Image size in pixels (default: 16)
- `fallback`: Fallback image type (default: 'identicon')

[View API Documentation →](../api/@dasch-ng/gravatar/classes/GravatarPipe.html)

---

### GravatarService

Generate Gravatar links programmatically and fetch profile data.

**Use case:** When you need to generate URLs in component code or fetch Gravatar profile information.

#### Example

```typescript
import { Component, inject } from '@angular/core';
import { GravatarService } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-profile',
  template: `
    <img [src]="avatarUrl" alt="User avatar" />
    @if (profile) {
      <h2>{{ profile.displayName }}</h2>
      <p>{{ profile.preferredUsername }}</p>
    }
  `,
})
export class ProfileComponent {
  private gravatarService = inject(GravatarService);

  avatarUrl = this.gravatarService.generateLink('user@example.com', 200, 'identicon');

  profile$ = this.gravatarService.getContact('user@example.com');
}
```

**Methods:**

- `generateLink(email, size?, fallback?)`: Generate Gravatar image URL
- `getContact(email)`: Fetch Gravatar profile data (returns Observable)

[View API Documentation →](../api/@dasch-ng/gravatar/classes/GravatarService.html)

---

## Fallback Image Types

Gravatar supports several fallback images when no avatar is found:

| Type                        | Description                           |
| --------------------------- | ------------------------------------- |
| `'404'`                     | Return 404 error if no image found    |
| `'mp'`                      | Mystery Person (simple silhouette)    |
| `'identicon'`               | Geometric pattern based on email hash |
| `'monsterid'` / `'monster'` | Generated monster avatar              |
| `'wavatar'`                 | Generated face avatar                 |
| `'retro'`                   | 8-bit arcade-style avatar             |
| `'robohash'`                | Generated robot/monster               |
| `'blank'`                   | Transparent PNG image                 |

## Common Patterns

### User Profile with Fallback

```typescript
import { Component, input } from '@angular/core';
import { GravatarDirective } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-user-profile',
  imports: [GravatarDirective],
  template: `
    <div class="profile">
      <img [email]="email()" [size]="size()" [fallback]="'mp'" alt="{{ name() }}'s avatar" />
      <h3>{{ name() }}</h3>
    </div>
  `,
})
export class UserProfileComponent {
  email = input.required<string>();
  name = input.required<string>();
  size = input(64);
}
```

### Avatar Grid

```typescript
import { Component } from '@angular/core';
import { GravatarPipe } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-team',
  imports: [GravatarPipe],
  template: `
    <div class="team-grid">
      @for (member of teamMembers; track member.email) {
        <div class="team-member">
          <img [src]="member.email | gravatar: 100 : 'retro'" [alt]="member.name" width="100" height="100" />
          <p>{{ member.name }}</p>
        </div>
      }
    </div>
  `,
})
export class TeamComponent {
  teamMembers = [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
    { email: 'charlie@example.com', name: 'Charlie' },
  ];
}
```

### Fetching Profile Data

```typescript
import { Component, inject, signal } from '@angular/core';
import { GravatarService } from '@dasch-ng/gravatar';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-gravatar-profile',
  imports: [AsyncPipe],
  template: `
    @if (profile$ | async; as profile) {
      <div class="profile-card">
        <img [src]="profile.entry[0].thumbnailUrl" alt="Profile" />
        <h2>{{ profile.entry[0].displayName }}</h2>
        <p>@{{ profile.entry[0].preferredUsername }}</p>
        <a [href]="profile.entry[0].profileUrl">View Profile</a>
      </div>
    }
  `,
})
export class GravatarProfileComponent {
  private gravatarService = inject(GravatarService);

  email = signal('user@example.com');
  profile$ = this.gravatarService.getContact(this.email());
}
```

## Type Definitions

```typescript
type GravatarFallback = '404' | 'mp' | 'identicon' | 'monsterid' | 'monster' | 'wavatar' | 'retro' | 'robohash' | 'blank';

interface GravatarResponse {
  entry: Array<GravatarEntry>;
}

interface GravatarEntry {
  hash: string;
  requestHash: string;
  profileUrl: string;
  preferredUsername: string;
  thumbnailUrl: string;
  photos: Array<'thumbnail'>;
  displayName: string;
  urls: Array<GravatarListEntry>;
}

interface GravatarListEntry<T = string> {
  value: string;
  type: T;
}
```

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/@dasch-ng/gravatar/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/gravatar).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
