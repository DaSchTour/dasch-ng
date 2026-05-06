/**
 * postcss-custom-container
 *
 * Define reusable container query conditions via @custom-container,
 * analogous to @custom-media (postcss-custom-media).
 *
 * Supports modern range syntax: width <= 480px, 480px <= width < 900px, etc.
 *
 * ─── Syntax ──────────────────────────────────────────────────────────────────
 *
 *   @custom-container --name (condition);
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 *   @container [optional-name] (--name) { ... }
 *   @container card (--cq-md) and (height > 200px) { ... }
 *   @container (--cq-sm) or (--cq-lg) { ... }
 *
 * ─── Options ─────────────────────────────────────────────────────────────────
 *
 *   customContainers  Record<string, string>
 *                     Tokens defined in JS/config (merged with CSS @custom-container)
 *
 *   preserve          boolean (default: false)
 *                     Keep @custom-container declarations in output (debugging)
 *
 *   warnOnUndefined   boolean (default: true)
 *                     Emit PostCSS warning when a token is used but never defined
 *
 * @type {import('postcss').PluginCreator}
 */
import type { PluginCreator } from 'postcss';

/** postcss-custom-media plugin options */
export type PluginOptions = {
  /** Preserve the original notation. default: false */
  preserve?: boolean;
  warnOnUndefined?: boolean;
  customContainers?: Record<string, string>;
};

const creator: PluginCreator<PluginOptions> = (opts: PluginOptions = {}) => {
  return {
    postcssPlugin: 'postcss-custom-container',

    Once(root, { result }) {
      const tokens = new Map();

      // Seed from plugin options
      if (opts.customContainers && typeof opts.customContainers === 'object') {
        for (const [rawName, rawCondition] of Object.entries(opts.customContainers)) {
          const name = rawName.startsWith('--') ? rawName : `--${rawName}`;
          tokens.set(name, normaliseCondition(rawCondition));
        }
      }

      // Pass 1: collect @custom-container definitions from CSS
      root.walkAtRules('custom-container', (atRule) => {
        const params = atRule.params.trim();
        const spaceIdx = params.search(/\s/);

        if (spaceIdx === -1) {
          result.warn(`@custom-container "${params}" is missing a condition`, { node: atRule });
          if (!opts.preserve) {
            atRule.remove();
          }
          return;
        }

        const name = params.slice(0, spaceIdx).trim();
        const condition = params.slice(spaceIdx).trim();

        if (!name.startsWith('--')) {
          result.warn(`@custom-container token names must start with "--", got: "${name}"`, { node: atRule });
          if (!opts.preserve) {
            atRule.remove();
          }
          return;
        }

        if (!condition) {
          result.warn(`@custom-container "${name}" has an empty condition`, { node: atRule });
          if (!opts.preserve) {
            atRule.remove();
          }
          return;
        }

        tokens.set(name, normaliseCondition(condition));
        if (!opts.preserve) {
          atRule.remove();
        }
      });

      const warnOnUndefined = opts.warnOnUndefined !== false;

      // Pass 2: substitute tokens inside @container params
      root.walkAtRules('container', (atRule) => {
        if (!atRule.params) {
          return;
        }

        // Collect undefined tokens separately to avoid calling result.warn
        // inside the String.replace callback (closure timing issue)
        const undefinedTokens: Array<string> = [];

        const replaced = atRule.params.replace(/\(\s*(--[\w-]+)\s*\)/g, function (match, tokenName) {
          if (tokens.has(tokenName)) {
            return tokens.get(tokenName);
          }
          undefinedTokens.push(tokenName);
          return match;
        });

        // Emit warnings after replacement is complete
        if (warnOnUndefined && undefinedTokens.length > 0) {
          undefinedTokens.forEach(function (tokenName) {
            result.warn(`Undefined @custom-container token: "${tokenName}". ` + `Did you forget to declare it or import the tokens file?`, { node: atRule });
          });
        }

        if (replaced !== atRule.params) {
          atRule.params = replaced;
        }
      });
    },
  };
};

function normaliseCondition(condition: string) {
  const trimmed = condition.trim();
  return trimmed.startsWith('(') ? trimmed : `(${trimmed})`;
}

creator.postcss = true;

export default creator;
