import * as SparkMD5 from 'spark-md5';
export function hashEmail(email: string) {
  return SparkMD5.hash(email);
}
