"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

var _default = {
  Event: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    name: (root, args, {
      dataSources
    }) => dataSources.Event.getName(root),
    description: (root, args, {
      dataSources
    }) => dataSources.Event.getDescription(root),
    start: ({
      schedule
    }, args, {
      dataSources
    }) => dataSources.Event.getDateTime(schedule).start,
    end: ({
      schedule
    }, args, {
      dataSources
    }) => dataSources.Event.getDateTime(schedule).end,
    image: (root, args, {
      dataSources
    }) => dataSources.Event.getImage(root)
  },
  Campus: {
    events: ({
      id
    }, args, {
      dataSources
    }) => dataSources.Event.getByCampus(id)
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map