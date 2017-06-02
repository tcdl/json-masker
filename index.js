const _ = require('lodash');

module.exports = (target, whitelist) => {
  return _.cloneDeepWith(target, (value, key) => {
    if (whitelist && whitelist.includes(key)) {
      return;
    }
    if (typeof(value) === 'string' || value instanceof String) {
      return maskString(value);
    }
    if (typeof(value) === 'number' || value instanceof Number) {
      return maskNumber(value);
    }
  });
};

const digit = /\d/g;
const upperCaseBaseLatin = /[A-Z]/g;
const notPunctuation = /[^X\s!-/:-@[-`{-~]/g;

const maskString = (value) => value.replace(digit, '*').replace(upperCaseBaseLatin, 'X').replace(notPunctuation, 'x');

const maskNumber = (value) => Array(Math.ceil(Math.log10(Math.abs(value))) + 1).join('*');
