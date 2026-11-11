import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { JsonLd } from './json-ld';

describe('JsonLd', () => {
  let doc: Document;
  let service: JsonLd;

  const scripts = () => Array.from(doc.head.querySelectorAll('script[type="application/ld+json"]'));

  beforeEach(() => {
    service = TestBed.inject(JsonLd);
    doc = TestBed.inject(DOCUMENT);
    scripts().forEach((s) => s.remove());
  });

  afterEach(() => scripts().forEach((s) => s.remove()));

  it('writes a JSON-LD script into the head', () => {
    service.set('org', { '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' });
    expect(scripts()).toHaveLength(1);
    expect(JSON.parse(scripts()[0].textContent ?? '')).toEqual({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' });
  });

  it('replaces the script for the same id instead of duplicating it', () => {
    service.set('org', { name: 'A' });
    service.set('org', { name: 'B' });
    expect(scripts()).toHaveLength(1);
    expect(scripts()[0].textContent).toContain('"B"');
  });

  it('keeps scripts with different ids apart and removes them separately', () => {
    service.set('a', { n: 1 });
    service.set('b', { n: 2 });
    expect(scripts()).toHaveLength(2);
    service.remove('a');
    expect(scripts()).toHaveLength(1);
    expect(scripts()[0].textContent).toContain('2');
  });

  it('removes the script when set to null and tolerates unknown ids', () => {
    service.set('a', { n: 1 });
    service.set('a', null);
    service.remove('missing');
    expect(scripts()).toHaveLength(0);
  });

  it('cannot be broken out of with hostile data or ids', () => {
    service.set('x"] , script[a="', { name: '</script><img src=x onerror=alert(1)>' });
    expect(scripts()).toHaveLength(1);
    expect(doc.head.querySelector('img')).toBeNull();
    expect(scripts()[0].textContent).not.toContain('<');
    service.set('x"] , script[a="', { name: 'again' });
    expect(scripts()).toHaveLength(1);
  });
});
