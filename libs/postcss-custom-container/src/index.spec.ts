import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import customContainer, { type PluginOptions } from './index';

async function run(input: string, opts: PluginOptions = {}) {
  const result = await postcss([customContainer(opts)]).process(input, { from: undefined });
  return {
    css: result.css,
    warnings: result.warnings().map((w) => w.text),
  };
}

describe('postcss-custom-container', () => {
  describe('plugin metadata', () => {
    it('declares the postcssPlugin name', () => {
      const plugin = customContainer() as { postcssPlugin: string };
      expect(plugin.postcssPlugin).toBe('postcss-custom-container');
    });

    it('flags itself as a postcss plugin via static property', () => {
      expect((customContainer as unknown as { postcss: boolean }).postcss).toBe(true);
    });
  });

  describe('definition + substitution', () => {
    it('substitutes a CSS-defined token reference', async () => {
      const { css } = await run(`
        @custom-container --cq-md (480px < width <= 900px);
        @container (--cq-md) { .a { color: red; } }
      `);

      expect(css).toContain('@container (480px < width <= 900px)');
      expect(css).not.toContain('@custom-container');
    });

    it('removes @custom-container declarations by default', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        .a { color: red; }
      `);

      expect(css).not.toContain('@custom-container');
      expect(css).toContain('.a { color: red; }');
    });

    it('keeps @container rules without token references untouched', async () => {
      const { css } = await run(`
        @container (width > 600px) { .a {} }
      `);

      expect(css).toContain('@container (width > 600px)');
    });

    it('leaves @container rules with empty params alone', async () => {
      const { css, warnings } = await run(`
        @custom-container --cq-md (width >= 480px);
        @container { .a {} }
      `);

      expect(css).toContain('@container');
      expect(warnings).toHaveLength(0);
    });
  });

  describe('range syntax + composition', () => {
    it('preserves the range operators in the substituted output', async () => {
      const { css } = await run(`
        @custom-container --cq-sm (width <= 480px);
        @container (--cq-sm) { .a {} }
      `);

      expect(css).toContain('(width <= 480px)');
    });

    it('substitutes multiple tokens in a single condition', async () => {
      const { css } = await run(`
        @custom-container --cq-sm (width <= 480px);
        @custom-container --cq-lg (width > 900px);
        @container (--cq-sm) or (--cq-lg) { .a {} }
      `);

      expect(css).toContain('(width <= 480px) or (width > 900px)');
    });

    it('keeps the optional container name unchanged', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        @container card (--cq-md) and (height > 200px) { .a {} }
      `);

      expect(css).toContain('@container card (width >= 480px) and (height > 200px)');
    });

    it('substitutes feature-query-style conditions', async () => {
      const { css } = await run(`
        @custom-container --cq-portrait (orientation: portrait);
        @container (--cq-portrait) { .a {} }
      `);

      expect(css).toContain('(orientation: portrait)');
    });

    it('substitutes a reference with internal whitespace', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        @container ( --cq-md ) { .a {} }
      `);

      expect(css).toContain('(width >= 480px)');
    });
  });

  describe('condition normalisation', () => {
    it('wraps an unwrapped condition in parentheses', async () => {
      const { css } = await run(`
        @custom-container --cq-sm width <= 480px;
        @container (--cq-sm) { .a {} }
      `);

      expect(css).toContain('@container (width <= 480px)');
      expect(css).not.toContain('@container ((width');
    });

    it('does not double-wrap a condition that already starts with "("', async () => {
      const { css } = await run(`
        @custom-container --cq-sm (width <= 480px);
        @container (--cq-sm) { .a {} }
      `);

      expect(css).toContain('@container (width <= 480px)');
      expect(css).not.toContain('((width');
    });
  });

  describe('JS option customContainers', () => {
    it('seeds tokens from the JS option', async () => {
      const { css } = await run(`@container (--cq-md) { .a {} }`, { customContainers: { '--cq-md': '(width >= 480px)' } });

      expect(css).toContain('(width >= 480px)');
    });

    it('normalises keys without leading "--"', async () => {
      const { css } = await run(`@container (--cq-md) { .a {} }`, { customContainers: { 'cq-md': '(width >= 480px)' } });

      expect(css).toContain('(width >= 480px)');
    });

    it('lets CSS @custom-container override a JS-defined token (later wins)', async () => {
      const { css } = await run(
        `
          @custom-container --cq-md (width >= 768px);
          @container (--cq-md) { .a {} }
        `,
        { customContainers: { '--cq-md': '(width >= 480px)' } },
      );

      expect(css).toContain('(width >= 768px)');
      expect(css).not.toContain('(width >= 480px)');
    });

    it('ignores a non-object customContainers value silently', async () => {
      const { css, warnings } = await run(`@container (--cq-md) { .a {} }`, {
        customContainers: null as unknown as PluginOptions['customContainers'],
        warnOnUndefined: false,
      });

      expect(css).toContain('(--cq-md)');
      expect(warnings).toHaveLength(0);
    });
  });

  describe('preserve option', () => {
    it('removes @custom-container by default', async () => {
      const { css } = await run(`@custom-container --cq-md (width >= 480px);`);
      expect(css).not.toContain('@custom-container');
    });

    it('keeps @custom-container with preserve: true', async () => {
      const { css } = await run(`@custom-container --cq-md (width >= 480px);`, { preserve: true });

      expect(css).toContain('@custom-container --cq-md (width >= 480px)');
    });

    it('still substitutes references when preserve is true', async () => {
      const { css } = await run(
        `
          @custom-container --cq-md (width >= 480px);
          @container (--cq-md) { .a {} }
        `,
        { preserve: true },
      );

      expect(css).toContain('@custom-container --cq-md (width >= 480px)');
      expect(css).toContain('@container (width >= 480px)');
    });
  });

  describe('warnings', () => {
    it('warns when a referenced token is undefined', async () => {
      const { warnings, css } = await run(`
        @container (--cq-unknown) { .a {} }
      `);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatch(/--cq-unknown/);
      expect(css).toContain('(--cq-unknown)');
    });

    it('emits one warning per undefined-token reference', async () => {
      const { warnings } = await run(`
        @container (--a) or (--b) { .x {} }
      `);

      expect(warnings).toHaveLength(2);
    });

    it('suppresses undefined-token warnings when warnOnUndefined is false', async () => {
      const { warnings } = await run(`@container (--cq-unknown) { .a {} }`, { warnOnUndefined: false });

      expect(warnings).toHaveLength(0);
    });

    it('warns and removes a definition with no condition', async () => {
      const { warnings, css } = await run(`@custom-container --cq-md ;`);

      expect(warnings.some((w) => /missing a condition/i.test(w))).toBe(true);
      expect(css).not.toContain('@custom-container');
    });

    it('warns and removes a definition whose name does not start with --', async () => {
      const { warnings, css } = await run(`@custom-container cq-md (width >= 480px);`);

      expect(warnings.some((w) => /must start with "--"/i.test(w))).toBe(true);
      expect(css).not.toContain('@custom-container');
    });

    it('keeps an invalid @custom-container in the output when preserve is true', async () => {
      const { warnings, css } = await run(`@custom-container --cq-md ;`, { preserve: true });

      expect(warnings).toHaveLength(1);
      expect(css).toContain('@custom-container --cq-md');
    });
  });

  describe('redefinition', () => {
    it('uses the last definition when the same token is declared twice', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        @custom-container --cq-md (width >= 768px);
        @container (--cq-md) { .a {} }
      `);

      expect(css).toContain('(width >= 768px)');
      expect(css).not.toContain('(width >= 480px)');
    });
  });

  describe('scope: only @container is touched', () => {
    it('does NOT substitute tokens inside @media queries', async () => {
      const { css, warnings } = await run(`
        @custom-container --cq-md (width >= 480px);
        @media (--cq-md) { .a { color: red; } }
      `);

      // The @media reference must remain verbatim; @custom-container is for
      // container queries only. @custom-media is a separate concern.
      expect(css).toContain('@media (--cq-md)');
      expect(css).not.toMatch(/@media\s+\(width >= 480px\)/);
      expect(warnings).toHaveLength(0);
    });

    it('does NOT substitute tokens inside @supports queries', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        @supports (--cq-md) { .a {} }
      `);

      expect(css).toContain('@supports (--cq-md)');
      expect(css).not.toMatch(/@supports\s+\(width >= 480px\)/);
    });

    it('does NOT substitute tokens in CSS declarations (custom-property values)', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        .a { --foo: (--cq-md); color: var(--cq-md); }
      `);

      // Plugin must not touch declarations even if they contain a parenthesised
      // token reference, because that's a custom-property usage, not a query.
      expect(css).toContain('--foo: (--cq-md)');
      expect(css).toContain('var(--cq-md)');
    });

    it('does not substitute when @container is nested inside @media (token still substitutes in inner @container only)', async () => {
      const { css } = await run(`
        @custom-container --cq-md (width >= 480px);
        @media (--cq-md) {
          @container (--cq-md) { .a {} }
        }
      `);

      expect(css).toContain('@media (--cq-md)');
      expect(css).toContain('@container (width >= 480px)');
    });

    it('processes a definition declared inside @media (collected globally)', async () => {
      // Documents current behaviour: definitions are collected wherever they
      // appear in the AST, not scoped. See SPEC §7.5.
      const { css } = await run(`
        @media (min-width: 1px) {
          @custom-container --cq-md (width >= 480px);
        }
        @container (--cq-md) { .a {} }
      `);

      expect(css).toContain('@container (width >= 480px)');
    });
  });
});
