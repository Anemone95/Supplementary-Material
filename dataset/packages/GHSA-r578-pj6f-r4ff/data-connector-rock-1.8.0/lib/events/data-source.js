"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Event extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'EventItemOccurrences');

    _defineProperty(this, "expanded", true);

    _defineProperty(this, "getFromId", id => this.request().filter(`Id eq ${id}`).expand('Schedule').first());

    _defineProperty(this, "getByCampus", id => this.findRecent().cache({
      ttl: 60
    }).filter(`CampusId eq ${id}`).get());

    _defineProperty(this, "findRecent", () => {
      let request = this.request();

      if (!(0, _lodash.get)(_config.default, 'ROCK.USE_PLUGIN', false)) {
        console.warn('Fetching public campuses is not possible without the Apollos Plugin\n\nReturning all campuses.');
      } else {
        request = this.request(`Apollos/GetEventItemOccurencesByCalendarId?id=${1}`);
      }

      return request.cache({
        ttl: 60
      }).expand('Schedule').orderBy('Schedule/EffectiveStartDate').filter('Schedule/EffectiveStartDate ne null');
    });

    _defineProperty(this, "getName", async ({
      eventItemId
    }) => {
      const event = await this.request('EventItems').cache({
        ttl: 60
      }).find(eventItemId).get();
      return event.name;
    });

    _defineProperty(this, "getDescription", async ({
      eventItemId
    }) => {
      const event = await this.request('EventItems').cache({
        ttl: 60
      }).find(eventItemId).get();
      return event.description;
    });

    _defineProperty(this, "getImage", async ({
      eventItemId
    }) => {
      const event = await this.request('EventItems').cache({
        ttl: 60
      }).find(eventItemId).get();
      const imageUrl = await this.context.dataSources.BinaryFiles.findOrReturnImageUrl({
        id: event.photoId
      });

      if (imageUrl) {
        return {
          sources: [{
            uri: imageUrl
          }]
        };
      }

      return null;
    });

    _defineProperty(this, "getDateTime", schedule => {
      const iCal = schedule.iCalendarContent;
      const dateTimes = iCal.match(/DTEND:(\w+).*DTSTART:(\w+)/s);
      return {
        start: _momentTimezone.default.tz(dateTimes[2], _config.default.ROCK.TIMEZONE).utc().format(),
        end: _momentTimezone.default.tz(dateTimes[1], _config.default.ROCK.TIMEZONE).utc().format()
      };
    });
  }

}

exports.default = Event;
//# sourceMappingURL=data-source.js.map