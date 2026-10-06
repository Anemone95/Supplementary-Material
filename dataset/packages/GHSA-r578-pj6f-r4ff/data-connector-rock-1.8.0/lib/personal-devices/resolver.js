"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

var _default = {
  Device: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'Device'),
    pushId: ({
      deviceRegistrationId
    }) => deviceRegistrationId
  },
  Person: {
    devices: ({
      primaryAliasId
    }, args, {
      dataSources
    }) => dataSources.PersonalDevice.getByPersonAliasId(primaryAliasId)
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map