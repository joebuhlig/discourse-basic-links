import assertString from './util/assertString.js';
import { alpha } from './alpha';

export default function isAlpha(str, locale = 'en-US') {
  assertString(str);
  if (locale in alpha) {
    return alpha[locale].test(str);
  }
  throw new Error(`Invalid locale '${locale}'`);
}
