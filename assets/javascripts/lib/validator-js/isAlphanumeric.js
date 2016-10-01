import assertString from './util/assertString.js';
import { alphanumeric } from './alpha';

export default function isAlphanumeric(str, locale = 'en-US') {
  assertString(str);
  if (locale in alphanumeric) {
    return alphanumeric[locale].test(str);
  }
  throw new Error(`Invalid locale '${locale}'`);
}
