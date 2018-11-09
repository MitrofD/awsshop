// @flow
const defLength = 5;
const chars = 'abcdefghijklmnopqrstuvwxyz';
const upperChars = chars.toUpperCase();
const lowerChars = chars;
const numbers = '0123456789';
const symbols = '!@#$%^&*()<>?/[]{},.:;';

const all = upperChars + lowerChars + numbers + symbols;

const alphabet = Object.freeze({
  all,
  lowerChars,
  numbers,
  upperChars,
});

const random = (possibleChars: string, length: number = defLength): string => {
  const possibleCharsLength = possibleChars.length;
  let ret = '';

  for (let i = 0; i < length; i += 1) {
    const randIdx = Math.floor(Math.random() * possibleCharsLength);
    ret += possibleChars.charAt(randIdx);
  }

  return ret;
};

module.exports = {
  random,
  alphabet,
};
