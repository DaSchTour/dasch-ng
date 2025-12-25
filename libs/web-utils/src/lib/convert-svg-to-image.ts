/**
 * Converts an SVG string to a raster image (PNG or JPEG) using HTML5 Canvas.
 *
 * This function creates an image element from the SVG data URL, draws it onto a canvas,
 * and then converts the canvas to a Blob in the specified format.
 *
 * @param svgString - The SVG markup as a string
 * @param format - The output image format, either 'png' or 'jpeg'. Defaults to 'png'
 * @returns A Promise that resolves to a Blob containing the raster image data, or null if conversion fails
 *
 * @example
 * ```typescript
 * const svgString = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
 * const blob = await convertSvgToImage(svgString, 'png');
 * if (blob) {
 *   const url = URL.createObjectURL(blob);
 *   // Use the URL for download or display
 * }
 * ```
 */
export async function convertSvgToImage(svgString: string, format: 'png' | 'jpeg' = 'png'): Promise<Blob | null> {
  const base64SVG = `data:image/svg+xml;base64,${btoa(svgString)}`;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const $img = document.createElement('img');
    $img.src = base64SVG;
    $img.onload = () => resolve($img);
    $img.onerror = reject;
  });

  const $canvas = document.createElement('canvas');
  $canvas.width = img.naturalWidth;
  $canvas.height = img.naturalHeight;
  $canvas.getContext('2d')?.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

  return new Promise<Blob | null>((resolve) => $canvas.toBlob((img) => resolve(img), `image/${format}`));
}
