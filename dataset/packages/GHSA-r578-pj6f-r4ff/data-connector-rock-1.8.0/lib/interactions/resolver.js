"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  Mutation: {
    interactWithNode: (root, args, {
      dataSources
    }) => dataSources.Interactions.createNodeInteraction(args)
  },
  InteractionResult: {
    node: ({
      nodeId
    }, args, {
      dataSources,
      models
    }, info) => models.Node.get(nodeId, dataSources, info)
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map