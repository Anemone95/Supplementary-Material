'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var humanize = _interopDefault(require('string-humanize'));
var retrieveArguments = _interopDefault(require('retrieve-arguments'));
var fs = _interopDefault(require('fs'));
var crypto = _interopDefault(require('crypto'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();











var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var Stage = function () {
    function Stage() {
        classCallCheck(this, Stage);
    }

    createClass(Stage, [{
        key: "and",
        value: function and() {
            return this;
        }
    }, {
        key: "but",
        value: function but() {
            return this;
        }
    }, {
        key: "with",
        value: function _with() {
            return this;
        }
    }, {
        key: "given",
        value: function given() {
            return this;
        }
    }, {
        key: "when",
        value: function when() {
            return this;
        }
    }, {
        key: "then",
        value: function then() {
            return this;
        }
    }]);
    return Stage;
}();

var INTRO_WORD_METHODS = ['given', 'when', 'then', 'and', 'but', 'with'];

var ScenarioPart = function () {
    function ScenarioPart(kind) {
        var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        classCallCheck(this, ScenarioPart);

        this.kind = kind;
        this.steps = steps;
        this.introWord = null;
    }

    createClass(ScenarioPart, [{
        key: 'stageMethodCalled',
        value: function stageMethodCalled(methodName, parameters) {
            if (INTRO_WORD_METHODS.find(function (introWord) {
                return introWord === methodName;
            })) {
                this.introWord = methodName;
            } else {
                var isFirstStep = this.steps.length === 0;
                this.steps.push(new Step(methodName, parameters, isFirstStep, this.introWord));
                this.introWord = null;
            }
        }
    }]);
    return ScenarioPart;
}();

var Step = function Step(methodName, parameters, isFirstStep, introWord) {
    classCallCheck(this, Step);

    var TWO_DOLLAR_PLACEHOLDER = 'zzblablaescapedollarsignplaceholdertpolm';

    var parametersCopy = [].concat(toConsumableArray(parameters));

    var words = [].concat(toConsumableArray(methodName // 'a_bill_of_$_$$'
    .replace('$$', TWO_DOLLAR_PLACEHOLDER) // 'a_bill_of_$_TWO_DOLLAR_PLACEHOLDER'
    .split('$') // ['a_bill_of', 'TWO_DOLLAR_PLACEHOLDER']
    .map(function (word) {
        return _.lowerCase(humanize(word));
    }) //  ['a bill of', 'TWO_DOLLAR_PLACEHOLDER']
    .reduce(function (previous, newString, index) {
        if (index === 0) {
            return [{ word: newString, parameterName: null }];
        }

        var formattedParameters = void 0;
        if (parametersCopy.length > 0) {
            var _parametersCopy$splic = parametersCopy.splice(0, 1);

            var _parametersCopy$splic2 = slicedToArray(_parametersCopy$splic, 1);

            var parameter = _parametersCopy$splic2[0];

            formattedParameters = [{ word: formatParameter(parameter.value), parameterName: parameter.parameterName }];
        } else {
            formattedParameters = [];
        }

        return [].concat(toConsumableArray(previous), toConsumableArray(formattedParameters), [{ word: newString, parameterName: null }]);
    }, []) //  ['a bill of', '500', 'TWO_DOLLAR_PLACEHOLDER']
    .filter(function (_ref) {
        var word = _ref.word;
        return word !== '';
    }) // If one puts a $ at the end of the method, this adds a useless '' at the end
    .map(function (_ref2) {
        var word = _ref2.word;
        var parameterName = _ref2.parameterName;
        return {
            word: word.replace(TWO_DOLLAR_PLACEHOLDER, '$'),
            parameterName: parameterName
        };
    }) //  ['a bill of', '500', '$']
    .map(toWord)), toConsumableArray(parametersCopy.map(function (parameter) {
        return {
            word: formatParameter(parameter.value),
            parameterName: parameter.parameterName
        };
    }).map(toWord)));

    if (introWord) {
        words = [toIntroWord(introWord)].concat(toConsumableArray(words));
    }

    if (isFirstStep) {
        var _words = words;

        var _words2 = toArray(_words);

        var _words2$ = _words2[0];
        var value = _words2$.value;
        var isIntroWord = _words2$.isIntroWord;

        var rest = _words2.slice(1);

        words = [new Word(_.upperFirst(value), isIntroWord)].concat(toConsumableArray(rest));
    }
    this.words = words;
    this.name = words.map(function (_ref3) {
        var value = _ref3.value;
        return value;
    }).join(' ');

    function toWord(_ref4) {
        var word = _ref4.word;
        var parameterName = _ref4.parameterName;

        return new Word(word, false, parameterName);
    }

    function toIntroWord(value) {
        return new Word(value, true, null);
    }
};

var Word = function Word(value, isIntroWord) {
    var parameterName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    classCallCheck(this, Word);

    this.value = value;
    this.isIntroWord = isIntroWord;
    this.parameterName = parameterName;
};

var ScenarioCase = function ScenarioCase(args) {
    var parts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    classCallCheck(this, ScenarioCase);

    this.args = args;
    this.parts = parts;
};

var ScenarioReport = function () {
    function ScenarioReport(groupReport, name, cases, argumentNames) {
        classCallCheck(this, ScenarioReport);

        this.groupReport = groupReport;
        this.name = name;
        this.cases = cases;
        this.argumentNames = argumentNames;
    }

    createClass(ScenarioReport, [{
        key: 'dumpToFile',
        value: function dumpToFile(reportsDestination) {
            createDirOrDoNothingIfExists(reportsDestination);
            var fileName = computeScenarioFileName(this.groupReport.name, this.name);
            fs.writeFileSync(reportsDestination + '/' + fileName, JSON.stringify(this), 'utf-8');
        }
    }]);
    return ScenarioReport;
}();

function formatParameter(parameter) {
    if (_.isObject(parameter) || Array.isArray(parameter)) {
        if (parameter.toString && parameter.toString !== Object.prototype.toString && parameter.toString !== Array.prototype.toString) {
            return parameter.toString();
        }
        return JSON.stringify(parameter);
    } else {
        return parameter && parameter.toString ? parameter.toString() : JSON.stringify(parameter);
    }
}

var GroupReport = function GroupReport(name) {
    classCallCheck(this, GroupReport);

    this.name = name;
};

function createDirOrDoNothingIfExists(path) {
    try {
        fs.mkdirSync(path);
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        } else {
            // do nothing
        }
    }
}

function computeScenarioFileName(groupName, scenarioName) {
    var hash = crypto.createHash('sha256');
    hash.update(groupName + '\n' + scenarioName);
    return hash.digest('hex');
}

var REPORTS_DESTINATION = '.jsGiven-reports';

var ScenarioRunner = function () {
    function ScenarioRunner() {
        var reportsDestination = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : REPORTS_DESTINATION;
        classCallCheck(this, ScenarioRunner);

        this.reportsDestination = reportsDestination;
    }

    createClass(ScenarioRunner, [{
        key: 'setup',
        value: function setup(groupFunc, testFunc) {
            this.groupFunc = groupFunc;
            this.testFunc = testFunc;
        }
    }, {
        key: 'scenarios',
        value: function scenarios(groupName, stagesParams, scenariosFunc) {
            var _this = this;

            var report = new GroupReport(groupName);

            var currentGiven = void 0;
            var currentWhen = void 0;
            var currentThen = void 0;

            var scenariosParam = void 0;
            if (Array.isArray(stagesParams)) {
                (function () {
                    var self = _this;

                    var _stagesParams = slicedToArray(stagesParams, 3);

                    var givenClass = _stagesParams[0];
                    var whenClass = _stagesParams[1];
                    var thenClass = _stagesParams[2];

                    var getOrBuildGiven = function getOrBuildGiven() {
                        if (!currentGiven) {
                            currentGiven = self.buildObject(givenClass);
                        }
                        return currentGiven.given();
                    };

                    var getOrBuildWhen = function getOrBuildWhen() {
                        if (!currentWhen) {
                            currentWhen = self.buildObject(whenClass);
                            copyStateProperties(currentGiven, currentWhen);
                        }
                        return currentWhen.when();
                    };

                    var getOrBuildThen = function getOrBuildThen() {
                        if (!currentThen) {
                            currentThen = self.buildObject(thenClass);
                            copyStateProperties(currentGiven, currentThen);
                            copyStateProperties(currentWhen, currentThen);
                        }
                        return currentThen.then();
                    };

                    scenariosParam = _this.addGivenWhenThenParts({
                        given: getOrBuildGiven,
                        when: getOrBuildWhen,
                        then: getOrBuildThen
                    });
                })();
            } else {
                (function () {
                    var self = _this;
                    var givenClass = stagesParams;

                    var getOrBuildGWT = function getOrBuildGWT() {
                        if (!currentGiven) {
                            currentGiven = self.buildObject(givenClass);
                            currentWhen = currentGiven;
                            currentThen = currentWhen;
                        }
                        return currentGiven;
                    };

                    scenariosParam = _this.addGivenWhenThenParts({
                        given: function given() {
                            return getOrBuildGWT().given();
                        },
                        when: function when() {
                            return getOrBuildGWT().when();
                        },
                        then: function then() {
                            return getOrBuildGWT().then();
                        }
                    });
                })();
            }

            this.groupFunc(groupName, function () {
                var scenarios = scenariosFunc(scenariosParam);

                getScenarios(scenarios).forEach(function (_ref) {
                    var scenarioPropertyName = _ref.scenarioPropertyName;
                    var cases = _ref.cases;
                    var argumentNames = _ref.argumentNames;

                    var scenarioNameForHumans = humanize(scenarioPropertyName);
                    var scenario = _this.addScenario(report, scenarioNameForHumans, argumentNames);

                    var casesCount = 0;
                    cases.forEach(function (_ref2, index) {
                        var caseFunction = _ref2.caseFunction;
                        var args = _ref2.args;

                        var caseDescription = cases.length === 1 ? scenarioNameForHumans : scenarioNameForHumans + ' #' + (index + 1);
                        _this.testFunc(caseDescription, function () {
                            _this.addCase(scenario, args);

                            // Reset stages
                            currentGiven = currentWhen = currentThen = undefined;

                            // Execute scenario
                            try {
                                caseFunction();
                            } finally {
                                casesCount++;
                                if (casesCount === cases.length) {
                                    scenario.dumpToFile(_this.reportsDestination);
                                }
                            }
                        });
                    });
                });

                function getScenarios(scenarios) {
                    var scenarioDescriptions = Object.keys(scenarios).map(function (scenarioPropertyName) {
                        if (scenarios[scenarioPropertyName] instanceof Function) {
                            return {
                                scenarioPropertyName: scenarioPropertyName,
                                cases: [{
                                    caseFunction: scenarios[scenarioPropertyName],
                                    args: []
                                }],
                                argumentNames: []
                            };
                        } else {
                            var _ret3 = function () {
                                var _ref3 = scenarios[scenarioPropertyName];
                                var parameters = _ref3.parameters;
                                var func = _ref3.func;

                                var argumentNames = retrieveArguments(func);

                                return {
                                    v: {
                                        scenarioPropertyName: scenarioPropertyName,
                                        cases: parameters.map(function (parametersForCase) {
                                            var parametersForTestFunction = parametersForCase.map(function (parameter, index) {
                                                return wrapParameter(parameter, argumentNames[index]);
                                            });
                                            var args = parametersForCase.map(formatParameter);
                                            return {
                                                caseFunction: function caseFunction() {
                                                    return func.apply(undefined, toConsumableArray(parametersForTestFunction));
                                                },
                                                args: args
                                            };
                                        }),
                                        argumentNames: argumentNames
                                    }
                                };
                            }();

                            if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
                        }
                    });
                    return scenarioDescriptions;
                }
            });
        }
    }, {
        key: 'addGivenWhenThenParts',
        value: function addGivenWhenThenParts(scenariosParam) {
            var _this2 = this;

            return {
                given: function given() {
                    _this2.addGivenPart();
                    return scenariosParam.given();
                },
                when: function when() {
                    _this2.addWhenPart();
                    return scenariosParam.when();
                },
                then: function then() {
                    _this2.addThenPart();
                    return scenariosParam.then();
                }
            };
        }
    }, {
        key: 'addScenario',
        value: function addScenario(report, scenarioNameForHumans, argumentNames) {
            return new ScenarioReport(report, scenarioNameForHumans, [], argumentNames);
        }
    }, {
        key: 'addCase',
        value: function addCase(scenario, args) {
            this.currentCase = new ScenarioCase(args);
            scenario.cases.push(this.currentCase);
        }
    }, {
        key: 'addGivenPart',
        value: function addGivenPart() {
            this.currentPart = new ScenarioPart('GIVEN');
            this.currentCase.parts.push(this.currentPart);
        }
    }, {
        key: 'addWhenPart',
        value: function addWhenPart() {
            this.currentPart = new ScenarioPart('WHEN');
            this.currentCase.parts.push(this.currentPart);
        }
    }, {
        key: 'addThenPart',
        value: function addThenPart() {
            this.currentPart = new ScenarioPart('THEN');
            this.currentCase.parts.push(this.currentPart);
        }
    }, {
        key: 'buildObject',
        value: function buildObject(tClass) {
            var _this4 = this;

            // $FlowIgnore
            var extendedClass = function (_tClass) {
                inherits(extendedClass, _tClass);

                function extendedClass() {
                    classCallCheck(this, extendedClass);
                    return possibleConstructorReturn(this, (extendedClass.__proto__ || Object.getPrototypeOf(extendedClass)).apply(this, arguments));
                }

                return extendedClass;
            }(tClass);

            // Flowtype really can't type this constructor invocation
            // Therefore we have to cast it as any :(


            var instance = new extendedClass();

            var extendedPrototype = Object.getPrototypeOf(instance);
            var classPrototype = Object.getPrototypeOf(extendedPrototype);

            getAllMethods(classPrototype).forEach(function (methodName) {
                var self = _this4;

                extendedPrototype[methodName] = function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    var decodedParameters = args.map(decodeParameter);

                    // Pass the real arguments instead of the wrapped values
                    var values = decodedParameters.map(function (decodedParameter) {
                        return decodedParameter.value;
                    });
                    var result = classPrototype[methodName].apply(this, values);

                    if (result === this) {
                        // only records methods that return this
                        self.currentPart.stageMethodCalled(methodName, decodedParameters);
                    }
                    return result;
                };
            });

            return instance;

            function getAllMethods(obj) {
                var allMethods = [];
                var current = obj;
                do {
                    var props = Object.getOwnPropertyNames(current);
                    props.forEach(function (prop) {
                        if (allMethods.indexOf(prop) === -1) {
                            if (_.isFunction(current[prop])) {
                                allMethods.push(prop);
                            }
                        }
                    });
                } while (current = Object.getPrototypeOf(current));

                return allMethods;
            }
        }
    }]);
    return ScenarioRunner;
}();

var INSTANCE = new ScenarioRunner();

function scenarios(groupName, stagesParam, scenarioFunc) {
    return INSTANCE.scenarios(groupName, stagesParam, scenarioFunc);
}

function copyStateProperties(source, target) {
    if (source && target && source.stateProperties && target.stateProperties) {
        var propertyNames = _.intersection(source.stateProperties, target.stateProperties);
        propertyNames.forEach(function (propertyName) {
            // Need to convert to any to avoid typechecking
            var sourceAny = source;
            var targetAny = target;
            targetAny[propertyName] = sourceAny[propertyName];
        });
    }
}

function State(target, key, descriptor) {
    if (!target.stateProperties) {
        target.stateProperties = [];
    }
    target.stateProperties.push(key);
    return _extends({}, descriptor, { writable: true });
}

function parametrized(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}

function parametrized1(parameters, func) {
    return {
        parameters: parameters.map(function (param) {
            return [param];
        }),
        func: func
    };
}
function parametrized2(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}
function parametrized3(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}
function parametrized4(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}
function parametrized5(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}
function parametrized6(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}
function parametrized7(parameters, func) {
    return {
        parameters: parameters,
        func: func
    };
}

function wrapParameter(value, parameterName) {
    return {
        parameterName: parameterName,
        value: value,
        IS_JSGIVEN_WRAPPER_PARAMETER: true
    };
}

function decodeParameter(parameter) {
    if (parameter instanceof Object && parameter.IS_JSGIVEN_WRAPPER_PARAMETER) {
        var wrapped = parameter;
        return _extends({}, wrapped);
    } else {
        return {
            value: parameter,
            parameterName: null
        };
    }
}

function setupForRspec(describe, it) {
    return INSTANCE.setup(function (groupName, suiteFunc) {
        describe(groupName, suiteFunc);
    }, function (testName, testFunc) {
        it(testName, testFunc);
    });
}

function setupForAva(test) {
    var capturedGroupName = '';
    return INSTANCE.setup(function (groupName, suiteFunc) {
        capturedGroupName = groupName;
        suiteFunc();
    }, function (testName, testFunc) {
        test(capturedGroupName + ' / ' + testName, testFunc);
    });
}

exports.parametrized = parametrized;
exports.parametrized1 = parametrized1;
exports.parametrized2 = parametrized2;
exports.parametrized3 = parametrized3;
exports.parametrized4 = parametrized4;
exports.parametrized5 = parametrized5;
exports.parametrized6 = parametrized6;
exports.parametrized7 = parametrized7;
exports.scenarios = scenarios;
exports.State = State;
exports.setupForRspec = setupForRspec;
exports.setupForAva = setupForAva;
exports.Stage = Stage;
