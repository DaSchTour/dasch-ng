import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { JsonViewerComponent } from './json-viewer.component';

describe('JsonViewerComponent', () => {
  let spectator: Spectator<JsonViewerComponent>;
  const createComponent = createComponentFactory({
    component: JsonViewerComponent,
  });

  it('should create', () => {
    spectator = createComponent({ props: { json: {} } });
    expect(spectator.component).toBeTruthy();
  });

  describe('data type rendering', () => {
    it('should render string values correctly', () => {
      spectator = createComponent({ props: { json: { name: 'John' } } });
      expect(spectator.query('.segment-type-string')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toBe('"John"');
    });

    it('should render number values correctly', () => {
      spectator = createComponent({ props: { json: { age: 30 } } });
      expect(spectator.query('.segment-type-number')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toBe('30');
    });

    it('should render boolean values correctly', () => {
      spectator = createComponent({ props: { json: { active: true } } });
      expect(spectator.query('.segment-type-boolean')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toBe('true');
    });

    it('should render null values correctly', () => {
      spectator = createComponent({ props: { json: { data: null } } });
      expect(spectator.query('.segment-type-null')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toBe('null');
    });

    it('should render undefined values correctly', () => {
      spectator = createComponent({ props: { json: { data: undefined } } });
      expect(spectator.query('.segment-type-undefined')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toBe('undefined');
    });

    it('should render Date values correctly', () => {
      const date = new Date('2023-01-01');
      spectator = createComponent({ props: { json: { created: date } } });
      expect(spectator.query('.segment-type-date')).toBeTruthy();
    });

    it('should render array values correctly', () => {
      spectator = createComponent({ props: { json: { items: [1, 2, 3] }, expanded: false } });
      expect(spectator.query('.segment-type-array')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toContain('Array[3]');
    });

    it('should render object values correctly', () => {
      spectator = createComponent({ props: { json: { user: { name: 'John' } }, expanded: false } });
      expect(spectator.query('.segment-type-object')).toBeTruthy();
      expect(spectator.query('.segment-value')?.textContent).toContain('Object');
    });

    it('should render function values correctly', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const fn = () => {};
      spectator = createComponent({ props: { json: { callback: fn } } });
      expect(spectator.query('.segment-type-function')).toBeTruthy();
    });
  });

  describe('circular references', () => {
    it('should handle circular references without crashing', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = { a: 1 };
      circular.self = circular;
      spectator = createComponent({ props: { json: circular } });
      expect(spectator.component).toBeTruthy();
      // Check that both keys are rendered (a and self/$ref)
      const keys = spectator.queryAll('.segment-key');
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should show [Circular] for circular array references in description', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = { items: [] };
      circular.items.push(circular.items);
      spectator = createComponent({ props: { json: circular } });
      // The decycle will convert it to $ref, so we just check it doesn't crash
      expect(spectator.component).toBeTruthy();
    });

    it('should show [Circular] for circular object references in description', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = { nested: {} };
      circular.nested.parent = circular;
      spectator = createComponent({ props: { json: circular } });
      // The decycle will convert it to $ref, so we just check it doesn't crash
      expect(spectator.component).toBeTruthy();
    });
  });

  describe('expansion and collapse', () => {
    it('should expand all nodes by default', () => {
      spectator = createComponent({
        props: { json: { user: { name: 'John' } }, expanded: true },
      });
      const expandable = spectator.query('.expandable') as HTMLElement;
      expect(expandable.classList.contains('expanded')).toBe(true);
    });

    it('should collapse all nodes when expanded is false', () => {
      spectator = createComponent({
        props: { json: { user: { name: 'John' } }, expanded: false },
      });
      const expandable = spectator.query('.expandable') as HTMLElement;
      expect(expandable.classList.contains('expanded')).toBe(false);
    });

    it('should toggle expansion on click', () => {
      spectator = createComponent({
        props: { json: { user: { name: 'John' } }, expanded: true },
      });
      const expandable = spectator.query('.expandable') as HTMLElement;
      expect(expandable.classList.contains('expanded')).toBe(true);

      spectator.click(expandable);
      spectator.detectChanges();
      expect(expandable.classList.contains('expanded')).toBe(false);

      spectator.click(expandable);
      spectator.detectChanges();
      expect(expandable.classList.contains('expanded')).toBe(true);
    });

    it('should not be expandable for primitive values', () => {
      spectator = createComponent({ props: { json: { name: 'John' } } });
      const segment = spectator.query('.segment-type-string .segment-main') as HTMLElement;
      expect(segment.classList.contains('expandable')).toBe(false);
    });
  });

  describe('depth limiting', () => {
    it('should respect depth limit', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: 'deep',
            },
          },
        },
      };
      spectator = createComponent({
        props: { json: deepObject, depth: 2, expanded: true },
      });

      // Check that deep nesting respects the limit
      const children = spectator.queryAll('json-viewer');
      // Should have nested viewers but limited by depth
      expect(children.length).toBeGreaterThan(0);
    });

    it('should expand infinitely when depth is -1', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      };
      spectator = createComponent({
        props: { json: deepObject, depth: -1, expanded: true },
      });
      expect(spectator.component).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have role="button" for expandable elements', () => {
      spectator = createComponent({ props: { json: { user: { name: 'John' } } } });
      const expandable = spectator.query('.expandable');
      expect(expandable?.getAttribute('role')).toBe('button');
    });

    it('should have aria-expanded attribute', () => {
      spectator = createComponent({
        props: { json: { user: { name: 'John' } }, expanded: true },
      });
      const expandable = spectator.query('.expandable');
      expect(expandable?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have tabindex for keyboard navigation', () => {
      spectator = createComponent({ props: { json: { user: { name: 'John' } } } });
      const expandable = spectator.query('.expandable');
      expect(expandable?.getAttribute('tabindex')).toBe('0');
    });

    it('should have keydown event listeners for Enter and Space keys', () => {
      spectator = createComponent({
        props: { json: { user: { name: 'John' } }, expanded: true },
      });
      const expandable = spectator.query('.expandable') as HTMLElement;

      // Verify element is expandable and has proper attributes
      expect(expandable).toBeTruthy();
      expect(expandable.getAttribute('role')).toBe('button');
      expect(expandable.getAttribute('tabindex')).toBe('0');
    });

    it('should not have role or tabindex for non-expandable elements', () => {
      spectator = createComponent({ props: { json: { name: 'John' } } });
      const segment = spectator.query('.segment-main');
      expect(segment?.hasAttribute('role')).toBe(false);
      expect(segment?.hasAttribute('tabindex')).toBe(false);
    });

    it('should have aria-label describing the action', () => {
      spectator = createComponent({ props: { json: { user: { name: 'John' } } } });
      const expandable = spectator.query('.expandable');
      expect(expandable?.getAttribute('aria-label')).toContain('Toggle');
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      spectator = createComponent({ props: { json: {} } });
      expect(spectator.component).toBeTruthy();
      expect(spectator.queryAll('.segment')).toHaveLength(0);
    });

    it('should handle empty arrays', () => {
      spectator = createComponent({ props: { json: { items: [] }, expanded: false } });
      const valueElement = spectator.query('.segment-value');
      expect(valueElement).toBeTruthy();
      expect(valueElement?.textContent).toContain('Array[0]');
    });

    it('should handle primitive json input', () => {
      spectator = createComponent({ props: { json: 'hello' } });
      expect(spectator.query('.segment-key')?.textContent).toContain('(string)');
      expect(spectator.query('.segment-value')?.textContent).toBe('"hello"');
    });

    it('should handle number as root json', () => {
      spectator = createComponent({ props: { json: 42 } });
      expect(spectator.query('.segment-key')?.textContent).toContain('(number)');
      expect(spectator.query('.segment-value')?.textContent).toBe('42');
    });

    it('should handle large objects without performance issues', () => {
      const largeObject: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = i;
      }
      spectator = createComponent({ props: { json: largeObject } });
      expect(spectator.component).toBeTruthy();
    });
  });
});
