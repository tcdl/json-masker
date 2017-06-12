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
  
  it('should mask integer numbers with *', () => {
    assert.deepEqual(mask({a: 201}), {a: '***'});
    assert.deepEqual(mask({a: -12345}), {a: '-*****'});
    assert.deepEqual(mask({a: 0}), {a: '*'});
  });

  it('should mask real numbers with *', () => {
    assert.deepEqual(mask({a: 0.004}), {a: '*.***'});
    assert.deepEqual(mask({a: 12.75}), {a: '**.**'});
    assert.deepEqual(mask({a: 9.00000000081}), {a: '*.***********'});
    assert.deepEqual(mask({a: -73917092743.8}), {a: '-***********.*'});
  });

  it('should mask boundary number values with *', () => {
    assert.deepEqual(mask({a: Number.MAX_SAFE_INTEGER}), {a: '****************'});
    assert.deepEqual(mask({a: Number.MIN_SAFE_INTEGER}), {a: '-****************'});
    assert.deepEqual(mask({a: 1e+120}), {a: '*e+***'});
    assert.deepEqual(mask({a: 1e-150}), {a: '*e-***'});
    assert.deepEqual(mask({a: Number.MAX_VALUE}), {a: '*.****************e+***'});
    assert.deepEqual(mask({a: Number.MIN_VALUE}), {a: '*e-***'});
  });
  
  it('should not mask unrepresentable numbers', () => {
    assert.deepEqual(mask({a: NaN}), {a: NaN});
    assert.deepEqual(mask({a: Infinity}), {a: Infinity});
    assert.deepEqual(mask({a: -Infinity}), {a: -Infinity});
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
