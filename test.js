const mask = require('./index');
const {assert} = require('chai');

describe('json-mask', () => {
  it('should mask letters in a string with X characters', () => {
    assert.deepEqual(mask({name: 'John Doe'}), {name: 'Xxxx Xxx'});
  });
  
  it('should mask digits in a string with * characters', () => {
    assert.deepEqual(mask({phone: '+1-313-85-93-62'}), {phone: '+*-***-**-**-**'});
  });
  
  it('should mask numbers with 12345', () => {
    assert.deepEqual(mask({age: 64}), {age: 12345});
  });
});
