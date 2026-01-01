# Mutation Observer

Angular wrapper for the native MutationObserver API with RxJS integration, making it easy to observe DOM changes reactively.

## Installation

```bash
npm install @dasch-ng/mutation-observer
```

## Features

- **Angular Integration**: Seamlessly integrates MutationObserver with Angular's lifecycle
- **Directive API**: Simple `observeMutation` directive for declarative DOM observation
- **RxJS Integration**: Observable-based API for reactive programming patterns
- **Service API**: Injectable service for programmatic DOM mutation observation
- **Type-safe**: Full TypeScript support with proper MutationObserver typings
- **Automatic Cleanup**: Observers are automatically disconnected when components are destroyed

## ObserveMutationDirective

Directive for observing DOM mutations on the host element.

**Use case:** Declaratively observe DOM changes in templates without manual observer setup.

### Example

```typescript
import { Component } from '@angular/core';
import { ObserveMutationDirective } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-dynamic-content',
  imports: [ObserveMutationDirective],
  template: `
    <div (records)="onMutation($event)">
      <p>Content that may change</p>
      <button (click)="addContent()">Add Content</button>
    </div>
  `,
})
export class DynamicContentComponent {
  onMutation(mutation: MutationRecord) {
    console.log('DOM mutation detected:', mutation);
    console.log('Type:', mutation.type);
    console.log('Target:', mutation.target);
    console.log('Added nodes:', mutation.addedNodes);
    console.log('Removed nodes:', mutation.removedNodes);
  }

  addContent() {
    // Add dynamic content that will trigger mutation observation
  }
}
```

**Output:**

- `records`: Emits when DOM mutations are detected on the element

[View API Documentation →](../api/@dasch-ng/mutation-observer/classes/ObserveMutationDirective.html)

---

## MutationObserverService

Service for programmatic DOM mutation observation with RxJS integration.

**Use case:** Observe DOM changes programmatically with full control over observation options.

### Example

```typescript
import { Component, ElementRef, inject, viewChild, effect } from '@angular/core';
import { MutationObserverService } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-content-tracker',
  template: `
    <div #content>
      <p>Dynamic content area</p>
    </div>
  `,
})
export class ContentTrackerComponent {
  private mutationObserver = inject(MutationObserverService);

  contentElement = viewChild.required<ElementRef>('content');

  constructor() {
    effect(() => {
      const element = this.contentElement().nativeElement;

      this.mutationObserver
        .observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeOldValue: true,
        })
        .subscribe((mutation) => {
          console.log('Mutation detected:', mutation);
        });
    });
  }
}
```

**Methods:**

- `observe(element, options?)`: Start observing an element for mutations (returns Observable)

**Parameters:**

- `element`: HTMLElement to observe
- `options`: MutationObserverInit configuration object

[View API Documentation →](../api/@dasch-ng/mutation-observer/classes/MutationObserverService.html)

---

## MutationObserverInit Options

Configure what types of mutations to observe:

| Option                  | Type       | Description                               |
| ----------------------- | ---------- | ----------------------------------------- |
| `childList`             | `boolean`  | Observe additions/removals of child nodes |
| `attributes`            | `boolean`  | Observe changes to element attributes     |
| `characterData`         | `boolean`  | Observe changes to text content           |
| `subtree`               | `boolean`  | Observe descendants in addition to target |
| `attributeOldValue`     | `boolean`  | Record previous attribute value           |
| `characterDataOldValue` | `boolean`  | Record previous text content              |
| `attributeFilter`       | `string[]` | Specific attributes to observe            |

### Example Configuration

```typescript
const options: MutationObserverInit = {
  childList: true, // Watch for added/removed children
  subtree: true, // Watch entire subtree
  attributes: true, // Watch attribute changes
  attributeFilter: ['class', 'data-state'], // Only these attributes
  attributeOldValue: true, // Keep old attribute values
};

this.mutationObserver.observe(element, options).subscribe((mutation) => {
  // Handle mutation
});
```

---

## Common Patterns

### Observing Dynamic Lists

```typescript
import { Component, inject, viewChild, ElementRef, effect } from '@angular/core';
import { MutationObserverService } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-todo-list',
  template: `
    <ul #list>
      @for (item of items; track item.id) {
        <li>{{ item.text }}</li>
      }
    </ul>
    <button (click)="addItem()">Add Item</button>
  `,
})
export class TodoListComponent {
  private mutationObserver = inject(MutationObserverService);

  listElement = viewChild.required<ElementRef>('list');
  items = [
    { id: 1, text: 'First item' },
    { id: 2, text: 'Second item' },
  ];

  constructor() {
    effect(() => {
      const element = this.listElement().nativeElement;

      this.mutationObserver
        .observe(element, {
          childList: true,
          subtree: false,
        })
        .subscribe((mutation) => {
          console.log(`Items changed: ${mutation.addedNodes.length} added, ${mutation.removedNodes.length} removed`);
        });
    });
  }

  addItem() {
    const id = this.items.length + 1;
    this.items.push({ id, text: `Item ${id}` });
  }
}
```

### Tracking Attribute Changes

```typescript
import { Component, inject, viewChild, ElementRef, effect } from '@angular/core';
import { MutationObserverService } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-state-tracker',
  template: `
    <div #container [attr.data-state]="state" [class.active]="isActive">
      <p>State: {{ state }}</p>
    </div>
    <button (click)="toggleState()">Toggle State</button>
  `,
})
export class StateTrackerComponent {
  private mutationObserver = inject(MutationObserverService);

  containerElement = viewChild.required<ElementRef>('container');
  state = 'idle';
  isActive = false;

  constructor() {
    effect(() => {
      const element = this.containerElement().nativeElement;

      this.mutationObserver
        .observe(element, {
          attributes: true,
          attributeFilter: ['data-state', 'class'],
          attributeOldValue: true,
        })
        .subscribe((mutation) => {
          if (mutation.type === 'attributes') {
            console.log(`Attribute "${mutation.attributeName}" changed`);
            console.log(`Old value: ${mutation.oldValue}`);
            console.log(`New value: ${(mutation.target as Element).getAttribute(mutation.attributeName!)}`);
          }
        });
    });
  }

  toggleState() {
    this.state = this.state === 'idle' ? 'active' : 'idle';
    this.isActive = !this.isActive;
  }
}
```

### Content Change Detection

```typescript
import { Component } from '@angular/core';
import { ObserveMutationDirective } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-editor',
  imports: [ObserveMutationDirective],
  template: `
    <div contenteditable="true" (records)="onContentChange($event)" class="editor">Type here...</div>
    <p>Character count: {{ characterCount }}</p>
  `,
})
export class EditorComponent {
  characterCount = 0;

  onContentChange(mutation: MutationRecord) {
    if (mutation.type === 'characterData' || mutation.type === 'childList') {
      const element = mutation.target as HTMLElement;
      this.characterCount = element.textContent?.length || 0;
    }
  }
}
```

### Lazy Loading Detection

```typescript
import { Component, inject, viewChild, ElementRef, effect } from '@angular/core';
import { MutationObserverService } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-image-gallery',
  template: `
    <div #gallery class="gallery">
      <!-- Images loaded dynamically -->
    </div>
  `,
})
export class ImageGalleryComponent {
  private mutationObserver = inject(MutationObserverService);

  galleryElement = viewChild.required<ElementRef>('gallery');
  loadedImages = 0;

  constructor() {
    effect(() => {
      const element = this.galleryElement().nativeElement;

      this.mutationObserver
        .observe(element, {
          childList: true,
          subtree: true,
        })
        .subscribe((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IMG') {
              this.loadedImages++;
              console.log(`Image loaded. Total: ${this.loadedImages}`);
            }
          });
        });
    });
  }
}
```

---

## Mutation Record

Each mutation event provides a `MutationRecord` with the following properties:

| Property             | Type             | Description                                                     |
| -------------------- | ---------------- | --------------------------------------------------------------- |
| `type`               | `string`         | Type of mutation: "attributes", "characterData", or "childList" |
| `target`             | `Node`           | The node affected by the mutation                               |
| `addedNodes`         | `NodeList`       | Nodes added (for childList mutations)                           |
| `removedNodes`       | `NodeList`       | Nodes removed (for childList mutations)                         |
| `previousSibling`    | `Node \| null`   | Previous sibling of added/removed nodes                         |
| `nextSibling`        | `Node \| null`   | Next sibling of added/removed nodes                             |
| `attributeName`      | `string \| null` | Name of changed attribute                                       |
| `attributeNamespace` | `string \| null` | Namespace of changed attribute                                  |
| `oldValue`           | `string \| null` | Previous value (if recordOldValue was true)                     |

---

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/@dasch-ng/mutation-observer/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/mutation-observer).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
