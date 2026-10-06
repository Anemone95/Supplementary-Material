"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _serverCore = require("@apollosproject/server-core");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  Mutation: {
    updateProfileField: (root, {
      input: {
        field,
        value
      }
    }, {
      dataSources
    }) => dataSources.Person.updateProfile([{
      field,
      value
    }]),
    updateProfileFields: (root, {
      input
    }, {
      dataSources
    }) => dataSources.Person.updateProfile(input),
    uploadProfileImage: async (root, {
      file,
      size
    }, {
      dataSources
    }) => dataSources.Person.uploadProfileImage(file, size)
  },
  Person: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    photo: ({
      photo: {
        url
      }
    }) => url ? {
      uri: url
    } : null,
    birthDate: (0, _utils.enforceCurrentUser)(({
      birthDate
    }) => birthDate ? _momentTimezone.default.tz(birthDate, _config.default.ROCK.TIMEZONE).toJSON() : null),
    gender: (0, _utils.enforceCurrentUser)(({
      gender
    }, args, {
      dataSources
    }) => dataSources.Person.mapGender({
      gender
    })),
    email: (0, _utils.enforceCurrentUser)(({
      email
    }) => email)
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map