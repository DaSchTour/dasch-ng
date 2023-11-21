export function hexValidator(value: string, length = 6): boolean {
  const regex = new RegExp(`^#?[0-9A-Fa-f]{${length}}`);
  return regex.test(value);
}
