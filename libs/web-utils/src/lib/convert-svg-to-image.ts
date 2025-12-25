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
