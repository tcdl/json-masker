const jp = require('jsonpath');

module.exports = function create(opts) {
  const options = Object.assign({}, opts);

  if (options.whitelist && !Array.isArray(options.whitelist)) {
    throw new Error("'whitelist' must be an array");
  }

  if (options.whitelists && !Array.isArray(options.whitelists)) {
    throw new Error("'whitelists' must be an array");
  }

  const whitelists = [];

  if (options.whitelist) {
    whitelists.push(options.whitelist);
  } else if (options.whitelists) {
    Array.prototype.push.apply(whitelists, options.whitelists);
  }

  const mergedWhitelist = new Set();

  whitelists.forEach(whitelist => {
    whitelist.forEach(key => {
      mergedWhitelist.add(key);
    });
  });

  const whitelistedJsonPaths = [];
  const whitelistedKeys = [];
  mergedWhitelist.forEach(item => {
    if (item.startsWith('$')) {
      jp.parse(item); // validate provided json-path
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

    return traverseAndMask(target);

    function traverseAndMask(value, path = '$', key) {
      if (path !== '$') {
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
      if (value.__inClone) { // skip circular references
        return value;
      }

      if (typeof(value) === 'object') {
        const valueNew = Array.isArray(value) ? [] : {};
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            value.__inClone = true;
            valueNew[key] = traverseAndMask(value[key], path + '.' + key, key);
            delete value.__inClone;
          }
        }
        return valueNew;
      }

      return value;
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
