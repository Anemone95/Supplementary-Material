"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

const resolver = {
  Query: {
    currentUser: (root, args, {
      dataSources
    }) => dataSources.Auth.getCurrentPerson()
  },
  AuthenticatedUser: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    profile: authUser => authUser,
    rock: rockDetails => rockDetails,
    rockToken: (root, args, context) => context.rockCookie
  },
  RockPersonDetails: {
    authToken: (root, args, {
      dataSources
    }) => dataSources.Auth.getAuthToken(),
    authCookie: (root, args, {
      rockCookie
    }) => rockCookie
  },
  Authentication: {
    user: (root, args, {
      dataSources
    }) => dataSources.Auth.getCurrentPerson()
  },
  Mutation: {
    authenticate: (root, {
      identity,
      password
    }, {
      dataSources
    }) => dataSources.Auth.authenticate({
      identity,
      password
    }),
    changePassword: (root, {
      password
    }, {
      dataSources
    }) => dataSources.Auth.changePassword({
      password
    }),
    registerPerson: (root, args, {
      dataSources
    }) => dataSources.Auth.registerPerson(args)
  }
};
var _default = resolver;
exports.default = _default;
//# sourceMappingURL=resolver.js.map