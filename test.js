const masker = require('./masker');
const {assert} = require('chai');

const mask = masker();

describe('json-masker', () => {
  describe('strings', () => {
    it('should mask latin-1 letters with X and x', () => {
      assert.deepEqual(mask({a: 'Qwerty'}), {a: 'Xxxxxx'});
      assert.deepEqual(mask({a: new String('Azerty')}), {a: 'Xxxxxx'});
    });

    it('should mask digits with *', () => {
      assert.deepEqual(mask({a: '8301975624'}), {a: '**********'});
    });

    it('should not mask punctuation and common signs', () => {
      assert.deepEqual(mask({a: '-+.,!?@%$[]()'}), {a: '-+.,!?@%$[]()'});
    });

    it('should mask chars that are not latin-1, digits or punctuation with x', () => {
      assert.deepEqual(mask({a: 'Ĕőєחβ'}), {a: 'xxxxx'});
      assert.deepEqual(mask({a: '♛☼√'}), {a: 'xxx'});
    });

    it('should mask complex string', () => {
      assert.deepEqual(mask({a: 'Phone: +1-313-85-93-62, Salary: $100, Name: Κοτζιά, Photo: ☺'}),
        {a: 'Xxxxx: +*-***-**-**-**, Xxxxxx: $***, Xxxx: xxxxxx, Xxxxx: x'});
    });
  });

  describe('numbers', () => {
    it('should mask integer numbers with *', () => {
      assert.deepEqual(mask({a: 201}), {a: '***'});
      assert.deepEqual(mask({a: -12345}), {a: '-*****'});
      assert.deepEqual(mask({a: 0}), {a: '*'});
      assert.deepEqual(mask({a: new Number(99)}), {a: '**'});
    });

    it('should mask real numbers with *', () => {
      assert.deepEqual(mask({a: 12.75}), {a: '**.**'});
      assert.deepEqual(mask({a: 9.00000000081}), {a: '*.***********'});
      assert.deepEqual(mask({a: -73917092743.8}), {a: '-***********.*'});
      assert.deepEqual(mask({a: new Number(0.004)}), {a: '*.***'});
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
  });

  it('should not mask booleans', () => {
    assert.deepEqual(mask({a: true, b: false}), {a: true, b: false});
  });

  it('should not mask null and undefined', () => {
    assert.deepEqual(mask({a: null, b: undefined}), {a: null, b: undefined});
  });

  it('should mask properties deeply', () => {
    assert.deepEqual(mask({foo: {bar: {a: 123, b: '!?%'}}, c: ['sensitive']}), {
      foo: {bar: {a: '***', b: '!?%'}},
      c: ['xxxxxxxxx']
    });
  });

  it('should mask arrays', () => {
    assert.deepEqual(mask({arr: [{a: 123}, 'abc']}), {arr: [{a: '***'}, 'xxx']});
  });

  it('should properly handle empty object and null as an input', () => {
    assert.deepEqual(mask({}), {});
    assert.deepEqual(mask(null), null);
    assert.deepEqual(mask(undefined), undefined);
  });

  describe('whitelisting', () => {

    it('should whitelist fields by json-path', () => {
      const inJson = {
        name: 'salary list',
        users: [
          {name: 'Jorn', salary: 100},
          {name: 'Laszlo', salary: 150}
        ]
      };
      const expectedJson = {
        name: 'salary list',
        users: [
          {name: 'Xxxx', salary: 100},
          {name: 'Xxxxxx', salary: 150}
        ]
      };
      const mask = masker({whitelist: ['$.users[*].salary', '$.name']});
      assert.deepEqual(mask(inJson), expectedJson);
    });

    it('should whitelist fields by names', () => {
      const inJson = {
        myField: 'Hi',
        a: '8301975624',
        nestedObj: {
          b: 'Qwerty',
          field2: 123
        }
      };
      const expectedOutJson = {
        myField: 'Hi',
        a: '**********',
        nestedObj: {
          b: 'Xxxxxx',
          field2: 123
        }
      };

      const mask = masker({whitelist: ['myField', 'FIELD2', 'nonExistingField']});
      assert.deepEqual(mask(inJson), expectedOutJson);
    });

    it('should whitelist fields by names and by json-path', () => {
      const inJson = {
        method: 'POST',
        headers: {
          'Authorization': 'Basic eDp4Cg==',
          'Content-Type': 'text/html'
        }
      };
      const expectedJson = {
        method: 'POST',
        headers: {
          'Authorization': 'Xxxxx xXx*Xx==',
          'Content-Type': 'text/html'
        }
      };
      const mask = masker({whitelist: ['method', "$.headers['Content-Type']"]});
      assert.deepEqual(mask(inJson), expectedJson);
    });

    it('should support whitelists represented as string', () => {
      const inJson = {
        myField: 'Hi',
        a: '8301975624',
        nestedObj: {
          b: 'Qwerty',
          field2: 123
        }
      };
      const expectedOutJson = {
        myField: 'Hi',
        a: '8301975624',
        nestedObj: {
          b: 'Xxxxxx',
          field2: 123
        }
      };

      const mask = masker({whitelist: 'myField,FIELD2, a, somethingElse'});
      assert.deepEqual(mask(inJson), expectedOutJson);
    });

    it('should throw if whitelist is not an array or a string', () => {
      assert.throws(() => masker({whitelist: {invalid: true}}));
    });

    describe('multiple whitelists', () => {

      it('should accept multiple whitelists', () => {
        const inJson = {
          user: {
            name: 'Jorn',
            age: 31,
            job: {
              position: 'engineer',
              salary: 100
            },
            address: {
              country: 'Brazil',
              city: 'São Paulo',
              street: 'Rua Sader Macul, 741'
            }
          }
        };
        const expectedJson = {
          user: {
            name: 'Xxxx',
            age: 31,
            job: {
              position: 'engineer',
              salary: 100
            },
            address: {
              country: 'Brazil',
              city: 'São Paulo',
              street: 'Xxx Xxxxx Xxxxx, ***'
            }
          }
        };

        const userWhitelist = ['age'];
        const jobWhitelist = ['$..salary', '$..position'];
        const addressWhitelist = 'city, country';

        const mask = masker({whitelists: [userWhitelist, jobWhitelist, addressWhitelist]});

        assert.deepEqual(mask(inJson), expectedJson);
      });

      it('should ignore whitelists option if whitelist is specified', () => {
        const inJson = {
          myField: 'Hi',
          a: '8301975624'
        };
        const expectedJson = {
          myField: 'Hi',
          a: '**********'
        };

        const mask = masker({whitelist: 'myField', whitelists: ['a,b']});

        assert.deepEqual(mask(inJson), expectedJson);
      });

      it('should handle duplicates', () => {
        const mask = masker({whitelists: ['testField,testField2', 'testField']});
        assert.deepEqual(mask({testField: 123}), {testField: 123});
      });

      it('should handle null and undefined values', () => {
        const mask = masker({whitelists: [undefined, null]});
        assert.deepEqual(mask({testField: 123}), {testField: '***'});
      });

      it('should throw if one the whitelists is invalid', () => {
        assert.throws(() => masker({whitelists: ['field1, field2', {isWhitelist: false}]}));
      });

      it('should throw if whitelists is not an array', () => {
        assert.throws(() => masker({whitelists: 'not an array'}));
      });
    });
  });

  it('should not mask any field if set enabled=false', () => {
    const mask = masker({enabled: false});
    assert.deepEqual(mask({a: 'abc', nested: {b: 'xyz'}}), {a: 'abc', nested: {b: 'xyz'}});
  });

  it('should handle circular references', () => {
    const mask = masker();
    const inJson = {};
    inJson.a = inJson;
    assert.deepEqual(mask(inJson), inJson);
  });

  it('should throw if invalid json-path is provided', () => {
    assert.throws(() => masker({whitelist: ['field1', '$.field2', '$=*invalid  _ /json]path']}));
  });

  it('should not modify input JSON', () => {
    const inJson = {myField: 'Hi'};
    const expectedOutJson = {myField: 'Xx'};

    const mask = masker();
    assert.deepEqual(mask(inJson), expectedOutJson);
    assert.equal(inJson.myField, 'Hi');
  });
});
