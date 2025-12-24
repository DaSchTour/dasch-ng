/**
 * Represents the different types of values that can be displayed in the JSON viewer.
 *
 * @remarks
 * These types are used to apply different styling and behavior to each value type.
 * For example, strings are quoted, arrays show their length, and circular references
 * are detected and displayed appropriately.
 */
export type SegmentType = 'number' | 'boolean' | 'string' | 'undefined' | 'null' | 'object' | 'array' | 'date' | 'function';

/**
 * Represents a single key-value pair in the JSON viewer tree.
 *
 * @remarks
 * Each segment contains metadata about a JSON value including its type,
 * string representation, and expansion state. Segments are used internally
 * by the component to render the tree structure.
 */
export interface Segment {
  /**
   * The key name for this value.
   *
   * @remarks
   * For object properties, this is the property name.
   * For array items, this is the index.
   * For primitive root values, this is a type descriptor like `(string)`.
   */
  key: string;

  /**
   * The actual value being displayed.
   *
   * @remarks
   * Can be any JavaScript value. Circular references will be replaced
   * with `{ $ref: "path" }` objects by the component's decycle function.
   */
  value: unknown;

  /**
   * The type of this value.
   *
   * @remarks
   * Determines how the value is styled and displayed in the viewer.
   * Can be `undefined` during initialization before type detection.
   */
  type: SegmentType | undefined;

  /**
   * A string representation of the value for display.
   *
   * @remarks
   * Formatted based on the value type:
   * - Strings: wrapped in quotes
   * - Arrays: shows length and JSON representation
   * - Objects: shows JSON representation
   * - Primitives: toString() representation
   * - Circular references: marked as `[Circular]`
   */
  description: string;

  /**
   * Whether this segment is currently expanded in the tree.
   *
   * @remarks
   * Only meaningful for expandable types (objects and arrays).
   * Users can toggle this by clicking on the segment.
   */
  expanded: boolean;
}
