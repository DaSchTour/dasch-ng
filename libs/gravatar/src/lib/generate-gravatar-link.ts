import { hashEmail } from './hash-email';

export function generateGravatarLink(email: string, size: number, fallback: string): string {
  const ratio = globalThis.devicePixelRatio ?? 1;
  return `//www.gravatar.com/avatar/${hashEmail(email)}?s=${size * ratio}&d=${fallback}`;
}
