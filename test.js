const mask = require('./index');
const {assert} = require('chai');

describe('json-mask', () => {
  it('should mask base latin chars in a string with X and x', () => {
    assert.deepEqual(mask({prop: 'Qwerty'}), {prop: 'Xxxxxx'});
  });

  it('should mask all chars that are not base latin with x', () => {
    assert.deepEqual(mask({prop: 'Ĕőєחβ'}), {prop: 'xxxxx'});
  });
  
  it('should mask digits in a string with *', () => {
    assert.deepEqual(mask({prop: '8301'}), {prop: '****'});
  });

  it('should not mask punctuation and common signs in a string', () => {
    const target = {prop: '-+.,!?@%$[]()'};
    assert.deepEqual(mask(target), target);
  });
  
  it('should mask number with a string of *', () => {
    assert.deepEqual(mask({prop: 201}), {prop: '***'});
  });

  it('should deeply mask fields in an object', () => {
    const target = {
      customer: {
        name: 'John Doe',
        age: 62,
        phone: '+1-313-85-93-62',
        additional: {
          pan: '3874-2185-4791-9148',
          salary: '$100',
          favoriteMusic: ['Classic', 'Jazz']
        }
      }
    };
    assert.deepEqual(mask(target), {
      customer: {
        name: 'Xxxx Xxx',
        age: '**',
        phone: '+*-***-**-**-**',
        additional: {
          pan: '****-****-****-****',
          salary: '$***',
          favoriteMusic: ['Xxxxxxx', 'Xxxx']
        }
      }
    });
  });
});
