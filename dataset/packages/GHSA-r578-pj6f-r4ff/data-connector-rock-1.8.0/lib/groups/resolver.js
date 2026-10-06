"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

var _utils = require("../utils");

var _default = {
  Group: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    leaders: ({
      id
    }, args, {
      dataSources
    }) => dataSources.Group.getLeaders(id),
    members: ({
      id
    }, args, {
      dataSources
    }) => dataSources.Group.getMembers(id)
  },
  Person: {
    groups: (0, _utils.enforceCurrentUser)(({
      id
    }, {
      type,
      asLeader
    }, {
      dataSources
    }) => dataSources.Group.getByPerson({
      personId: id,
      type,
      asLeader
    }))
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map