import assertString from './util/assertString.js';

const multibyte = /[^\x00-\x7F]/;

export default function isMultibyte(str) {
  assertString(str);
  return multibyte.test(str);
}
