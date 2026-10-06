"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = require("lodash");

var _serverCore = require("@apollosproject/server-core");

var _default = {
  // deprecated
  WeekendContentItem: {
    features: (root, args, {
      dataSources: {
        ContentItem
      }
    }) => ContentItem.getFeatures(root)
  },
  // deprecated
  ContentSeriesContentItem: {
    features: (root, args, {
      dataSources: {
        ContentItem
      }
    }) => ContentItem.getFeatures(root)
  },
  Feature: {
    // Implementors must attach __typename to root.
    __resolveType: ({
      __typename
    }) => __typename
  },
  TextFeature: {
    sharing: ({
      body
    }) => ({
      title: 'Share text via...',
      message: body
    }),
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'TextFeature')
  },
  CardListItem: {
    coverImage: ({
      image
    }) => image,
    title: ({
      title
    }, {
      hyphenated
    }, {
      dataSources: {
        ContentItem
      }
    }) => hyphenated ? ContentItem.createHyphenatedString({
      text: title
    }) : title,
    hasAction: (root, args, {
      dataSources: {
        ContentItem
      }
    }) => !!(0, _lodash.get)(ContentItem.getVideos(root.relatedNode), '[0].sources[0]', null),
    labelText: ({
      subtitle
    }) => subtitle,
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'CardListItem')
  },
  ActionListAction: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'ActionListAction')
  },
  ActionBarAction: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'ActionBarAction')
  },
  ScriptureFeature: {
    scriptures: ({
      reference,
      version
    }, args, {
      dataSources: {
        Scripture
      }
    }) => Scripture.getScriptures(reference, version),
    sharing: ({
      reference
    }, args, {
      dataSources: {
        Feature
      }
    }) => ({
      title: 'Share scripture via...',
      message: Feature.getScriptureShareMessage(reference)
    }),
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'ScriptureFeature')
  },
  Query: {
    userFeedFeatures: async (root, args, {
      dataSources: {
        Feature
      }
    }) => console.warn('userFeedFeatures is deprecated. Use homeFeedFeatures.') || Feature.getHomeFeedFeatures()
  },
  ActionListFeature: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'ActionListFeature')
  },
  ActionBarFeature: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'ActionBarFeature')
  },
  HeroListFeature: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'HeroListFeature')
  },
  VerticalCardListFeature: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'VerticalCardListFeature')
  },
  HorizontalCardListFeature: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'HorizontalCardListFeature')
  },
  PrayerListFeature: {
    id: ({
      id
    }) => (0, _serverCore.createGlobalId)(id, 'PrayerListFeature')
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map