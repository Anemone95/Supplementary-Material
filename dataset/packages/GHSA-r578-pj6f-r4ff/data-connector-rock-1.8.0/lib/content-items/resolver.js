"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultContentItemResolvers = void 0;

var _lodash = require("lodash");

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _serverCore = require("@apollosproject/server-core");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _sanitizeHtml = _interopRequireDefault(require("../sanitize-html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable prefer-template */
const {
  ROCK,
  ROCK_MAPPINGS
} = _config.default;
const defaultContentItemResolvers = {
  id: ({
    id
  }, args, context, {
    parentType
  }) => (0, _serverCore.createGlobalId)(id, parentType.name),
  htmlContent: ({
    content
  }) => (0, _sanitizeHtml.default)(content),
  childContentItemsConnection: async ({
    id
  }, args, {
    dataSources
  }) => dataSources.ContentItem.paginate({
    cursor: await dataSources.ContentItem.getCursorByParentContentItemId(id),
    args
  }),
  title: ({
    title
  }, {
    hyphenated
  }, {
    dataSources
  }) => hyphenated ? dataSources.ContentItem.createHyphenatedString({
    text: title
  }) : title,
  parentChannel: ({
    contentChannel,
    contentChannelId
  }, args, {
    dataSources
  }) => contentChannel || dataSources.ContentChannel.getFromId(contentChannelId),
  siblingContentItemsConnection: async ({
    id
  }, args, {
    dataSources
  }) => dataSources.ContentItem.paginate({
    cursor: await dataSources.ContentItem.getCursorBySiblingContentItemId(id),
    args
  }),
  summary: (root, args, {
    dataSources: {
      ContentItem
    }
  }) => ContentItem.createSummary(root),
  images: (root, args, {
    dataSources: {
      ContentItem
    }
  }) => ContentItem.getImages(root),
  videos: (root, args, {
    dataSources: {
      ContentItem
    }
  }) => ContentItem.getVideos(root),
  audios: (root, args, {
    dataSources: {
      ContentItem
    }
  }) => ContentItem.getAudios(root),
  coverImage: (root, args, {
    dataSources: {
      ContentItem
    }
  }) => ContentItem.getCoverImage(root),
  publishDate: ({
    startDateTime
  }) => _momentTimezone.default.tz(startDateTime, ROCK.TIMEZONE).format(),
  theme: () => null,
  // todo: integrate themes from Rock
  sharing: (root, args, {
    dataSources: {
      ContentItem
    }
  }) => ({
    url: ContentItem.getShareUrl({
      contentId: root.id,
      channelId: root.contentChannelId
    }),
    title: 'Share via ...',
    message: `${root.title} - ${ContentItem.createSummary(root)}`
  })
};
exports.defaultContentItemResolvers = defaultContentItemResolvers;
const resolver = {
  Query: {
    campaigns: (root, args, {
      dataSources
    }) => dataSources.ContentItem.paginate({
      cursor: dataSources.ContentItem.byContentChannelIds(ROCK_MAPPINGS.CAMPAIGN_CHANNEL_IDS),
      args
    }),
    userFeed: (root, args, {
      dataSources
    }) => dataSources.ContentItem.paginate({
      cursor: dataSources.ContentItem.byUserFeed(),
      args
    }),
    personaFeed: async (root, args, {
      dataSources
    }) => {
      const personaFeed = await dataSources.ContentItem.byPersonaFeed(args.first);
      return dataSources.ContentItem.paginate({
        cursor: personaFeed,
        args
      });
    }
  },
  DevotionalContentItem: { ...defaultContentItemResolvers,
    scriptures: ({
      attributeValues
    }, args, {
      dataSources
    }) => {
      const reference = (0, _lodash.get)(attributeValues, 'scriptures.value');

      if (reference && reference != null) {
        return dataSources.Scripture.getScriptures(reference);
      }

      return null;
    }
  },
  UniversalContentItem: { ...defaultContentItemResolvers
  },
  ContentSeriesContentItem: { ...defaultContentItemResolvers,
    upNext: (root, args, {
      dataSources
    }) => dataSources.ContentItem.getUpNext(root),
    percentComplete: (root, args, {
      dataSources
    }) => dataSources.ContentItem.getPercentComplete(root)
  },
  MediaContentItem: { ...defaultContentItemResolvers
  },
  WeekendContentItem: { ...defaultContentItemResolvers,
    liveStream: async (root, args, {
      dataSources: {
        ContentItem,
        LiveStream
      }
    }) => ({ ...(await LiveStream.getLiveStream()),
      // TODO: Wish there was a better way to inherit these defaults from the LiveStream module.
      isLive: await ContentItem.isContentActiveLiveStream(root) // We need to override the global IsLive with an IsLive that is contextual to a ContentItem

    })
  },
  ContentItem: { ...defaultContentItemResolvers,
    __resolveType: (root, {
      dataSources: {
        ContentItem
      }
    }) => ContentItem.resolveType(root)
  },
  ContentItemsConnection: {
    totalCount: ({
      getTotalCount
    }) => getTotalCount(),
    pageInfo: _serverCore.withEdgePagination
  }
};
var _default = resolver;
exports.default = _default;
//# sourceMappingURL=resolver.js.map