/**
 * Triggers a browser download for the given data.
 *
 * This function creates a temporary anchor element with a Blob URL, programmatically
 * clicks it to trigger the download, and automatically cleans up the object URL
 * and DOM element after the download starts.
 *
 * @param data - The data to download, either as a string or Blob
 * @param filename - The name of the file to be downloaded
 * @param type - Optional MIME type for the Blob (e.g., 'text/plain', 'application/json')
 * @returns A Promise that resolves when the download has been triggered
 *
 * @example
 * ```typescript
 * // Download a text file
 * await download('Hello, World!', 'greeting.txt', 'text/plain');
 *
 * // Download JSON data
 * const data = { name: 'John', age: 30 };
 * await download(JSON.stringify(data, null, 2), 'data.json', 'application/json');
 *
 * // Download a Blob (e.g., an image)
 * const blob = await convertSvgToImage(svgString);
 * if (blob) {
 *   await download(blob, 'image.png', 'image/png');
 * }
 * ```
 */
export async function download(data: string | Blob, filename: string, type?: string) {
  return new Promise((resolve, reject) => {
    try {
      const file = new Blob([data], { type });
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);

      a.href = url;
      a.download = filename;
      document.body.append(a);

      // Click handler that releases the object URL after the element has been clicked
      // This is required for one-off downloads of the blob content
      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.removeEventListener('click', clickHandler);
          a.remove();
          resolve(void 0);
        }, 0);
      };

      // Add the click event listener on the anchor element
      // Comment out this line if you don't want a one-off download of the blob content
      a.addEventListener('click', clickHandler, false);

      // Programmatically trigger a click on the anchor element
      // Useful if you want the download to happen automatically
      // Without attaching the anchor element to the DOM
      // Comment out this line if you don't want an automatic download of the blob content
      a.click();
    } catch (error) {
      reject(error);
    }
  });
}
