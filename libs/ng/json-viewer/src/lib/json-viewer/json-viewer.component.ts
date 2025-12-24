import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { NgClass } from '@angular/common';
import { Segment } from './segment';
import { isExpandable } from './is-expandable';
import { IsExpandablePipe } from './is-expandable.pipe';

/**
 * A modern Angular component for displaying JSON data in an interactive tree view.
 *
 * @remarks
 * This component provides syntax highlighting, collapsible nodes, and circular reference detection.
 * It's built as a standalone component with signal-based inputs for optimal performance.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { JsonViewerComponent } from '@dasch-ng/json-viewer';
 *
 * @Component({
 *   template: `<json-viewer [json]="data" />`
 * })
 * export class MyComponent {
 *   data = { name: 'John', age: 30 };
 * }
 * ```
 *
 * @example
 * With configuration:
 * ```typescript
 * <json-viewer
 *   [json]="complexData"
 *   [expanded]="false"
 *   [depth]="3"
 * />
 * ```
 */
@Component({
  selector: 'json-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss'],
  imports: [NgClass, IsExpandablePipe],
})
export class JsonViewerComponent {
  /**
   * The JSON data to display in the viewer.
   *
   * @remarks
   * This is a required input. The component automatically handles circular references
   * by converting them to `$ref` placeholders during processing.
   *
   * Accepts any valid JavaScript value including:
   * - Objects and arrays
   * - Primitives (string, number, boolean, null, undefined)
   * - Dates and functions
   * - Circular references (automatically detected and handled)
   *
   * @example
   * ```typescript
   * <json-viewer [json]="myData" />
   * ```
   */
  public readonly json = input.required<unknown, unknown>({ transform: (json) => this.decycle(json) });

  /**
   * Controls whether all nodes are expanded by default.
   *
   * @remarks
   * When `true`, all expandable nodes (objects and arrays) will be shown in their
   * expanded state. When `false`, all nodes start collapsed. Users can still toggle
   * individual nodes by clicking on them.
   *
   * @defaultValue `true`
   *
   * @example
   * Start with all nodes collapsed:
   * ```typescript
   * <json-viewer [json]="data" [expanded]="false" />
   * ```
   */
  public readonly expanded = input(true, { transform: booleanAttribute });

  /**
   * Maximum depth level to automatically expand.
   *
   * @remarks
   * Controls how many levels deep the tree will be expanded by default:
   * - `-1`: Expand all levels (unlimited depth)
   * - `0`: Collapse everything
   * - `n > 0`: Expand only the first n levels
   *
   * This works in conjunction with the `expanded` input. If `expanded` is `false`,
   * this setting has no effect.
   *
   * @defaultValue `-1` (unlimited)
   *
   * @example
   * Expand only the first 3 levels:
   * ```typescript
   * <json-viewer [json]="data" [depth]="3" />
   * ```
   */
  public readonly depth = input(-1, { transform: numberAttribute });

  /** @internal - Used for recursive depth tracking */
  readonly _currentDepth = input(0, { transform: numberAttribute });

  /** @internal - Tracks which keys are currently expanded in the tree */
  private readonly expandedKeys = new Set<string>();

  /**
   * Computed signal containing the parsed and segmented JSON data.
   *
   * @remarks
   * This signal automatically updates when the input JSON changes. Each segment
   * represents a key-value pair with metadata about its type, value, and expansion state.
   *
   * @returns An array of {@link Segment} objects representing the JSON structure
   *
   * @internal This is computed automatically from the `json` input
   */
  segments = computed<Segment[]>(() => {
    const json = this.json();
    const segments: Segment[] = [];
    if (json && typeof json === 'object') {
      Object.keys(json).forEach((key) => {
        segments.push(this.parseKeyValue(key, json[key as keyof typeof json]));
      });
    } else {
      segments.push(this.parseKeyValue(`(${typeof json})`, json));
    }
    return segments;
  });

  /**
   * Toggles the expansion state of a segment (node) in the tree.
   *
   * @remarks
   * This method is called when a user clicks on an expandable node (object or array).
   * It updates the internal expansion state and the segment's expanded property.
   * Only expandable segments (objects and arrays) can be toggled.
   *
   * @param segment - The segment to toggle
   *
   * @example
   * This is typically called from the template when a user clicks on a node:
   * ```html
   * <div (click)="toggle(segment)">...</div>
   * ```
   */
  toggle(segment: Segment) {
    if (isExpandable(segment)) {
      if (this.expandedKeys.has(segment.key)) {
        this.expandedKeys.delete(segment.key);
      } else {
        this.expandedKeys.add(segment.key);
      }
      segment.expanded = !segment.expanded;
    }
  }

  /**
   * Parses a key-value pair into a segment with type information and display metadata.
   *
   * @param key - The key name for this value
   * @param value - The value to parse
   * @returns A {@link Segment} object with type, description, and expansion state
   *
   * @internal
   */
  private parseKeyValue(key: string, value: unknown): Segment {
    const segment: Segment = {
      key: key,
      value: value,
      type: undefined,
      description: '' + value,
      expanded: this.isExpanded(),
    };

    switch (typeof segment.value) {
      case 'number': {
        segment.type = 'number';
        break;
      }
      case 'boolean': {
        segment.type = 'boolean';
        break;
      }
      case 'function': {
        segment.type = 'function';
        break;
      }
      case 'string': {
        segment.type = 'string';
        segment.description = '"' + segment.value + '"';
        break;
      }
      case 'undefined': {
        segment.type = 'undefined';
        segment.description = 'undefined';
        break;
      }
      case 'object': {
        // yea, null is object
        if (segment.value === null) {
          segment.type = 'null';
          segment.description = 'null';
        } else if (Array.isArray(segment.value)) {
          segment.type = 'array';
          try {
            segment.description = 'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
          } catch {
            segment.description = 'Array[' + segment.value.length + '] [Circular]';
          }
        } else if (segment.value instanceof Date) {
          segment.type = 'date';
        } else {
          segment.type = 'object';
          try {
            segment.description = 'Object ' + JSON.stringify(segment.value);
          } catch {
            segment.description = 'Object [Circular]';
          }
        }
        break;
      }
    }

    return segment;
  }

  /**
   * Determines if a segment should be expanded based on configuration.
   *
   * @returns `true` if the segment should be expanded
   *
   * @internal
   */
  private isExpanded(): boolean {
    return this.expanded() && !(this.depth() > -1 && this._currentDepth() >= this.depth());
  }

  /**
   * Removes circular references from an object by replacing them with `$ref` placeholders.
   *
   * @remarks
   * This implementation is based on Douglas Crockford's cycle.js algorithm.
   * It traverses the object tree and detects circular references, replacing them
   * with `{ $ref: "path" }` objects that point to the original location.
   *
   * This prevents infinite loops when displaying objects with circular references.
   *
   * @param object - The object to process
   * @returns A new object with circular references replaced by `$ref` placeholders
   *
   * @see {@link https://github.com/douglascrockford/JSON-js/blob/master/cycle.js | Douglas Crockford's cycle.js}
   *
   * @internal
   */
  // https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private decycle(object: any): any {
    const objects = new WeakMap();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (function derez(value: any, path: string): any {
      let old_path;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let nu: any;

      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Boolean) &&
        !(value instanceof Date) &&
        !(value instanceof Number) &&
        !(value instanceof RegExp) &&
        !(value instanceof String)
      ) {
        old_path = objects.get(value);
        if (old_path !== undefined) {
          return { $ref: old_path };
        }
        objects.set(value, path);

        if (Array.isArray(value)) {
          nu = [];
          value.forEach(function (element, i) {
            nu[i] = derez(element, path + '[' + i + ']');
          });
        } else {
          nu = {};
          Object.keys(value).forEach(function (name) {
            nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
          });
        }
        return nu;
      }
      return value;
    })(object, '$');
  }
}
