"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dataSource = exports.resolver = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _serverCore = require("@apollosproject/server-core");

var _config = _interopRequireDefault(require("@apollosproject/config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const resolver = {
  Query: {
    homeFeedFeatures: (root, args, {
      dataSources: {
        FeatureFeed
      }
    }) => FeatureFeed.getFeed({
      type: 'apollosConfig',
      args: {
        section: 'HOME_FEATURES',
        ...args
      }
    }),
    discoverFeedFeatures: (root, args, {
      dataSources: {
        FeatureFeed
      }
    }) => FeatureFeed.getFeed({
      type: 'apollosConfig',
      args: {
        section: 'DISCOVER_FEATURES'
      }
    })
  },
  WeekendContentItem: {
    featureFeed: ({
      id
    }, args, {
      dataSources: {
        FeatureFeed
      }
    }) => FeatureFeed.getFeed({
      type: 'contentItem',
      args: {
        id
      }
    })
  },
  ContentSeriesContentItem: {
    featureFeed: ({
      id
    }, args, {
      dataSources: {
        FeatureFeed
      }
    }) => FeatureFeed.getFeed({
      type: 'contentItem',
      args: {
        id
      }
    })
  },
  FeatureFeed: {
    // lazy-loaded
    features: ({
      getFeatures
    }) => getFeatures()
  }
};
exports.resolver = resolver;

class FeatureFeed extends _rockApolloDataSource.default {
  constructor(..._args) {
    super(..._args);

    _defineProperty(this, "getFromId", id => {
      return this.getFeed(JSON.parse(id));
    });

    _defineProperty(this, "getFeed", async ({
      type = '',
      args = {}
    }) => {
      let getFeatures = () => [];

      const {
        Feature,
        ContentItem
      } = this.context.dataSources;

      if (type === 'apollosConfig') {
        getFeatures = () => Feature.getFeatures(_config.default[args.section] || [], args);
      }

      if (type === 'contentItem' && args.id) {
        const contentItem = await ContentItem.getFromId(args.id);

        getFeatures = () => ContentItem.getFeatures(contentItem);
      }

      return {
        __typename: 'FeatureFeed',
        id: (0, _serverCore.createGlobalId)(JSON.stringify({
          type,
          args
        }), 'FeatureFeed'),
        getFeatures
      };
    });
  }

}

exports.dataSource = FeatureFeed;
//# sourceMappingURL=index.js.map