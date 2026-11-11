import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FileDownloadService, UnexpectedHtmlResponseError } from './file-download.service';

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

describe('FileDownloadService', () => {
  let service: FileDownloadService;
  let http: HttpTestingController;

  beforeEach(() => {
    saved.length = 0;
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FileDownloadService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function run(url: string, headers: Record<string, string>, body: Blob, filename?: string) {
    const next = vi.fn();
    const error = vi.fn();
    service.download(url, filename).subscribe({ next, error });
    http.expectOne(url).flush(body, { headers });
    return { next, error };
  }

  it('saves the blob under the name from Content-Disposition', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' });
    const { next } = run('/api/report', { 'Content-Disposition': 'attachment; filename="Q1 report.pdf"' }, blob);
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith('Q1 report.pdf'));
    expect(saved).toEqual(['Q1 report.pdf']);
  });

  it('strips path segments from the Content-Disposition name', async () => {
    const { next } = run('/x', { 'Content-Disposition': 'attachment; filename="../../etc/passwd"' }, new Blob(['a']));
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith('passwd'));
  });

  it('falls back to the last URL segment without query and decodes it', async () => {
    const { next } = run('/files/my%20file.txt?token=1#x', {}, new Blob(['a'], { type: 'text/plain' }));
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith('my file.txt'));
  });

  it('uses "download" when the URL has no usable segment', async () => {
    const { next } = run('/', {}, new Blob(['a'], { type: 'text/plain' }));
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith('download'));
  });

  it('prefers an explicit file name', async () => {
    const { next } = run('/a/b.bin', { 'Content-Disposition': 'attachment; filename="c.bin"' }, new Blob(['a']), 'mine.bin');
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith('mine.bin'));
  });

  it('emits an error for an HTML response and saves nothing', () => {
    const { next, error } = run('/api/report', {}, new Blob(['<html></html>'], { type: 'text/html; charset=utf-8' }));
    expect(error).toHaveBeenCalledWith(expect.any(UnexpectedHtmlResponseError));
    expect(next).not.toHaveBeenCalled();
    expect(saved).toEqual([]);
  });

  it('saves HTML when the server marks it as attachment', async () => {
    const { next } = run('/page', { 'Content-Disposition': 'attachment; filename=page.html' }, new Blob(['<html></html>'], { type: 'text/html' }));
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith('page.html'));
  });

  it('emits HTTP errors and saves nothing', () => {
    const error = vi.fn();
    service.download('/missing').subscribe({ error });
    http.expectOne('/missing').flush(new Blob(['nope']), { status: 404, statusText: 'Not Found' });
    expect(error).toHaveBeenCalled();
    expect(saved).toEqual([]);
  });
});
