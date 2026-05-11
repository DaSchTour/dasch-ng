# PostCSS Custom Container

A PostCSS plugin that brings reusable **named tokens for CSS Container Queries** to your stylesheets — modelled after [`@custom-media`](https://drafts.csswg.org/mediaqueries-5/#custom-mq) but for `@container`.

Define your container breakpoints once with a `@custom-container` at-rule, then reference them by name anywhere a `@container` query is allowed.

## Installation

```bash
npm install --save-dev @dasch-ng/postcss-custom-container postcss
```

`postcss` is a peer dependency (`^8.4`).

## Why

CSS gives you `@custom-media --md (width >= 768px);` for media queries — but no equivalent for the new container-query world. As your design system grows, you end up repeating the same `(width <= 480px)` clause across dozens of components, and changing a breakpoint becomes a sed-and-pray.

This plugin closes that gap at build time:

- ✅ Define a breakpoint **once**, reuse it everywhere
- ✅ Works with the modern range syntax (`<`, `<=`, `>`, `>=`)
- ✅ Composable with logical operators (`and`, `or`, `not`)
- ✅ JS-side seeding so tokens can come from your design system config
- ✅ Build-time only — output is plain, valid CSS Container Query code

## Quick Start

```css
/* tokens.css */
@custom-container --cq-sm (width <= 480px);
@custom-container --cq-md (480px < width <= 900px);
@custom-container --cq-lg (width > 900px);

/* card.css */
@container card (--cq-md) and (height > 200px) {
  .card__title {
    font-size: 1.25rem;
  }
}
```

After PostCSS:

```css
@container card (480px < width <= 900px) and (height > 200px) {
  .card__title {
    font-size: 1.25rem;
  }
}
```

## Configuration

### postcss.config.cjs

```js
module.exports = {
  plugins: [
    require('@dasch-ng/postcss-custom-container')({
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

| Option             | Type                     | Default | Description                                                                                                       |
| ------------------ | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `preserve`         | `boolean`                | `false` | Keep the original `@custom-container` declarations in the output (useful for debugging).                          |
| `warnOnUndefined`  | `boolean`                | `true`  | Emit a PostCSS warning when a `(--token)` is referenced but never defined.                                        |
| `customContainers` | `Record<string, string>` | `{}`    | Tokens defined in JS, merged with CSS `@custom-container` declarations. Keys without leading `--` are normalised. |

## Token Resolution

Tokens are merged in this order, **later wins**:

1. JS option `customContainers`
2. CSS `@custom-container` declarations (top-to-bottom in source order)

This lets you ship sensible defaults from a design system config and selectively override them in CSS.

## Syntax Reference

### Defining a token

```css
@custom-container <token-name> <condition>;
```

- `<token-name>` **must** start with `--` (CSS custom-property convention)
- `<condition>` is a Container Query condition; outer parentheses are optional and added automatically when missing

### Using a token

```css
@container [optional-name] (--token-name) { … }
```

The plugin replaces the **exact** parenthesised reference. Bare `--name` without parens is **not** matched (deliberate — avoids touching custom property usage in declarations).

### Examples

```css
/* Single breakpoint */
@container (--cq-md) {
  /* … */
}

/* Named container + token + extra condition */
@container card (--cq-md) and (height > 200px) {
  /* … */
}

/* Logical composition */
@container (--cq-sm) or (--cq-lg) {
  /* … */
}

/* Feature query as a token */
@custom-container --cq-portrait (orientation: portrait);
@container (--cq-portrait) {
  /* … */
}
```

## Diagnostics

The plugin **never throws**. It emits PostCSS warnings via `result.warn` for:

| Situation                                       | Behaviour                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `@custom-container --foo;` (no condition)       | Warning + rule removed (unless `preserve: true`)                     |
| `@custom-container foo (…)` (name without `--`) | Warning + rule removed                                               |
| `@custom-container --foo  ` (empty condition)   | Warning + rule removed                                               |
| `@container (--unknown)`                        | Warning (unless `warnOnUndefined: false`) + reference left untouched |

## Spec

Full specification including pass model, edge cases, and stability guarantees: [SPEC.md](https://github.com/daschtour/dasch-ng/blob/main/libs/postcss-custom-container/SPEC.md).

## License

MIT
