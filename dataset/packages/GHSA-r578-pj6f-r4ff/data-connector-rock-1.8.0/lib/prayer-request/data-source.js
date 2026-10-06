"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  ROCK,
  ROCK_MAPPINGS
} = _config.default;

class PrayerRequest extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'PrayerRequests');

    _defineProperty(this, "expanded", true);

    _defineProperty(this, "getFromId", id => this.request().find(id).get());

    _defineProperty(this, "byDailyPrayerFeed", async ({
      numberDaysSincePrayer = 3
    }) => {
      const {
        dataSources: {
          Auth
        }
      } = this.context;
      const {
        primaryAliasId
      } = await Auth.getCurrentPerson();
      return this.request().filter(`RequestedByPersonAliasId ${'ne'} ${primaryAliasId}`) // don't show your own prayers
      .andFilter(`IsActive eq true`) // prayers can be marked as "in-active" in Rock
      .andFilter(`IsApproved eq true`) // prayers can be moderated in Rock
      .andFilter('IsPublic eq true') // prayers can be set to private in Rock
      .andFilter( // prayers that aren't expired
      `ExpirationDate gt datetime'${_momentTimezone.default.tz(ROCK.TIMEZONE).format()}' or ExpirationDate eq null`).andFilter( // prayers that were entered less then x days ago
      `EnteredDateTime gt datetime'${_momentTimezone.default.tz(ROCK.TIMEZONE).subtract(numberDaysSincePrayer, 'day').format()}' or PrayerCount eq null` // include prayers that haven't prayed yet and within x number of days old
      ).andFilter(`Answer eq null or Answer eq ''`) // prayers that aren't answered
      .sort([{
        field: 'PrayerCount',
        direction: 'asc'
      }, // # of times prayed, ascending
      {
        field: 'EnteredDateTime',
        direction: 'asc'
      }]);
    });

    _defineProperty(this, "incrementPrayed", async id => {
      this.put(`PrayerRequests/Prayed/${id}`, {}); // now see if we need to send a push notification informing author
      // that someone prayed for them

      const {
        Cache
      } = this.context.dataSources;
      const hasPrayed = await Cache.get({
        key: `prayer:hasPrayed:${id}`
      });
      if (hasPrayed) return;
      const prayer = await this.getFromId(id);

      if (prayer.prayerCount <= 1) {
        this.sendPrayingNotification(prayer);
      }

      await Cache.set({
        key: `prayer:hasPrayed:${id}`,
        data: true
      });
    });

    _defineProperty(this, "sendPrayingNotification", async ({
      requestedByPersonAliasId
    }) => {
      const notificationText = (0, _lodash.get)(_config.default, 'NOTIFICATIONS.PRAYING', 'The community is praying for you right now.');
      const {
        OneSignal
      } = this.context.dataSources;
      if (!OneSignal) return; // todo: support other push providers

      OneSignal.createNotification({
        toUserIds: [requestedByPersonAliasId],
        content: notificationText
      });
    });

    _defineProperty(this, "flag", async id => this.put(`PrayerRequests/Flag/${id}`, {}));

    _defineProperty(this, "addPrayer", async ({
      text,
      isAnonymous
    }) => {
      const {
        dataSources: {
          Auth
        }
      } = this.context;
      const {
        primaryAliasId,
        nickName,
        firstName,
        lastName,
        email,
        primaryCampusId
      } = await Auth.getCurrentPerson();
      const prayerId = await this.post('/PrayerRequests', {
        FirstName: nickName || firstName,
        LastName: lastName,
        Email: email,
        Text: text,
        Answer: '',
        CategoryId: ROCK_MAPPINGS.GENERAL_PRAYER_CATEGORY_ID,
        CampusId: primaryCampusId || ROCK_MAPPINGS.WEB_CAMPUS_ID,
        IsPublic: !isAnonymous,
        RequestedByPersonAliasId: primaryAliasId,
        CreatedByPersonAliasId: primaryAliasId,
        IsApproved: true,
        IsActive: true,
        AllowComments: false,
        IsUrgent: false,
        EnteredDateTime: (0, _momentTimezone.default)().tz(ROCK.TIMEZONE).format(),
        ApprovedOnDateTime: (0, _momentTimezone.default)().tz(ROCK.TIMEZONE).format(),
        ExpirationDate: (0, _momentTimezone.default)().tz(ROCK.TIMEZONE).add(2, 'weeks').format()
      });
      return this.getFromId(prayerId);
    });
  }

}

exports.default = PrayerRequest;
//# sourceMappingURL=data-source.js.map