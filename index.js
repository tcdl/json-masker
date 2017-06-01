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

const upperCaseLetters = /[A-Z]/g;
const lowerCaseLetters = /[a-z]/g;
const digits = /\d/g;

const maskString = (value) => {
  return value.replace(upperCaseLetters, 'X').replace(lowerCaseLetters, 'x').replace(digits, '*');
}

const maskNumber = () => 12345;
