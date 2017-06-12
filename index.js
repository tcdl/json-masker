const _ = require('lodash');

module.exports = (target) => {
  return _.cloneDeepWith(target, (value, key) => {
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

const maskNumber = (value) => maskString(value.toString());
