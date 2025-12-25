import { describe, it, expect } from 'vitest';
import { createFileArray } from './file-array';

function createMockFileList(files: File[]): FileList {
  const fileList = {
    ...files,
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  };
  Object.setPrototypeOf(fileList, FileList.prototype);
  return fileList as FileList;
}

describe('createFileArray()', () => {
  it('should convert a single File to an array with one element', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const result = createFileArray(file);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(file);
  });

  it('should convert an empty FileList to an empty array', () => {
    const fileList = createMockFileList([]);
    const result = createFileArray(fileList);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  it('should convert a FileList with one file to an array with one element', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileList = createMockFileList([file]);

    const result = createFileArray(fileList);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('test.txt');
    expect(result[0].type).toBe('text/plain');
  });

  it('should convert a FileList with multiple files to an array', () => {
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
    const file3 = new File(['content3'], 'test3.pdf', { type: 'application/pdf' });

    const fileList = createMockFileList([file1, file2, file3]);

    const result = createFileArray(fileList);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('test1.txt');
    expect(result[1].name).toBe('test2.jpg');
    expect(result[2].name).toBe('test3.pdf');
  });

  it('should preserve file properties when converting', () => {
    const content = 'test content';
    const file = new File([content], 'test.txt', {
      type: 'text/plain',
      lastModified: 1234567890,
    });

    const result = createFileArray(file);

    expect(result[0].name).toBe('test.txt');
    expect(result[0].type).toBe('text/plain');
    expect(result[0].size).toBe(content.length);
    expect(result[0].lastModified).toBe(1234567890);
  });
});
