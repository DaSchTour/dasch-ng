import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, EnvironmentProviders, PLATFORM_ID, inject, provideEnvironmentInitializer } from '@angular/core';
import { WebMcpModelContext, WebMcpTool } from './webmcp.types';

const registeredNames = new WeakMap<WebMcpModelContext, Set<string>>();

/**
 * Finds the model context: `document.modelContext` (current draft), falling back to
 * `navigator.modelContext` (early previews). Returns `undefined` when the API is missing.
 */
function findModelContext(document: Document): WebMcpModelContext | undefined {
  const candidates = [
    (document as { modelContext?: WebMcpModelContext }).modelContext,
    (document.defaultView?.navigator as { modelContext?: WebMcpModelContext } | undefined)?.modelContext,
  ];
  return candidates.find((c) => typeof c?.registerTool === 'function');
}

/**
 * Offers app functions as tools to AI agents through WebMCP.
 *
 * The factory runs once at startup in an injection context, so it can call `inject()`.
 * It can be used several times (for example in lazy routes); tools are unregistered when
 * the injector that holds the provider is destroyed. Nothing happens on the server or in
 * browsers without WebMCP. A tool whose name is already registered is skipped with a
 * console warning.
 *
 * @example
 * bootstrapApplication(App, {
 *   providers: [
 *     provideWebMcpTools(() => {
 *       const cart = inject(CartService);
 *       return [
 *         {
 *           name: 'cart_count',
 *           description: 'Number of items in the cart',
 *           annotations: { readOnlyHint: true },
 *           execute: async () => toolResult({ count: cart.count() }),
 *         },
 *       ];
 *     }),
 *   ],
 * });
 */
export function provideWebMcpTools(factory: () => WebMcpTool[]): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    const context = findModelContext(inject(DOCUMENT));
    if (!context) {
      return;
    }

    const tools = factory();
    const names = registeredNames.get(context) ?? new Set<string>();
    registeredNames.set(context, names);
    const controller = new AbortController();
    const own: string[] = [];

    for (const tool of tools) {
      if (names.has(tool.name)) {
        console.warn(`[webmcp] Tool "${tool.name}" is already registered, skipping.`);
        continue;
      }
      names.add(tool.name);
      own.push(tool.name);
      const fail = (error: unknown) => {
        // Release the name unless we aborted on purpose.
        if (!controller.signal.aborted) {
          names.delete(tool.name);
          console.warn(`[webmcp] Could not register tool "${tool.name}".`, error);
        }
      };
      try {
        Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(fail);
      } catch (error) {
        fail(error);
      }
    }

    inject(DestroyRef).onDestroy(() => {
      controller.abort();
      own.forEach((name) => names.delete(name));
    });
  });
}
