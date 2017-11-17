# json-masker

A library for masking field values in JSON. Useful when there is a need to log JSON which potentially contains sensitive data such as PII.

## Installation
```
$ npm install json-masker
```

## Usage
```js
const Masker = require('json-masker');
const maskerOptions = {/*...*/};
const masker = new Masker(maskerOptions);
const maskedJson = masker.mask({ /* ... */ });
```
Logging incoming HTTP requests:
```js
// ...
app.post('/customers', (req, res) => {
  logger.debug(masker.mask(req.body));
  // ...
});
```

## Configuration
The preferred configuration way is usage of json object - maskerOptions while construction of Masker class instance.
 ```json
 {
    whitelist: ['node1', 'node2']
 }
 ```
 It contains only optional whitelist property for now. The value should be an array of strings (node names). This property is optional.

### Whitelisting
Sometimes we are sure that some field will never contain the data needs to be masked. Moreover, the field's value could be very useful in logs for example
for debugging purposes. json-masker library supports whitelisting to cover such cases. The library expects that the value of 'whitelist' will be an array
of json node names to be excluded from masking. The values should never be masked no matter where we find these keys in json structure.
The whitelisting is case-insensitive.

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