const _ = require('lodash');

module.exports = (target) => {
  return _.cloneDeepWith(target, (value) => {
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
