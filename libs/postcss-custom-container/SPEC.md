# postcss-custom-container — Specification

> Status: **Draft (1.0.0-rc)**
> Plugin name: `postcss-custom-container`
> Inspiration: [`postcss-custom-media`](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media)

## 1. Goal

Provide a reusable, named token mechanism for **CSS Container Queries**, analogous to the way `@custom-media` works for Media Queries.

CSS does not (yet) ship a `@custom-container` at-rule on the standards track. This plugin fills that gap with a deterministic, build-time substitution that:

- Lets authors define container query conditions **once** and reuse them by name.
- Keeps the source readable: `@container card (--cq-md) { … }` instead of `@container card (480px <= width < 900px) { … }`.
- Survives composition with the modern range syntax (`<`, `<=`, `>`, `>=`).
- Is fully **build-time**: no runtime, no JS injection, output is plain CSS.

## 2. Non-Goals

- No polyfilling of `@container` itself — the plugin only substitutes tokens; the result must still be valid CSS Container Query syntax.
- No CSS-wide variable resolution. The plugin only touches `@custom-container` definitions and `@container` parameter strings.
- No nesting/cross-file imports. If a definition lives in another file, the consumer must concatenate / `@import`-flatten before this plugin runs (or pass the token via the `customContainers` JS option).
- No source-map remapping beyond what PostCSS does automatically when at-rules are removed.

## 3. Syntax

### 3.1 Definition

```css
@custom-container <token-name> <condition>;
```

- `<token-name>` MUST start with `--` (CSS custom-property convention).
- `<condition>` is the Container Query condition without the wrapping parentheses; the plugin normalises it (see §4.3).
- Trailing `;` is optional from a CSS standpoint but recommended.

Examples:

```css
@custom-container --cq-sm (width <= 480px);
@custom-container --cq-md (480px < width <= 900px);
@custom-container --cq-lg (width > 900px);
@custom-container --cq-portrait (orientation: portrait);
```

### 3.2 Use site

Inside any `@container` rule, a token is referenced as `(--token-name)`:

```css
@container (--cq-md) {
  /* … */
}

@container card (--cq-md) and (height > 200px) {
  /* … */
}

@container (--cq-sm) or (--cq-lg) {
  /* … */
}
```

The plugin replaces the _exact_ parenthesised token reference with the stored condition.

### 3.3 Token resolution

Token sources, merged in this order (later wins):

1. JS option `customContainers` (passed to the plugin).
2. CSS `@custom-container` declarations encountered top-to-bottom in the AST.

This lets a project ship JS-defined defaults that CSS authors can override locally.

## 4. Behaviour

### 4.0 Scope guarantee

The plugin operates **exclusively** on the `@container` at-rule. The following are explicitly out of scope and MUST be left untouched:

- `@media (...)` — token substitution there is the job of [`postcss-custom-media`](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media).
- `@supports (...)` — different at-rule with different semantics.
- CSS declarations / custom-property values (e.g. `--foo: (--cq-md);` or `var(--cq-md)`).

A `(--token)` occurrence outside an `@container` parameter never triggers substitution — even if the token is defined.

### 4.1 Pass model

The plugin operates in two passes within a single `Once` walk:

- **Pass 1** — Collect `@custom-container` rules. After collection, definitions are removed from the AST (unless `preserve: true`).
- **Pass 2** — Walk every `@container` at-rule and substitute parenthesised token references in `params`.

### 4.2 Substitution semantics

Substitution uses the regex `/\(\s*(--[\w-]+)\s*\)/g`:

- Matches `(--name)` or `( --name )` with optional inner whitespace.
- Does **not** match bare `--name` without surrounding parens (deliberate; avoids accidental matches inside other declarations).
- Does **not** match identifier references that are not custom properties (e.g. `(card)` is the container _name_ and stays untouched).
- Multiple tokens in one condition are all replaced (`(--a) or (--b)`).

### 4.3 Condition normalisation

Stored conditions are wrapped so the substitute output is a valid grouped query:

- If the source condition already starts with `(`, it is stored as-is.
- Otherwise, it is wrapped: `width <= 480px` → `(width <= 480px)`.

This means after substitution `(--cq-sm)` becomes `(width <= 480px)`, **not** `((width <= 480px))`.

### 4.4 Container name vs. token

`@container` accepts an optional container name before the condition. The plugin must not touch it:

```css
@container card (--cq-md) { … }
/* → */
@container card (width >= 480px) { … }
```

### 4.5 Removing vs. preserving definitions

By default the plugin **removes** `@custom-container` rules from the output. With `preserve: true` they remain (useful for debugging or chained tooling).

## 5. Plugin Options

```ts
type PluginOptions = {
  preserve?: boolean; // default: false
  warnOnUndefined?: boolean; // default: true
  customContainers?: Record<string, string>;
};
```

| Option             | Type                     | Default | Effect                                                            |
| ------------------ | ------------------------ | ------- | ----------------------------------------------------------------- |
| `preserve`         | `boolean`                | `false` | Keep `@custom-container` definitions in the output.               |
| `warnOnUndefined`  | `boolean`                | `true`  | Emit a `result.warn` when a `(--token)` reference is not defined. |
| `customContainers` | `Record<string, string>` | `{}`    | JS-side token seed. Keys without leading `--` are normalised.     |

## 6. Diagnostics

The plugin emits PostCSS warnings (`result.warn`) — never throws — for:

| Condition                                                   | Message (substring)                 | At which node                     |
| ----------------------------------------------------------- | ----------------------------------- | --------------------------------- |
| Definition without a condition (`@custom-container --foo;`) | `is missing a condition`            | The offending `@custom-container` |
| Token name not starting with `--`                           | `must start with "--"`              | The offending `@custom-container` |
| Definition with empty condition after the name              | `has an empty condition`            | The offending `@custom-container` |
| `@container` references an unknown token                    | `Undefined @custom-container token` | The offending `@container`        |

The undefined-token warning is suppressed when `warnOnUndefined: false`.

## 7. Edge Cases

1. **Whitespace in references** — `( --cq-md )` is a valid reference and substitutes.
2. **Multiple tokens per condition** — `@container (--cq-sm) or (--cq-lg)` replaces both.
3. **Mixed syntax** — `@container card (--cq-md) and (height > 200px)` only the token substitutes; other parts pass through.
4. **Unknown tokens** — preserved verbatim (`(--cq-unknown)` stays in output) and a warning is emitted (unless suppressed).
5. **Definition inside `@media` / `@supports`** — collected as if it were at root (current behaviour; future revision may scope this).
6. **Duplicate definitions** — last definition wins; no warning emitted.
7. **JS option key without `--`** — `{ 'cq-md': '…' }` is normalised to `--cq-md`.
8. **Non-string `customContainers`** — silently skipped if `typeof opts.customContainers !== 'object'`.
9. **`@container` with no params** — left untouched.
10. **`@container` whose params contain no token reference** — left untouched, no warning.

## 8. Known Limitations

These differ from `postcss-custom-media` and may be revisited in future revisions:

1. **No `true` / `false` debug constants.** csstools' `postcss-custom-media` lets you write `@custom-media --foo true;` to short-circuit a query for debugging. There is no equivalent universal sentinel for container queries (no analogue to `(max-color:2147477350)`). For now, debug by manually setting a token to a clearly always- or never-matching range like `(width >= 0px)` / `(width >= 99999999px)`.
2. **No logical expansion.** Expressions like `@container not (--token)` where `--token` itself contains `or` / `and` are passed through unchanged. csstools' plugin expands such cases by duplicating the parent rule. The current implementation handles only direct substitution; complex negation of composite tokens is the author's responsibility.
3. **Regex-based parser.** Substitution uses `/\(\s*(--[\w-]+)\s*\)/g`. This is correct for the syntax in §3 but does not parse nested CQS structures like `style()` queries semantically.
4. **No scoping by container context.** Definitions are global to the file; they are not bound to the lexical scope of an `@media` or `@layer` block (see §7.5).

## 9. Stability & Versioning

- The plugin follows semver against this spec.
- The spec is the contract; implementation details (regex, internal pass model) may change without a major bump as long as the observable behaviour above holds.
- Diagnostic _message text_ is informational and may change between minor versions; stable code should not match against it.
