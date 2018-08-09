# json-masker

A library for masking field values in JSON. Useful when there is a need to log JSON which potentially contains sensitive data such as PII.

## Installation
```
$ npm install json-masker
```

## Usage
```js
const masker = require('json-masker');
const maskerOptions = {/*...*/};
const mask = masker(maskerOptions);
const maskedJson = mask({ /* ... */ });
```
Logging incoming HTTP requests:
```js
// ...
app.post('/customers', (req, res) => {
  logger.debug(mask(req.body));
  // ...
});
```

## Configuration
json-masker can be configured via options object passed into factory function. Possible parameters are:
 * `whitelist` - a field whitelist. The values of whitelisted fields will _not_ be masked. See _Whitelist_ section for whitelist format documentation. Default: _empty_
 * `whitelists` - a collection of field whitelists. Used if `whitelist` option is not present, otherwise is ignored. Allows to define multiple logicaly-split whitelists. Is only for user convenience. Internally, the collection of whitelists is merged into one anyway. Default: _empty_
 * `enabled` - a boolean flag that toggles masking functionality. If set to `false`, none of the fields will be masked. Might be useful for debug purposes. Default: `true`

### Whitelist
A whitelist can be defined as:
* An array of values: `['field1', 'field2']`
* A string of comma separated values: `'field1, field2'`. Whitespaces between values are optional and ignored.

A field in a whitelist can be difined by:
* name (case-insensitive), e.g. `myField`
* json-path, e.g. `$.myFieldParent.myField`. For more details see json-path [documentation](https://github.com/dchester/jsonpath)

### Examples
```js
const mask = masker({
  whitelist: [
    /* by field name: */
    'field1',
    'field2',
    /* by json-path: */
    '$.myArray[1].someField',
    '$..path.to.a.field'
  ],
  enabled: false
});
```
```js
const mask = masker({
  // as a string of comma separated values
  whitelist: 'field1, field2, $..myField'
});
```
```js
const mask = masker({
  // multiple logical whitelists
  whitelists: [
    'content-type, content-length, user-agent'
    'country, state, province'
  ]
});
```

## Masking strategy
Example of input:
```json
{
  "firstName": "Noëlla",
  "lastName": "Maïté",
  "age": 26,
  "gender": "Female",
  "contacts": {
    "email": "cbentson7@nbcnews.com",
    "phone": "62-(819)562-8538",
    "address": "12 Northview Way"
  },
  "employments": [
    {
      "companyName": "Reynolds-Denesik",
      "startDate": "12/7/2016",
      "salary": "$150"
    }
  ],
  "ipAddress": "107.196.186.197"
}
```
Output:
```json
{
  "firstName": "Xxxxxx",
  "lastName": "Xxxxx",
  "age": "**",
  "gender": "Xxxxxx",
  "contacts": {
    "email": "xxxxxxxx*@xxxxxxx.xxx",
    "phone": "**-(***)***-****",
    "address": "** Xxxxxxxxx Xxx"
  },
  "employments": [
    {
      "companyName": "Xxxxxxxx-Xxxxxxx",
      "startDate": "**/*/****",
      "salary": "$***"
    }
  ],
  "ipAddress": "***.***.***.***"
}
```
### Rules
1. strings
    * whitespaces remain unchanged 
    * punctuation marks (non-alphanumeric characters of [latin-1](http://jrgraphix.net/r/Unicode/0020-007F)) remain unchanged
    * latin-1 characters 1-9 become `*`
    * latin-1 characters A-Z become `X`
    * all other UTF-8 characters become `x`
2. numbers are converted to strings where each 1-9 character is replaced with `*` (e.g. `125` becomes `"***"` or `3.95` becomes `"*.**"`) 
3. booleans: remain unchanged
4. nulls: remain unchanged
