import assertString from './util/assertString';

import merge from './util/merge';
import isByteLength from './isByteLength';
import isFQDN from './isFQDN';

const default_email_options = {
  allow_display_name: false,
  allow_utf8_local_part: true,
  require_tld: true,
};

/* eslint-disable max-len */
const displayName = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\s]*<(.+)>$/i;
const emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
const quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
const emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
const quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
/* eslint-enable max-len */

export default function isEmail(str, options) {
  assertString(str);
  options = merge(options, default_email_options);

  if (options.allow_display_name) {
    const display_email = str.match(displayName);
    if (display_email) {
      str = display_email[1];
    }
  }

  const parts = str.split('@');
  const domain = parts.pop();
  let user = parts.join('@');

  const lower_domain = domain.toLowerCase();
  if (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com') {
    user = user.replace(/\./g, '').toLowerCase();
  }

  if (!isByteLength(user, { max: 64 }) ||
            !isByteLength(domain, { max: 256 })) {
    return false;
  }

  if (!isFQDN(domain, { require_tld: options.require_tld })) {
    return false;
  }

  if (user[0] === '"') {
    user = user.slice(1, user.length - 1);
    return options.allow_utf8_local_part ?
            quotedEmailUserUtf8.test(user) :
            quotedEmailUser.test(user);
  }

  const pattern = options.allow_utf8_local_part ?
        emailUserUtf8Part : emailUserPart;

  const user_parts = user.split('.');
  for (let i = 0; i < user_parts.length; i++) {
    if (!pattern.test(user_parts[i])) {
      return false;
    }
  }

  return true;
}
