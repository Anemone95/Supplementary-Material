"use strict";

var _graphql = require("graphql");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _dataSchema = require("@apollosproject/data-schema");

var Group = _interopRequireWildcard(require("../index"));

var _index2 = require("../../index");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const {
  getSchema,
  getContext
} = (0, _testUtils.createTestHelpers)({
  Group,
  Auth: _index2.Auth
});
describe('Groups resolver', () => {
  let schema;
  let context;
  let rootValue;
  beforeEach(() => {
    schema = getSchema([_dataSchema.authSchema, _dataSchema.peopleSchema]);
    context = getContext();
    rootValue = {};
  });
  it('gets user groups', async () => {
    const query = `
      query {
        currentUser {
          profile {
            groups {
              id
              name
              leaders {
                id
                firstName
              }
              members {
                id
                firstName
              }
            }
          }
        }
      }
    `;
    context.dataSources.Auth.getCurrentPerson = jest.fn(() => Promise.resolve({
      id: 3
    }));
    context.dataSources.Group.getByPerson = jest.fn(() => Promise.resolve([{
      id: 1,
      name: 'franks beer group'
    }]));
    context.dataSources.Group.getLeaders = jest.fn(() => Promise.resolve([{
      id: 1,
      firstName: 'Frank'
    }, {
      id: 2,
      firstName: 'Michael'
    }]));
    context.dataSources.Group.getMembers = jest.fn(() => Promise.resolve([{
      id: 2,
      firstName: 'Caleb'
    }, {
      id: 3,
      firstName: 'Burke'
    }]));
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
});
//# sourceMappingURL=resolver.test.js.map