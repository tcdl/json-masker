const cloneDeepWith = require('lodash.clonedeepwith');

class Masker {
  constructor(options) {
    this.options = options;
    if (options && options.whitelist && Array.isArray(options.whitelist))
      this.options.whitelist = options.whitelist.map(fieldName => fieldName.toUpperCase());
  }

  mask(target) {
    const whiteListedFields = this.options && this.options.whitelist ? this.options.whitelist : [];
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
  }
}

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

module.exports = Masker;

