const cloneDeepWith = require('lodash.clonedeepwith');

class Masker {
  constructor(options) {
    this.options = options;
    if (options && options.whitelist && Array.isArray(options.whitelist))
      this.options.whitelist = options.whitelist.map(fieldName => fieldName.toUpperCase());
  }

  /**
   * Tries to get whitelisted field names from options first. If they are absent in options, when reads the
   * env variable named JSON_MASKER_WHITELIST
   * @returns {Array}
   * @private
   */
  _getWhitelistedFields() {
    return this.options && this.options.whitelist
      ? this.options.whitelist
      : process.env.JSON_MASKER_WHITELIST
        ? process.env.JSON_MASKER_WHITELIST.toUpperCase().split(',')
        : [];
  }

  mask(target) {
    const whiteListedFields = this._getWhitelistedFields();
    return cloneDeepWith(target, (value, key) => {
      if (key && whiteListedFields.includes(key.toUpperCase()))
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

