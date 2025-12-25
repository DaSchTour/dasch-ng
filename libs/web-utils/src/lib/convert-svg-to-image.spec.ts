import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertSvgToImage } from './convert-svg-to-image';

describe('convertSvgToImage()', () => {
  let mockCanvas: {
    width: number;
    height: number;
    getContext: ReturnType<typeof vi.fn>;
    toBlob: ReturnType<typeof vi.fn>;
  };
  let mockContext: CanvasRenderingContext2D;
  let mockImage: HTMLImageElement;

  beforeEach(() => {
    mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toBlob: vi.fn((callback: BlobCallback, type?: string) => {
        const blob = new Blob(['mock-image-data'], { type: type || 'image/png' });
        callback(blob);
      }),
    };

    mockImage = {} as HTMLImageElement;

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'img') {
        setTimeout(() => {
          if (mockImage.onload) {
            Object.assign(mockImage, {
              naturalWidth: 100,
              naturalHeight: 100,
            });
            mockImage.onload({} as Event);
          }
        }, 0);
        return mockImage as unknown as HTMLImageElement;
      }
      return document.createElement(tagName);
    });
  });

  it('should convert SVG to PNG by default', async () => {
    const svgString = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('image/png');
  });

  it('should convert SVG to PNG when format is explicitly specified', async () => {
    const svgString = '<svg width="100" height="100"><rect width="100" height="100" fill="blue" /></svg>';
    const blob = await convertSvgToImage(svgString, 'png');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('image/png');
  });

  it('should convert SVG to JPEG when format is specified', async () => {
    const svgString = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="green" /></svg>';
    const blob = await convertSvgToImage(svgString, 'jpeg');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('image/jpeg');
  });

  it('should create image with base64 encoded SVG', async () => {
    const svgString = '<svg width="100" height="100"></svg>';
    await convertSvgToImage(svgString);

    expect(mockImage.src).toContain('data:image/svg+xml;base64,');
    // UTF-8 safe encoding
    expect(mockImage.src).toContain(btoa(unescape(encodeURIComponent(svgString))));
  });

  it('should set canvas dimensions to match image natural dimensions', async () => {
    const naturalWidth = 200;
    const naturalHeight = 150;

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'img') {
        const img = {} as HTMLImageElement;
        setTimeout(() => {
          if (img.onload) {
            Object.assign(img, { naturalWidth, naturalHeight });
            img.onload({} as Event);
          }
        }, 0);
        return img;
      }
      return document.createElement(tagName);
    });

    const svgString = '<svg width="200" height="150"></svg>';
    await convertSvgToImage(svgString);

    expect(mockCanvas.width).toBe(naturalWidth);
    expect(mockCanvas.height).toBe(naturalHeight);
  });

  it('should draw image onto canvas with correct dimensions', async () => {
    const svgString = '<svg width="100" height="100"></svg>';
    mockImage.naturalWidth = 100;
    mockImage.naturalHeight = 100;

    await convertSvgToImage(svgString);

    expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 100, 100);
  });

  it('should call canvas toBlob with correct MIME type for PNG', async () => {
    const svgString = '<svg width="100" height="100"></svg>';
    await convertSvgToImage(svgString, 'png');

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png');
  });

  it('should call canvas toBlob with correct MIME type for JPEG', async () => {
    const svgString = '<svg width="100" height="100"></svg>';
    await convertSvgToImage(svgString, 'jpeg');

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg');
  });

  it('should handle complex SVG with multiple elements', async () => {
    const svgString = `
      <svg width="200" height="200">
        <rect x="10" y="10" width="100" height="100" fill="red" />
        <circle cx="150" cy="150" r="40" fill="blue" />
        <text x="50" y="50">Test</text>
      </svg>
    `;

    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
  });

  it('should handle SVG with special characters', async () => {
    const svgString = '<svg width="100" height="100"><text>Test & <demo></text></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
  });

  it('should handle SVG with UTF-8 characters', async () => {
    const svgString = '<svg width="100" height="100"><text>Hello 世界 🌍 Здравствуй мир</text></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('image/png');
  });

  it('should handle small SVG', async () => {
    const naturalWidth = 1;
    const naturalHeight = 1;

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'img') {
        const img = {} as HTMLImageElement;
        setTimeout(() => {
          if (img.onload) {
            Object.assign(img, { naturalWidth, naturalHeight });
            img.onload({} as Event);
          }
        }, 0);
        return img;
      }
      return document.createElement(tagName);
    });

    const svgString = '<svg width="1" height="1"></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
    expect(mockCanvas.width).toBe(naturalWidth);
    expect(mockCanvas.height).toBe(naturalHeight);
  });

  it('should handle large SVG', async () => {
    const naturalWidth = 2000;
    const naturalHeight = 2000;

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'img') {
        const img = {} as HTMLImageElement;
        setTimeout(() => {
          if (img.onload) {
            Object.assign(img, { naturalWidth, naturalHeight });
            img.onload({} as Event);
          }
        }, 0);
        return img;
      }
      return document.createElement(tagName);
    });

    const svgString = '<svg width="2000" height="2000"></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
    expect(mockCanvas.width).toBe(naturalWidth);
    expect(mockCanvas.height).toBe(naturalHeight);
  });

  it('should return null when image fails to load', async () => {
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = {} as HTMLImageElement;
        setTimeout(() => {
          if (img.onerror) {
            img.onerror({} as ErrorEvent);
          }
        }, 0);
        return img;
      }
      return document.createElement(tagName);
    });

    const svgString = '<svg width="100" height="100"></svg>';

    await expect(convertSvgToImage(svgString)).rejects.toThrow();
  });

  it('should throw error when canvas context is not available', async () => {
    const failingCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
      toBlob: vi.fn(),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return failingCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'img') {
        setTimeout(() => {
          if (mockImage.onload) {
            Object.assign(mockImage, {
              naturalWidth: 100,
              naturalHeight: 100,
            });
            mockImage.onload({} as Event);
          }
        }, 0);
        return mockImage as unknown as HTMLImageElement;
      }
      return document.createElement(tagName);
    });

    const svgString = '<svg width="100" height="100"></svg>';

    await expect(convertSvgToImage(svgString)).rejects.toThrow('Unable to get 2D canvas context');
  });

  it('should return null when toBlob fails', async () => {
    const failingCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toBlob: vi.fn((callback: BlobCallback) => {
        callback(null);
      }),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return failingCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'img') {
        setTimeout(() => {
          if (mockImage.onload) {
            Object.assign(mockImage, {
              naturalWidth: 100,
              naturalHeight: 100,
            });
            mockImage.onload({} as Event);
          }
        }, 0);
        return mockImage as unknown as HTMLImageElement;
      }
      return document.createElement(tagName);
    });

    const svgString = '<svg width="100" height="100"></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeNull();
  });

  it('should handle empty SVG', async () => {
    const svgString = '<svg></svg>';
    const blob = await convertSvgToImage(svgString);

    expect(blob).toBeInstanceOf(Blob);
  });
});
