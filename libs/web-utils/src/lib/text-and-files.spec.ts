import { describe, expect, it } from 'vitest';
import { parseContentDisposition } from './content-disposition';
import { fileTypeOf } from './file-type';
import { redactUrl, SECRET_URL_PARAMS } from './redact-url';
import { toSlug } from './slug';

describe('parseContentDisposition()', () => {
  it('reads type and plain or quoted file names', () => {
    expect(parseContentDisposition('attachment; filename=report.pdf')).toEqual({
      type: 'attachment',
      filename: 'report.pdf',
      parameters: { filename: 'report.pdf' },
    });
    expect(parseContentDisposition('Attachment; FILENAME="annual report; 2026.pdf"')?.filename).toBe('annual report; 2026.pdf');
    expect(parseContentDisposition('attachment; filename="say \\"hi\\".txt"')?.filename).toBe('say "hi".txt');
  });

  it('prefers filename* and decodes it', () => {
    const header = `attachment; filename="EUR rates.pdf"; filename*=UTF-8''%E2%82%AC%20rates.pdf`;
    expect(parseContentDisposition(header)?.filename).toBe('€ rates.pdf');
    expect(parseContentDisposition(`attachment; filename*=iso-8859-1'de'Gr%FC%DFe.txt`)?.filename).toBe('Grüße.txt');
  });

  it('keeps a malformed filename* as is and handles headers without a file name', () => {
    expect(parseContentDisposition(`attachment; filename*=%E2%82%AC.pdf`)?.filename).toBe('%E2%82%AC.pdf');
    expect(parseContentDisposition('inline')).toEqual({ type: 'inline', parameters: {} });
    expect(parseContentDisposition('')).toBeNull();
    expect(parseContentDisposition(null)).toBeNull();
  });
});

describe('toSlug()', () => {
  it('writes out umlauts and strips other accents', () => {
    expect(toSlug('Grüne Wälder über Köln, Straße')).toBe('gruene-waelder-ueber-koeln-strasse');
    expect(toSlug('ÜBER ÖL ÄRGER STRAẞE')).toBe('ueber-oel-aerger-strasse');
    expect(toSlug('Café au Łódź, Ångström, Øresund')).toBe('cafe-au-lodz-angstroem-oresund');
    expect(toSlug('Grün Straße', { expandUmlauts: false })).toBe('grun-strasse');
  });

  it('collapses separators and trims them', () => {
    expect(toSlug('  Summer --- 1959 / "Open Air" Concert!  ')).toBe('summer-1959-open-air-concert');
  });

  it('gives the same slug for NFC and NFD spellings', () => {
    const name = 'Grüne Wälder';
    expect(toSlug(name.normalize('NFD'))).toBe(toSlug(name.normalize('NFC')));
  });

  it('cuts at a word boundary and hard-cuts a single long word', () => {
    expect(toSlug(`${'a'.repeat(70)} boundary tail`)).toBe(`${'a'.repeat(70)}-boundary`);
    expect(toSlug('word '.repeat(40)).endsWith('-')).toBe(false);
    expect(toSlug('b'.repeat(200))).toBe('b'.repeat(80));
    expect(toSlug('one two three', { maxLength: 9 })).toBe('one-two');
  });

  it('uses the fallback when nothing is left', () => {
    expect(toSlug('東京', { fallback: 'Item 42' })).toBe('item-42');
    expect(toSlug(null, { fallback: 'a/b?c#d' })).toBe('a-b-c-d');
    expect(toSlug('東京')).toBe('');
  });
});

describe('redactUrl()', () => {
  it('removes secret params and the fragment', () => {
    expect(redactUrl('https://example.com/cb?code=abc&state=xyz&lang=de#access_token=t')).toBe('https://example.com/cb?lang=de');
  });

  it('accepts custom params and can keep the fragment', () => {
    expect(redactUrl('https://example.com/?email=a@b.c&page=2#top', { params: ['email'], keepHash: true })).toBe('https://example.com/?page=2#top');
    expect(redactUrl('https://example.com/?email=x&code=y', { params: [...SECRET_URL_PARAMS, 'email'] })).toBe('https://example.com/');
  });

  it('leaves non-URLs and relative URLs unchanged', () => {
    expect(redactUrl('/cb?code=abc')).toBe('/cb?code=abc');
    expect(redactUrl('Order 42')).toBe('Order 42');
    expect(redactUrl('https://')).toBe('https://');
  });
});

describe('fileTypeOf()', () => {
  it.each([
    ['Interview_Take3.MOV', 'video'],
    ['clip.mxf', 'video'],
    ['photo.JPEG', 'image'],
    ['logo.svg', 'image'],
    ['track.flac', 'audio'],
    ['contract.pdf', 'document'],
    ['budget.xlsx', 'spreadsheet'],
    ['export.csv', 'spreadsheet'],
    ['backup.tar', 'archive'],
  ])('%s → %s', (name, type) => {
    expect(fileTypeOf(name)).toBe(type);
  });

  it('accepts File-like objects and returns null for unknown names', () => {
    expect(fileTypeOf({ name: 'a.webm' })).toBe('video');
    expect(fileTypeOf('mov')).toBeNull();
    expect(fileTypeOf('notes')).toBeNull();
    expect(fileTypeOf('archive.zip.part')).toBeNull();
    expect(fileTypeOf(null)).toBeNull();
  });
});
