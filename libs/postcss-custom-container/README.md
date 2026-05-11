# @dasch-ng/postcss-custom-container

PostCSS plugin that lets you define and reuse **CSS Container Query** conditions via a custom `@custom-container` at-rule — analogous to `@custom-media`.

```css
/* Define once */
@custom-container --cq-sm (width <= 480px);
@custom-container --cq-md (480px < width <= 900px);
@custom-container --cq-lg (width > 900px);

/* Reuse anywhere */
@container card (--cq-md) and (height > 200px) {
  .card__title {
    font-size: 1.25rem;
  }
}
```

→ See [`SPEC.md`](./SPEC.md) for the full specification.

## Installation

```bash
npm install --save-dev @dasch-ng/postcss-custom-container postcss
# or
bun add -d @dasch-ng/postcss-custom-container postcss
```

`postcss` is a peer dependency (`^8.4`).

## Usage

### postcss.config.cjs

```js
module.exports = {
  plugins: [
    require('@dasch-ng/postcss-custom-container')({
      // optional JS-defined tokens, merged with @custom-container declarations
      customContainers: {
        '--cq-sm': '(width <= 480px)',
        '--cq-md': '(480px < width <= 900px)',
        '--cq-lg': '(width > 900px)',
      },
    }),
  ],
};
```

### ESM

```js
import postcss from 'postcss';
import customContainer from '@dasch-ng/postcss-custom-container';

const result = await postcss([customContainer()]).process(css, { from: undefined });
```

## Options

| Option             | Type                     | Default | Description                                                         |
| ------------------ | ------------------------ | ------- | ------------------------------------------------------------------- |
| `preserve`         | `boolean`                | `false` | Keep `@custom-container` declarations in the output.                |
| `warnOnUndefined`  | `boolean`                | `true`  | Emit a PostCSS warning when a referenced token has no definition.   |
| `customContainers` | `Record<string, string>` | `{}`    | Token map seeded from JS. Keys without leading `--` are normalised. |

## Syntax

### Definition

```css
@custom-container <token-name> <condition>;
```

- `<token-name>` MUST start with `--`.
- `<condition>` may use modern range syntax (`<`, `<=`, `>`, `>=`) or feature queries (e.g. `(orientation: portrait)`).

### Use site

```css
@container [optional-name] (--token-name) { … }
```

The plugin replaces every `(--token-name)` occurrence inside `@container` parameters with the stored condition.

### Examples

```css
@custom-container --cq-sm (width <= 480px);
@custom-container --cq-md (480px < width <= 900px);

/* Compose with logical operators */
@container (--cq-sm) or (--cq-md) { … }

/* Combine with named container and feature query */
@container card (--cq-md) and (height > 200px) { … }
```

## Building

```bash
nx build postcss-custom-container
```

## Tests

```bash
nx test postcss-custom-container
```

## License

MIT — see workspace root.
