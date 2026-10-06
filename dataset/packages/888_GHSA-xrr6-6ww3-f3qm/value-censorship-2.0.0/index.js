'use strict'

const estraverse = require('estraverse')
const acorn = require('acorn')
const escodegen = require('escodegen')
const censorFn = require('./censorfn')
const { VM: VM2 } = require('vm2')

class NoCatch extends Error {}

function wrap (node) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: '__censorFn'
    },
    arguments: [node]
  }
}

function run (transformed, sandbox) {
  const code = '(() => {' + escodegen.generate(transformed) + '})()'
  sandbox = Object.assign({ __censorFn: censorFn }, sandbox)
  const vm = new VM2({ sandbox })
  return vm.run(code)
}

function transform (code) {
  const parsed = acorn.parse(code, { allowReturnOutsideFunction: true })
  return estraverse.replace(parsed, {
    leave (node) {
      if (node.type === 'CallExpression' || node.type === 'NewExpression') {
        node.arguments = node.arguments.map(arg => {
          if (arg.type !== 'CallExpression') return wrap(arg)
          return arg
        })
        return {
          type: 'SequenceExpression',
          expressions: [ wrap(node.callee), node ]
        }
      }
      if (node.type === 'CatchClause') {
        throw NoCatch('Catch clause is forbidden')
      }
      return node
    }
  })
}

module.exports = function censor (code, sandbox = {}) {
  const transformed = transform(code)
  const ret = run(transformed, sandbox)
  return censorFn(ret)
}

module.exports.CensorStop = censorFn.CensorStop
