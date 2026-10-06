"use strict";

var _graphql = require("graphql");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _dataConnectorRock = require("@apollosproject/data-connector-rock");

var _dataSchema = require("@apollosproject/data-schema");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var FeatureFeed = _interopRequireWildcard(require(".."));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  getSchema,
  getContext
} = (0, _testUtils.createTestHelpers)({
  Feature: _dataConnectorRock.Feature,
  FeatureFeed
});
describe('FeatureFeed', () => {
  let schema;
  let context;
  let rootValue;
  beforeEach(() => {
    schema = getSchema([_dataSchema.featuresSchema, _dataSchema.scriptureSchema, _dataSchema.contentItemSchema, _dataSchema.contentChannelSchema, _dataSchema.themeSchema, _dataSchema.sharableSchema, _dataSchema.prayerSchema, _dataSchema.peopleSchema, _dataSchema.campusSchema, _dataSchema.interactionsSchema]);
    context = getContext();
    rootValue = {};

    _config.default.loadJs({
      HOME_FEATURES: [{
        algorithms: ['PERSONA_FEED'],
        subtitle: 'Explore what God calls you to today',
        title: 'FOR YOU',
        type: 'HorizontalCardList'
      }],
      DISCOVER_FEATURES: [{
        algorithms: ['CONTENT_CHANNEL'],
        title: 'Content'
      }]
    });

    context.dataSources.Feature.runAlgorithms = () => [];
  });
  it('should query the home feed', async () => {
    const query = `
      query {
        homeFeedFeatures {
          id
          features {
            id
          }
        }
      }
    `;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('should query the discover feed', async () => {
    const query = `
      query {
        discoverFeedFeatures {
          id
          features {
            id
          }
        }
      }
    `;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('should get a specific feed', async () => {
    const query = `
       query {
         node(id: "FeatureFeed:c7035fd9677aa209cd4613df53e9c83a0fb3b9ecd853808383d135407161a17b98645698d03097766084632c51ea2eb271dbdadb1205a7012706cfd3d3a513fb") {
           ... on FeatureFeed {
             features {
               id
             }
           }
         }
       }
   `;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('should handle sources other than the config', async () => {
    expect((await context.dataSources.FeatureFeed.getFeed({
      type: 'content',
      args: {
        id: 123
      }
    }))).toMatchSnapshot();
  });
  it('should handle a config source with an invalid section', async () => {
    expect((await context.dataSources.FeatureFeed.getFeed({
      type: 'apollosConfig',
      args: {
        section: 'INVALID'
      }
    }))).toMatchSnapshot();
  });
  it('should handle a config source with no section', async () => {
    expect((await context.dataSources.FeatureFeed.getFeed({
      type: 'apollosConfig'
    }))).toMatchSnapshot();
  });
});
//# sourceMappingURL=FeatureFeed.tests.js.map