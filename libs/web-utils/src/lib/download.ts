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
