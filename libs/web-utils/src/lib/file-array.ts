/**
 * function to convert a single File or FileList to an Array of files
 * This is used to convert the output of file input to a more usable format
 *
 * @param files
 * @returns
 */
export function createFileArray(files: File | FileList): Array<File> {
  if (files instanceof FileList) {
    return Array.from(files);
  } else {
    return [files];
  }
}
