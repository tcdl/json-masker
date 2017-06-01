const mask = require('./index');
const {assert} = require('chai');

describe('json-mask', () => {
  it('should mask strings with X characters', () => {
    assert.deepEqual(mask({name: 'John Doe'}), {name: 'Xxxx Xxx'});
  });
});
