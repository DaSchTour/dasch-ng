import { ngDomSnapshotSerializer } from './ng-dom-snapshot-serializer';

expect.addSnapshotSerializer(ngDomSnapshotSerializer);

function render(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host;
}

describe('ngDomSnapshotSerializer', () => {
  it('drops Angular internal attributes', () => {
    const el = render('<section _nghost-ng-c1="" _ngcontent-ng-c2="" ng-reflect-name="x" class="a"><p ng-reflect-model="1">t</p></section>');
    expect(el).toMatchInlineSnapshot(`
      <div>
        <section
          class="a"
        >
          <p>
            t
          </p>
        </section>
      </div>
    `);
  });

  it('drops generated ids and their references but keeps hand-written ones', () => {
    const el = render(
      '<label for="mat-input-3">L</label><input id="mat-input-3" aria-describedby="mat-hint-4 my-hint" aria-labelledby="cdk-overlay-1" /><span id="my-hint"></span>',
    );
    expect(el).toMatchInlineSnapshot(`
      <div>
        <label>
          L
        </label>
        <input
          aria-describedby="my-hint"
        />
        <span
          id="my-hint"
        />
      </div>
    `);
  });

  it('does not change the element under test', () => {
    const el = render('<input id="mat-input-3" ng-reflect-x="1" />');
    const before = el.innerHTML;
    expect(el).toMatchInlineSnapshot(`
      <div>
        <input />
      </div>
    `);
    expect(el.innerHTML).toBe(before);
  });
});
