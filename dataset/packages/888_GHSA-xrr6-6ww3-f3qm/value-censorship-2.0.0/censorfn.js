'use strict'

const unreachableSymbol = Symbol('the code cant reach me')

const GeneratorFunction = function * () {}.constructor

module.exports = value => {
  const Value = value
  if (typeof value === 'function') {
    if (value.name === 'require' && typeof require.resolve === 'function' && typeof require.resolve.paths === 'function' || value === require) {
      throw new CensorStop('require')
    }
    if (value.name === 'Function' && new Value('a', 'return a')(unreachableSymbol) === unreachableSymbol || value === Function) {
      throw new CensorStop('Function')
    }
    if (value.name === 'eval' && value('a => a')(unreachableSymbol) === unreachableSymbol || value === eval) {
      throw new CensorStop('eval')
    }
    if (value.name === 'GeneratorFunction' && typeof value === 'function' || value === GeneratorFunction) {
      throw new CensorStop('eval')
    }
  }
  return value
}

const CensorStop = module.exports.CensorStop = class CensorStop extends Error {}
