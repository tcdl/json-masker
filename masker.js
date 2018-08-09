const jp = require('jsonpath');

module.exports = function create(opts) {
  const options = Object.assign({}, opts);

  const whitelist = prepareWhitelist(options);
  const [whitelistedJsonPaths, whitelistedKeys] = segregateJsonPathWhitelist(whitelist);

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
          if (Object.prototype.hasOwnProperty.call(value, key)) {
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

function prepareWhitelist(options) {
  const whitelists = [];

  if (options.whitelist) {
    whitelists.push(options.whitelist);
  } else if (options.whitelists) {
    if (!Array.isArray(options.whitelists)) {
      throw new Error("'whitelists' option must be an array");
    }
    Array.prototype.push.apply(whitelists, options.whitelists);
  }

  const mergedWhitelist = new Set();

  whitelists
    .filter(whitelist => typeof(whitelist) !== 'undefined' && whitelist !== null)
    .map(parseWhitelist)
    .forEach(whitelist => {
      whitelist.forEach(key => {
        mergedWhitelist.add(key);
      });
    });

  return mergedWhitelist;
}

function parseWhitelist(whitelist) {
  if (typeof(whitelist) === 'string') {
    return whitelist.split(/\s*,\s*/);
  }
  if (Array.isArray(whitelist)) {
    return whitelist;
  }
  throw new Error('whitelist must be either an array or a string');
}

function segregateJsonPathWhitelist(whitelist) {
  const whitelistedJsonPaths = [];
  const whitelistedKeys = [];
  whitelist.forEach(it => {
    if (it.startsWith('$')) {
      jp.parse(it); // validate provided json-path
      whitelistedJsonPaths.push(it);
    } else {
      whitelistedKeys.push(it.toUpperCase());
    }
  });
  return [whitelistedJsonPaths, whitelistedKeys];
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
