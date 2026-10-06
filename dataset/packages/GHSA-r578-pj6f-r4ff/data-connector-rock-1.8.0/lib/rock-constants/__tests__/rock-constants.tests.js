"use strict";

var _apolloServerEnv = require("apollo-server-env");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _index = require("../index");

var _testUtils = require("../../test-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_config.default.loadJs({
  ROCK_MAPPINGS: {
    INTERACTIONS: {
      CHANNEL_NAME: 'Apollos App',
      COMPONENT_NAME: 'Apollos Content Item',
      CHANNEL_MEDIUM_TYPE_ID: 512
    },
    ENTITY_TYPES: {
      ApollosGroup: 'Group'
    }
  }
});

let context;
describe('RockConstants', () => {
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    context = {
      dataSources: {
        Cache: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
  });
  it("creates a content item Channel if it doesn't exist", async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101
    }, dataSource);
    dataSource.get = (0, _testUtils.buildGetMock)([[], {
      Id: 1
    }], dataSource);
    dataSource.post = (0, _testUtils.buildGetMock)('1', dataSource);
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101,
      friendlyName: 'Content Channel Item'
    }, dataSource);
    const result = await dataSource.contentItemInteractionChannel();
    expect(result).toMatchSnapshot();
    expect(dataSource.modelType.mock.calls).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
    expect(dataSource.post.mock.calls).toMatchSnapshot();
  });
  it('creates a content item Component w/ InteractionChannelId on new rock versions', async () => {
    _config.default.loadJs({
      ROCK: {
        VERSION: 11.0
      }
    });

    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101,
      friendlyName: 'Content Channel Item'
    }, dataSource);
    dataSource.get = (0, _testUtils.buildGetMock)([[], {
      Id: 1
    }], dataSource);
    dataSource.post = (0, _testUtils.buildGetMock)('1', dataSource);
    const result = await dataSource.contentItemInteractionComponent({
      contentItemId: 7,
      contentTitle: 'Some Title'
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.modelType.mock.calls).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
    expect(dataSource.post.mock.calls).toMatchSnapshot();

    _config.default.loadJs({
      ROCK: {
        VERSION: 9.4
      }
    });
  });
  it('finds the content item Channel if it exists', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    dataSource.post = jest.fn();
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101,
      friendlyName: 'Content Channel Item'
    }, dataSource);
    const result = await dataSource.contentItemInteractionChannel();
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
    expect(dataSource.post.mock.calls.length).toBe(0);
  });
  it("creates a content item Component if it doesn't exist", async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101,
      friendlyName: 'Content Channel Item'
    }, dataSource);
    dataSource.get = (0, _testUtils.buildGetMock)([[], {
      Id: 1
    }], dataSource);
    dataSource.post = (0, _testUtils.buildGetMock)('1', dataSource);
    const result = await dataSource.contentItemInteractionComponent({
      contentItemId: 7,
      contentTitle: 'Some Title'
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.modelType.mock.calls).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
    expect(dataSource.post.mock.calls).toMatchSnapshot();
    expect(context.dataSources.Cache.get.mock.calls).toMatchSnapshot('cache get');
    expect(context.dataSources.Cache.set.mock.calls).toMatchSnapshot('cache set');
  });
  it('finds the content item Component if it exists', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    dataSource.post = jest.fn();
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101,
      friendlyName: 'Content Channel Item'
    }, dataSource);
    const result = await dataSource.contentItemInteractionComponent({
      contentItemId: 7,
      contentTitle: 'Some Title'
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
    expect(dataSource.post.mock.calls.length).toBe(0);
    expect(context.dataSources.Cache.get.mock.calls).toMatchSnapshot('cache get');
    expect(context.dataSources.Cache.set.mock.calls).toMatchSnapshot('cache set');
  });
  it('pulls the item component from the cache, when it exists', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    context.dataSources.Cache.get = jest.fn(() => JSON.stringify({
      id: '123'
    }));
    dataSource.get = jest.fn();
    dataSource.post = jest.fn();
    dataSource.modelType = (0, _testUtils.buildGetMock)({
      id: 101,
      friendlyName: 'Content Channel Item'
    }, dataSource);
    const result = await dataSource.contentItemInteractionComponent({
      contentItemId: 7,
      contentTitle: 'Some Title'
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
    expect(dataSource.post.mock.calls.length).toBe(0);
    expect(context.dataSources.Cache.get.mock.calls).toMatchSnapshot('cache get');
    expect(context.dataSources.Cache.set.mock.calls).toMatchSnapshot('cache set');
  });
  it('finds a ContentItem model ID', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    const result = await dataSource.modelType('ContentItem');
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('finds a custom entity model ID', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    const result = await dataSource.modelType('ApollosGroup');
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('finds a model ID for an item not using ContentChannelItem', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    const result = await dataSource.modelType('DevotionalContentItem');
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('finds a UniversalContentItem model ID', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    const result = await dataSource.modelType('UniversalContentItem');
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('Throws when finding an unknown model ', () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 1
    }], dataSource);
    const prom = dataSource.modelType('IDontExist');
    expect(prom).rejects.toEqual(new Error('IDontExist has not been mapped into a Rock type!'));
  });
  it('Returns null if model type not found ', async () => {
    const dataSource = new _index.dataSource();
    dataSource.context = context;
    dataSource.get = (0, _testUtils.buildGetMock)([], dataSource);
    const result = await dataSource.modelType('ContentItem');
    expect(result).toEqual(null);
  });
});
//# sourceMappingURL=rock-constants.tests.js.map