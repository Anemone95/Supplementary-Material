"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  ROCK_MAPPINGS
} = _config.default;

class ContentChannel extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'ContentChannels');

    _defineProperty(this, "all", () => this.request().expand('ChildContentChannels').get());

    _defineProperty(this, "getRootChannels", async () => {
      const channels = await this.request().filter(ROCK_MAPPINGS.DISCOVER_CONTENT_CHANNEL_IDS.map(channelId => `(Id eq ${channelId})`).join(' or ')).cache({
        ttl: 5
      }).get();
      const sortOrder = ROCK_MAPPINGS.DISCOVER_CONTENT_CHANNEL_IDS; // Sort order could be undefined or have no ids. There's no reason to iterate in this case.

      if (!sortOrder || (0, _lodash.isEmpty)(sortOrder)) {
        return channels;
      } // Setup a result array.


      const result = [];
      sortOrder.forEach(configId => {
        // Remove the matched element from the channel list.
        const channel = channels.splice(channels.findIndex(({
          id
        }) => id === configId), 1); // And then push it (or nothing) to the end of the result array.

        result.push(...channel);
      }); // Return results and any left over channels.

      return [...result, ...channels];
    });

    _defineProperty(this, "getFromId", id => this.request().filter(`Id eq ${id}`).expand('ChildContentChannels').first());
  }

}

exports.default = ContentChannel;
//# sourceMappingURL=data-source.js.map