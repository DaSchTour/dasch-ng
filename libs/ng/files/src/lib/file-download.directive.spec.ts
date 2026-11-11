import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FileDownloadDirective } from './file-download.directive';

/** Records anchor downloads instead of letting jsdom try to navigate. */
const saved: string[] = [];
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    saved.push(this.download);
    this.dispatchEvent(new Event('click'));
  });
});

@Component({
  imports: [FileDownloadDirective],
  template: `<a href="/api/report.pdf" fileDownload (fileDownloaded)="saved.push($event)" (fileDownloadError)="errors.push($event)">Report</a>`,
})
class HostComponent {
  saved: string[] = [];
  errors: unknown[] = [];
}

describe('FileDownloadDirective', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    saved.length = 0;
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    return { fixture, anchor };
  }

  it('prevents navigation and downloads the href through the service', async () => {
    const { fixture, anchor } = setup();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    fixture.detectChanges();
    expect(anchor.getAttribute('aria-busy')).toBe('true');

    http.expectOne('/api/report.pdf').flush(new Blob(['x']), { headers: { 'Content-Disposition': 'attachment; filename=r.pdf' } });
    await vi.waitFor(() => expect(fixture.componentInstance.saved).toEqual(['r.pdf']));
    fixture.detectChanges();
    expect(anchor.hasAttribute('aria-busy')).toBe(false);
  });

  it('ignores clicks while a download runs', () => {
    const { anchor } = setup();
    anchor.click();
    anchor.click();
    http.expectOne('/api/report.pdf');
  });

  it('emits errors and allows a retry', () => {
    const { fixture, anchor } = setup();
    anchor.click();
    http.expectOne('/api/report.pdf').flush(new Blob(['x']), { status: 500, statusText: 'Server Error' });
    expect(fixture.componentInstance.errors).toHaveLength(1);
    anchor.click();
    http.expectOne('/api/report.pdf');
  });

  it('leaves clicks on cross-origin links to the browser', () => {
    const { anchor } = setup();
    anchor.setAttribute('href', 'https://evil.example/a.pdf');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    http.expectNone('https://evil.example/a.pdf');
  });
});
