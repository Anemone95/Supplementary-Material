"use strict";

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _apolloServerEnv = require("apollo-server-env");

var _index = require("../index");

var _dataSource = _interopRequireDefault(require("./data-source"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  getContext
} = (0, _testUtils.createTestHelpers)({
  Person: _index.Person,
  Auth: _index.Auth,
  Template: {
    dataSource: _dataSource.default
  }
});
describe('Template (Lava) Data Source', () => {
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    _apolloServerEnv.fetch.mockRockDataSourceAPI();
  });
  it('renders a template', async () => {
    const context = getContext();
    context.userToken = 'some-token';
    context.rockCookie = 'some-cookie';
    const result = await context.dataSources.Template.renderTemplate({
      template: '{{ someLavaCode }}'
    });
    expect(result).toMatchSnapshot();
  });
  it('requires a currentPerson', async () => {
    const context = getContext();
    const result = context.dataSources.Template.renderTemplate({
      template: '{{ someLavaCode }}'
    });
    expect(result).rejects.toMatchSnapshot();
  });
  it('accepts a currentPersonId argument', async () => {
    const context = getContext();
    const result = await context.dataSources.Template.renderTemplate({
      template: '{{ someLavaCode }}',
      currentPersonId: 5
    });
    expect(result).toMatchSnapshot();
  });
});
//# sourceMappingURL=data-source.tests.js.map