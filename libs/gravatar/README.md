# @dasch-ng/gravatar

Angular library for generating Gravatar URLs and integrating Gravatar images into your application.

## Installation

```bash
npm install @dasch-ng/gravatar
```

## Features

- **Multiple APIs**: Directive, pipe, and service-based approaches
- **Email Hashing**: Automatic MD5 hashing of email addresses
- **Customizable**: Support for size, default image, and rating options
- **Type-safe**: Full TypeScript support
- **Tree-shakeable**: Modular architecture for optimal bundle size

## Basic Usage

### Using the Directive

```typescript
import { GravatarDirective } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-example',
  imports: [GravatarDirective],
  template: ` <img [gravatar]="'user@example.com'" [size]="80" alt="User avatar" /> `,
})
export class ExampleComponent {}
```

### Using the Pipe

```typescript
import { GravatarPipe } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-example',
  imports: [GravatarPipe],
  template: ` <img [src]="'user@example.com' | gravatar: { size: 80 }" alt="User avatar" /> `,
})
export class ExampleComponent {}
```

### Using the Service

```typescript
import { GravatarService } from '@dasch-ng/gravatar';

@Component({
  selector: 'app-example',
  template: ` <img [src]="avatarUrl" alt="User avatar" /> `,
})
export class ExampleComponent {
  avatarUrl: string;

  constructor(private gravatar: GravatarService) {
    this.avatarUrl = this.gravatar.generateUrl('user@example.com', {
      size: 80,
      defaultImage: 'identicon',
    });
  }
}
```

## Options

- **size**: Image size in pixels (1-2048, default: 80)
- **defaultImage**: Default image type ('404', 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank')
- **rating**: Image rating ('g', 'pg', 'r', 'x')
- **forceDefault**: Always show default image

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/gravatar/) for detailed information.

## Running Tests

```bash
nx test gravatar
```

## License

MIT
