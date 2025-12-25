/**
 * Converts a single File or FileList to an array of File objects.
 *
 * This utility function normalizes the output of file inputs, making it easier
 * to work with file data in a consistent way regardless of whether the input
 * accepts single or multiple files.
 *
 * @param files - A single File object or a FileList from an input element
 * @returns An array containing the File object(s)
 *
 * @example
 * ```typescript
 * // Handle file input change event
 * const input = document.querySelector('input[type="file"]') as HTMLInputElement;
 * input.addEventListener('change', (event) => {
 *   const files = createFileArray(input.files!);
 *   files.forEach(file => {
 *     console.log(`File: ${file.name}, Size: ${file.size} bytes`);
 *   });
 * });
 *
 * // Works with both single and multiple file inputs
 * const singleFile = new File(['content'], 'test.txt');
 * const fileArray = createFileArray(singleFile); // [File]
 * ```
 */
export function createFileArray(files: File | FileList): Array<File> {
  if (files instanceof FileList) {
    return Array.from(files);
  } else {
    return [files];
  }
}
