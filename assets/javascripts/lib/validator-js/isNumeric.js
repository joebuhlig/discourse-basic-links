import assertString from './util/assertString.js';

const numeric = /^[-+]?[0-9]+$/;

export default function isNumeric(str) {
  assertString(str);
  return numeric.test(str);
}
