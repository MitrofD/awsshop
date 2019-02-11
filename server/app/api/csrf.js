// @flow
const crypto = require('crypto');
const { random, alphabet } = require('./random');

const { CSRF_SALT } = process.env;
const cookieName = 'csrf-token';

let rSalt = typeof CSRF_SALT === 'string' ? CSRF_SALT.trim() : '';
const separator = ':';

if (rSalt.length === 0) {
  rSalt = random(alphabet.all, 5);
}

const genWithSecret = (secret: string): string => {
  const saltWithSep = rSalt + separator;
  const hash = crypto.createHash('sha1').update(saltWithSep + secret).digest('hex');
  return hash;
};

const tokenKey = 'csrfToken';
const secretKey = 'csrfSecret';

const csrf = Object.freeze({
  cookieName,
  tokenKey,
  secretKey,

  secret() {
    return random(alphabet.all, 7);
  },

  generate: genWithSecret,

  forRequest(req: Object, force?: boolean) {
    if (!req.session) {
      const secret = csrf.secret();
      return genWithSecret(secret);
    }

    let secret = req.session.get(secretKey);

    if (force || !secret) {
      secret = csrf.secret();
    }

    req.session.set(secretKey, secret);
    return genWithSecret(secret);
  },

  compare: (secret: string, token: string) => {
    return genWithSecret(secret) === token;
  },
});

module.exports = csrf;
