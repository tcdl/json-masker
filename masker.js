const jp = require('jsonpath');

module.exports = function create(opts) {
  const options = Object.assign({}, opts);
  // if (options && options.whitelist && Array.isArray(options.whitelist))
  // `    options.whitelist = options.whitelist.map(fieldName => fieldName.toUpperCase());
  if (!options.whitelist) {
    options.whitelist = [];
  }

  const whitelistedJsonPaths = [];
  const whitelistedKeys = [];
  options.whitelist.forEach(item => {
    if (item.startsWith('$')) {
      whitelistedJsonPaths.push(item);
    } else {
      whitelistedKeys.push(item.toUpperCase());
    }
  });

  return function mask(target) {
    if (options.enabled === false) {
      return target;
    }
    const whitelistedPaths = whitelistedJsonPaths.reduce((accum, path) => {
      Array.prototype.push.apply(accum, jp.paths(target, path));
      return accum;
    }, []).map(path => path.join('.'));

    return traverse(target);

    function traverse(value, path = '$') {
      if (path !== '$') {
        const key = path.split('.').pop();
        if (whitelistedKeys.includes(key.toUpperCase())) {
          return value;
        }
        if (whitelistedPaths.includes(path)) {
          return value;
        }
      }
      if (typeof(value) === 'string' || value instanceof String) {
        return maskString(value);
      }
      if (typeof(value) === 'number' || value instanceof Number) {
        return maskNumber(value);
      }
      if (typeof(value) === 'boolean' || value instanceof Boolean) {
        return value;
      }
      if (typeof(value) === 'undefined' || value === null) {
        return value;
      }

      const objNew = (value instanceof Array) ? [] : {};
      for (let key in value) {
        if (value.hasOwnProperty(key)) {
          objNew[key] = traverse(value[key], path + '.' + key);
        }
      }
      return objNew;
    }
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
