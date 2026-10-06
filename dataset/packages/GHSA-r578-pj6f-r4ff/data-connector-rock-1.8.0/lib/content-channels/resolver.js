"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

const resolver = {
  Query: {
    contentChannels: (root, args, context) => context.dataSources.ContentChannel.getRootChannels()
  },
  ContentChannel: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    childContentItemsConnection: ({
      id
    }, args, {
      dataSources
    }) => dataSources.ContentItem.paginate({
      cursor: dataSources.ContentItem.byContentChannelId(id),
      args
    }),
    iconName: () => 'text' // TODO

  }
};
var _default = resolver;
exports.default = _default;
//# sourceMappingURL=resolver.js.map