const cloneDeepWith = require('lodash.clonedeepwith');

module.exports = (target) => {
  const whiteListedFields = process.env.JSON_MASKER_WHITELIST ? process.env.JSON_MASKER_WHITELIST.toUpperCase().split(','): [];
  return cloneDeepWith(target, (value, key) => {
    if (key && whiteListedFields.includes(key.toUpperCase()))
      return value;
    if (typeof(value) === 'string' || value instanceof String) {
      return maskString(value);
    }
    if (typeof(value) === 'number' || value instanceof Number) {
      return maskNumber(value);
    }
  });
};

const digit = /\d/g;
const upperCaseLatin1 = /[A-Z]/g;
const notPunctuation = /[^X\s!-/:-@[-`{-~]/g;

const maskString = (value) => value.replace(digit, '*').replace(upperCaseLatin1, 'X').replace(notPunctuation, 'x');

const maskNumber = (value) => {
  if (Number.isNaN(value) || !Number.isFinite(value.valueOf())) {
    return value;
  }
  return value.toString().replace(digit, '*');
};
