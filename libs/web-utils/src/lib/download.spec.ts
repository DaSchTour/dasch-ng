import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { download } from './download';

describe('download()', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    HTMLAnchorElement.prototype.click = vi.fn(function (this: HTMLAnchorElement) {
      this.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should trigger download with string data', async () => {
    const data = 'Hello, World!';
    const filename = 'test.txt';
    const type = 'text/plain';

    await download(data, filename, type);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should create anchor element with correct attributes', async () => {
    const data = 'test data';
    const filename = 'test.txt';

    const downloadPromise = download(data, filename);

    await vi.waitFor(() => {
      const anchor = document.querySelector('a[download]');
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute('href')).toBe('blob:mock-url');
      expect(anchor?.getAttribute('download')).toBe(filename);
    });

    await downloadPromise;
  });

  it('should remove anchor element after download', async () => {
    await download('test', 'test.txt');

    await vi.waitFor(() => {
      const anchor = document.querySelector('a');
      expect(anchor).toBeNull();
    });
  });

  it('should work with Blob data', async () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';

    await download(blob, filename);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should create Blob with specified MIME type for string data', async () => {
    const data = '{"name":"test"}';
    const filename = 'data.json';
    const type = 'application/json';

    await download(data, filename, type);

    expect(createObjectURLSpy).toHaveBeenCalled();
    const blobCall = createObjectURLSpy.mock.calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
    expect(blobCall.type).toBe(type);
  });

  it('should handle different file extensions', async () => {
    const testCases = [
      { filename: 'document.pdf', type: 'application/pdf' },
      { filename: 'image.png', type: 'image/png' },
      { filename: 'data.csv', type: 'text/csv' },
      { filename: 'script.js', type: 'text/javascript' },
    ];

    for (const { filename, type } of testCases) {
      await download('test', filename, type);
    }

    expect(createObjectURLSpy).toHaveBeenCalledTimes(testCases.length);
    expect(revokeObjectURLSpy).toHaveBeenCalledTimes(testCases.length);
  });

  it('should work without MIME type', async () => {
    await download('test', 'test.txt');

    expect(createObjectURLSpy).toHaveBeenCalled();
    const blobCall = createObjectURLSpy.mock.calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
  });

  it('should handle empty string data', async () => {
    await download('', 'empty.txt', 'text/plain');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should handle large text data', async () => {
    const largeData = 'x'.repeat(1000000);
    await download(largeData, 'large.txt', 'text/plain');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should clean up resources after download', async () => {
    await download('test', 'test.txt');

    await vi.waitFor(() => {
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
      expect(document.querySelector('a')).toBeNull();
    });
  });

  it('should reject on error', async () => {
    createObjectURLSpy.mockImplementation(() => {
      throw new Error('Mock error');
    });

    await expect(download('test', 'test.txt')).rejects.toThrow('Mock error');
  });
});
