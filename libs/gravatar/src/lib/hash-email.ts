import { hash } from 'spark-md5';
export function hashEmail(email: string) {
  return hash(email);
}
