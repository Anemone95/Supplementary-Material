# Access Policy Encoder/Parser

## Statements Format

```js
{
  "statements": [ //Array
    {
      "effect": "deny", // String
      "action": "*", // String or Array
      "resource": [ // String or Array
        "/user/${user.id}/*"
      ],
      "condition": { // Object
        "equals": { // Object
          "key": "value"
        }
      },
      "restiction": {
        "equals": { // Object
          "key": "value"
        }
      }
    }
  ]
}
```

### Statement

* __effect__: (Optional) Access to a resource is always denied if there are no matches in a statement. If you need to countermand a more "general" allowed statement with a specific rule, you would use `deny`.
* __action__: The HTTP action (`GET`, `POST`, `PUT`, `DELETE`)
* __resource__: The URL that is being accessed
* __condition__: (Optional) A condition for accessing the resource. __NOT YET IMPLEMENTED__
* __restriction__: (Otional) Restrictions to the _data_ that can be accessed from a resource. While it's entirely possible to access a resource it can be possible to limit that data that is available from it.


## Encoding

Encoding a statement happens at run time (if the provided statement hasn't already been encoded) and evaluated against data provided.

### Template Format
When encoding a policy variables are provided via [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) style strings.

```js
{
    "key": "${value}"
}
```

## Parsing

## Accepted Data

The following object is what the parser expects to recieve.
```js
{
    Action: 'GET',
    Resource: 'user/12345',
    property: 'value',
    property2: {
      key: 'value',
      key2: 'value'
    }
}
```

### Required

The following properties are required for validation:

* __Method__: The http method for the request (`GET`, `POST`, `PUT`, `DELETE`)
* __Resource__: The `pathname` of the requesting URL

### Optional
Beyond the required properties you can inlude arbitrary properties that can be nested and accessed during encoding.

```js
// Template
{
  "statements": [
    {
      "effect": "deny",
      "action": "*",
      "resource": [
        "/user/${user.id}/*"
      ],
      "restiction": {
        "equals": {
          "account_id": "${accountId}"
        }
      }
    }
  ]
}

// Data
{
  Action: "GET",
  Resource: "/user/1234",
  accountId: "5678"
}
```
