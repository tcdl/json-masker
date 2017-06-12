const mask = require('./index');
const {assert} = require('chai');

describe('json-mask', () => {
  it('should mask base latin chars in a string with X and x', () => {
    assert.deepEqual(mask({a: 'Qwerty'}), {a: 'Xxxxxx'});
  });

  it('should mask all chars that are not base latin with x', () => {
    assert.deepEqual(mask({a: 'Ĕőєחβ'}), {a: 'xxxxx'});
  });
  
  it('should mask digits in a string with *', () => {
    assert.deepEqual(mask({a: '8301'}), {a: '****'});
  });

  it('should not mask punctuation and common signs in a string', () => {
    assert.deepEqual(mask({a: '-+.,!?@%$[]()'}), {a: '-+.,!?@%$[]()'});
  });

  it('should mask a complex string', () => {
    assert.deepEqual(mask({a: 'Phone: +1-313-85-93-62, Salary: $100, Name: Κοτζιά;'}), {a: 'Xxxxx: +*-***-**-**-**, Xxxxxx: $***, Xxxx: xxxxxx;'});
  });
  
  it('should mask a integer number with a string of *', () => {
    assert.deepEqual(mask({a: 201}), {a: '***'});
  });

  it('should mask a floating point number with a string of *', () => {
    assert.deepEqual(mask({a: 12.75}), {a: '**.**'});
  });

  it('should not mask a boolean', () => {
    assert.deepEqual(mask({a: true, b: false}), {a: true, b: false});
  });  

  it('should not mask null and undefined', () => {
    assert.deepEqual(mask({a: null, b: undefined}), {a: null, b: undefined});
  });  

  it('should mask properties deeply', () => {
    assert.deepEqual(mask({foo: {bar: {a: 123, b: '!?%'}}, c: ['sensitive']}), {foo: {bar: {a: '***', b: '!?%'}}, c: ['xxxxxxxxx']});
  });
});
