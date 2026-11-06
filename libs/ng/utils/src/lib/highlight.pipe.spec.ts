import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  const pipe = new HighlightPipe();

  it('returns the whole text unmatched for an empty term', () => {
    expect(pipe.transform('Stadium', '')).toEqual([{ text: 'Stadium', match: false }]);
  });

  it('returns no segments for empty text', () => {
    expect(pipe.transform('', 'a')).toEqual([]);
    expect(pipe.transform(null, 'a')).toEqual([]);
  });

  it('matches case-insensitively and keeps the original casing', () => {
    expect(pipe.transform('Stadium light', 'STAD')).toEqual([
      { text: 'Stad', match: true },
      { text: 'ium light', match: false },
    ]);
  });

  it('marks every occurrence', () => {
    expect(pipe.transform('banana', 'an').filter((s) => s.match)).toHaveLength(2);
  });

  it('treats regex characters in the term literally', () => {
    expect(pipe.transform('a.b.c', '.')).toEqual([
      { text: 'a', match: false },
      { text: '.', match: true },
      { text: 'b', match: false },
      { text: '.', match: true },
      { text: 'c', match: false },
    ]);
    expect(pipe.transform('price (net)', '(net')).toEqual([
      { text: 'price ', match: false },
      { text: '(net', match: true },
      { text: ')', match: false },
    ]);
  });

  it('renders markup in the text as text, not HTML', () => {
    @Component({
      imports: [HighlightPipe],
      template: `@for (part of label() | highlight: 'foo'; track $index) {
        @if (part.match) {
          <mark>{{ part.text }}</mark>
        } @else {
          {{ part.text }}
        }
      }`,
    })
    class HostComponent {
      readonly label = signal('<b>x</b> &amp; foo');
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('b')).toBeNull();
    expect(el.querySelector('mark')?.textContent).toBe('foo');
    expect(el.textContent).toContain('<b>x</b> &amp; ');
  });
});
