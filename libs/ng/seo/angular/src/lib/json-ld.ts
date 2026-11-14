import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { serializeJsonLd } from '@dasch-ng/seo';

const MANAGED_ATTRIBUTE = 'data-json-ld';

/**
 * Writes JSON-LD structured data as `<script type="application/ld+json">` elements into the document head.
 *
 * Works during server-side rendering (it only uses the injected `DOCUMENT`) and during hydration: setting an id
 * that already exists replaces the script instead of adding a second one. The payload goes through
 * `serializeJsonLd`, so data can never close the script tag.
 *
 * @example
 * inject(JsonLd).set('product', { '@context': 'https://schema.org', '@type': 'Product', name: 'Camera' });
 */
@Injectable({ providedIn: 'root' })
export class JsonLd {
  private readonly document = inject(DOCUMENT);

  /** Creates or replaces the script with this id. `null` removes it. */
  set(id: string, data: unknown | null): void {
    if (data === null) {
      this.remove(id);
      return;
    }
    const script = this.find(id) ?? this.create(id);
    script.textContent = serializeJsonLd(data);
  }

  /** Removes the script with this id, if present. */
  remove(id: string): void {
    this.find(id)?.remove();
  }

  private find(id: string): HTMLScriptElement | null {
    const scripts = this.document.head.querySelectorAll<HTMLScriptElement>(`script[${MANAGED_ATTRIBUTE}]`);
    return Array.from(scripts).find((s) => s.getAttribute(MANAGED_ATTRIBUTE) === id) ?? null;
  }

  private create(id: string): HTMLScriptElement {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(MANAGED_ATTRIBUTE, id);
    this.document.head.appendChild(script);
    return script;
  }
}
