import assertString from './util/assertString.js';

const decimal = /^[-+]?([0-9]+|\.[0-9]+|[0-9]+\.[0-9]+)$/;

export default function isDecimal(str) {
  assertString(str);
  return str !== '' && decimal.test(str);
}
