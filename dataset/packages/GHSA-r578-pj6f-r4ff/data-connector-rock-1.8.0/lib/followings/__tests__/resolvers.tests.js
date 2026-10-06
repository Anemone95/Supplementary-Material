"use strict";

var _graphql = require("graphql");

var _apolloServerEnv = require("apollo-server-env");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _serverCore = require("@apollosproject/server-core");

var _apolloServer = require("apollo-server");

var _lodash = require("lodash");

var _dataSchema = require("@apollosproject/data-schema");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _auth = require("../../auth");

var Followings = _interopRequireWildcard(require("../index"));

var RockConstants = _interopRequireWildcard(require("../../rock-constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ContentItemDataSource {
  // eslint-disable-next-line class-methods-use-this
  initialize() {} // eslint-disable-next-line class-methods-use-this


  getFromId(id) {
    return {
      id
    };
  } // eslint-disable-next-line class-methods-use-this


  getFromIds(ids) {
    return {
      get: () => ids.map(id => ({
        id
      }))
    };
  }

}

class AuthDataSource {
  initialize({
    context
  }) {
    this.context = context;
  }

  getCurrentPerson() {
    if (this.context.currentPerson) {
      return {
        id: 'someId'
      };
    }

    throw new _apolloServer.AuthenticationError('Must be logged in');
  }

}

const ContentItem = {
  dataSource: ContentItemDataSource,
  resolver: {
    ContentItem: {
      __resolveType: () => 'UniversalContentItem'
    },
    UniversalContentItem: {
      id: ({
        id
      }) => (0, _serverCore.createGlobalId)(id, 'UniversalContentItem')
    }
  }
};

class Cache {
  constructor() {
    _defineProperty(this, "get", jest.fn(() => Promise.resolve(null)));

    _defineProperty(this, "set", jest.fn(() => Promise.resolve(null)));

    _defineProperty(this, "increment", jest.fn(() => Promise.resolve(null)));

    _defineProperty(this, "decrement", jest.fn(() => Promise.resolve(null)));
  }

  initialize({
    context
  }) {
    this.context = context;
  }

}

const Auth = {
  dataSource: AuthDataSource,
  contextMiddleware: ({
    req,
    context
  }) => {
    if ((0, _lodash.get)(req, 'headers.authorization')) {
      return { ...context,
        currentPerson: true
      };
    }

    return { ...context
    };
  }
};
const {
  getSchema,
  getContext
} = (0, _testUtils.createTestHelpers)({
  Followings,
  RockConstants,
  ContentItem,
  UniversalContentItem: ContentItem,
  Auth,
  Cache: {
    dataSource: Cache
  }
});

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx'
  },
  ROCK_MAPPINGS: {
    SERIES_CONTENT_CHANNEL_TYPE_IDS: [6, 7],
    CONTENT_ITEM_TYPES: ['ContentItem', 'UniversalContentItem', 'DevotionalContentItem', 'MediaContentItem']
  },
  APP: {
    DEEP_LINK_HOST: 'apolloschurch'
  }
});

describe('Following', () => {
  let schema;
  let context;
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    _apolloServerEnv.fetch.mockRockDataSourceAPI();

    schema = getSchema([_dataSchema.contentItemSchema, _dataSchema.contentChannelSchema, _dataSchema.themeSchema, _dataSchema.scriptureSchema]);
    const token = (0, _auth.generateToken)({
      cookie: 'some-cookie',
      sessionId: 123
    });
    context = getContext({
      req: {
        headers: {
          authorization: token
        }
      }
    });
  });
  it('likes an entity', async () => {
    const query = `
      mutation likeEntity {
        updateLikeEntity(
          input: {
            nodeId: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}"
            operation: Like
          }
        ) {
          id
          isLiked
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('likes a node', async () => {
    const query = `
      mutation likeEntity {
        updateLikeEntity(
          input: {
            nodeId: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}"
            operation: Like
          }
        ) {
          id
          ... on LikableNode {
            isLiked
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('unlikes an entity', async () => {
    const query = `
      mutation likeEntity {
        updateLikeEntity(
          input: {
            nodeId: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}"
            operation: Unlike
          }
        ) {
          id
          isLiked
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('uses following table to track if a user liked content', async () => {
    const query = `
      query getContent {
        node(id: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}") {
          id
          ... on ContentItem {
            isLiked
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(context.dataSources.Cache.set.mock.calls).toMatchSnapshot();
  });
  it('uses following cache to track if a user liked content, if present', async () => {
    const query = `
      query getContent {
        node(id: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}") {
          id
          ... on ContentItem {
            isLiked
          }
        }
      }
    `;
    context.dataSources.Cache.get = jest.fn(() => Promise.resolve(false));
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(context.dataSources.Cache.get.mock.calls).toMatchSnapshot(); // Reset mock.

    context.dataSources.Cache.get = jest.fn(() => Promise.resolve());
  });
  it('returns isLiked false if a user is logged out', async () => {
    const query = `
      query getContent {
        node(id: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}") {
          id
          ... on ContentItem {
            isLiked
          }
        }
      }
    `;
    const contextWithoutUser = getContext();
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, contextWithoutUser);
    expect(result).toMatchSnapshot();
  });
  it('returns a likeCount', async () => {
    const query = `
      query getContent {
        node(id: "${(0, _serverCore.createGlobalId)(1, 'UniversalContentItem')}") {
          id
          ... on ContentItem {
            likedCount
          }
        }
      }
    `;
    const contextWithoutUser = getContext();
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, contextWithoutUser);
    expect(result).toMatchSnapshot();
  });
  it('gets all user liked content', async () => {
    const query = `
      query {
        likedContent {
          edges {
            node {
              id
              isLiked
            }
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('returns an empty array for liked content without a user logged in', async () => {
    const query = `
      query {
        likedContent {
          edges {
            node {
              id
              isLiked
            }
          }
        }
      }
    `;
    const contextWithoutUser = getContext();
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, contextWithoutUser);
    expect(result).toMatchSnapshot();
  });
});
//# sourceMappingURL=resolvers.tests.js.map