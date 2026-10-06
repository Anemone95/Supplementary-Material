"use strict";

var _graphql = require("graphql");

var _apolloServerEnv = require("apollo-server-env");

var _serverCore = require("@apollosproject/server-core");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _dataSchema = require("@apollosproject/data-schema");

var _ = require("../..");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// we import the root-level schema and resolver so we test the entire integration:
const {
  getContext,
  getSchema
} = (0, _testUtils.createTestHelpers)({
  ContentChannel: _.ContentChannel,
  ContentItem: _.ContentItem,
  Sharable: _.Sharable
});

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx'
  },
  ROCK_MAPPINGS: {
    SERIES_CONTENT_CHANNEL_TYPE_IDS: [6, 7],
    DISCOVER_CONTENT_CHANNEL_IDS: [2, 3, 4, 6, 8]
  }
});

const contentChannelFragment = `
  fragment ContentChannelFragment on ContentChannel {
    id
    __typename
    name
    description
    childContentChannels {
      id
      __typename
      name
      description
    }
    iconName
    childContentItemsConnection {
      edges {
        cursor
        node {
          id
          __typename
        }
      }
    }
  }
`;
describe('ContentChannel', () => {
  let schema;
  let context;
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    _apolloServerEnv.fetch.mockRockDataSourceAPI();

    schema = getSchema([_dataSchema.featuresSchema, _dataSchema.themeSchema, _dataSchema.mediaSchema, _dataSchema.scriptureSchema, _dataSchema.liveSchema]);
    context = getContext();
  });
  it('gets a list of content channels', async () => {
    const query = `
      query {
        contentChannels {
          ...ContentChannelFragment
        }
      }
      ${contentChannelFragment}
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets a single content channel when querying by root node', async () => {
    const query = `
      query {
        node(
          id: "${(0, _serverCore.createGlobalId)(1, 'ContentChannel')}"
        ) {
          ...on ContentChannel {
            ...ContentChannelFragment
          }
        }
      }
      ${contentChannelFragment}
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
});
//# sourceMappingURL=resolvers.tests.js.map