module.exports = {
  "env": {
    "es6": true,
    "mocha": true,
  },
  "globals": {
    "it": true,
    "describe": true,
    "$": true,
    "window": true,
    "SwaggerUi": true,
    "angular": true,
    "L": true,
    "r360": true,
    "console" : true,
    "d3" : true
  },
  "rules": {
    "no-bitwise": 2,
    "camelcase": 2,
    "curly": 0,
    "eqeqeq": 2,
    "wrap-iife": [
      2,
      "any"
    ],
    "indent": [
      2,
      2,
      {
        "SwitchCase": 1
      }
    ],
    "no-use-before-define": [
      2,
      {
        "functions": false
      }
    ],
    "new-cap": 0,
    "no-caller": 2,
    "quotes": [
      2,
      "single"
    ],
    "no-undef": 2,
    "no-unused-vars": 0,
    "strict": 0
  }
}