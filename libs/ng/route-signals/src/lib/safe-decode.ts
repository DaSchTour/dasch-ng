export function safeDecodeURIComponent(encodedURIComponent: string): string {
  try {
    return decodeURIComponent(encodedURIComponent);
  } catch {
    console.warn(`Failed to decode URI component: ${encodedURIComponent}`);
    return encodedURIComponent;
  }
}
