"use strict";

var _graphql = require("graphql");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _dataSchema = require("@apollosproject/data-schema");

var Event = _interopRequireWildcard(require("../index"));

var _index2 = require("../../index");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const {
  getSchema,
  getContext
} = (0, _testUtils.createTestHelpers)({
  Event,
  Campus: _index2.Campus
});
describe('Events resolver', () => {
  let schema;
  let context;
  let rootValue;
  beforeEach(() => {
    schema = getSchema([_dataSchema.campusSchema, _dataSchema.peopleSchema]);
    context = getContext();
    rootValue = {};
  });
  it('gets events by campus', async () => {
    const query = `
      query {
        campuses {
          events {
            id
            name
            location
            start
            end
          }
        }
      }
    `;
    context.dataSources.Campus.getByLocation = jest.fn(() => Promise.resolve([{
      id: 1
    }]));
    context.dataSources.Event.getByCampus = jest.fn(() => Promise.resolve([{
      id: 1,
      campusId: 1,
      scheduleId: 1,
      location: '123 Main St'
    }]));
    context.dataSources.Event.getName = jest.fn(() => Promise.resolve('Cookout')); // for testing the getDateTime datasource function...

    context.dataSources.Event.request = () => ({
      filter: () => ({
        first: () => Promise.resolve({
          iCalendarContent: 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTEND:20130501T190000\r\nDTSTART:20130501T180000\r\nRRULE:FREQ=WEEKLY;BYDAY=SA\r\nEND:VEVENT\r\nEND:VCALENDAR'
        })
      })
    });

    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
});
//# sourceMappingURL=resolver.test.js.map