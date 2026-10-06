"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

var _default = {
  Mutation: {
    addPrayer: (root, args, {
      dataSources
    }) => dataSources.PrayerRequest.addPrayer(args)
  },
  PrayerRequest: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    isAnonymous: ({
      isPublic
    }) => !isPublic,
    requestor: ({
      requestedByPersonAliasId
    }, args, {
      dataSources
    }) => dataSources.Person.getFromAliasId(requestedByPersonAliasId),
    isPrayed: async ({
      id
    }, args, {
      dataSources
    }, {
      parentType
    }) => {
      const interactions = await dataSources.Interactions.getInteractionsForCurrentUserAndNodes({
        nodeIds: [(0, _serverCore.createGlobalId)(id, parentType.name)],
        actions: ['PRAY']
      });
      return interactions.length;
    }
  },
  PrayerListFeature: {// id: ID!
    // order: Int
    // title: String
    // subtitle: String
    // prayers: [Prayer]
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map