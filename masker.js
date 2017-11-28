const cloneDeepWith = require('lodash.clonedeepwith');

module.exports = function create(opts) {
  const options = cloneDeepWith(opts) || {};
  if (options && options.whitelist && Array.isArray(options.whitelist))
    options.whitelist = options.whitelist.map(fieldName => fieldName.toUpperCase());

  return function mask(target) {
    if (options.enabled === false) {
      return target;
    }
    const whiteListedFields = options.whitelist ? options.whitelist : [];
    return cloneDeepWith(target, (value, key) => {
      if (typeof(key) === 'string' && whiteListedFields.includes(key.toUpperCase()))
        return value;
      if (typeof(value) === 'string' || value instanceof String) {
        return maskString(value);
      }
      if (typeof(value) === 'number' || value instanceof Number) {
        return maskNumber(value);
      }
    })
  };
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
