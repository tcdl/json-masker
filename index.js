const _ = require('lodash');

module.exports = function jsonMask(target) {
  return _.cloneDeepWith(target, (value) => {
    if (typeof(value) === 'string' || value instanceof String) {
      return maskString(value);
    }
  });
};

const upperCaseLetters = /[A-Z]/g;
const lowerCaseLetters = /[a-z]/g;

const maskString = (value) => {
  return value.replace(upperCaseLetters, 'X').replace(lowerCaseLetters, 'x');
}
