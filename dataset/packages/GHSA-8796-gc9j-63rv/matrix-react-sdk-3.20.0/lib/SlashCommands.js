"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCommandString = parseCommandString;
exports.getCommand = getCommand;
exports.CommandMap = exports.Commands = exports.Command = exports.CommandCategories = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var ContentHelpers = _interopRequireWildcard(require("matrix-js-sdk/src/content-helpers"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("./index"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _MultiInviter = _interopRequireDefault(require("./utils/MultiInviter"));

var _HtmlUtils = require("./HtmlUtils");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _colour = require("./utils/colour");

var _UserAddress = require("./UserAddress");

var _UrlUtils = require("./utils/UrlUtils");

var _IdentityServerUtils = require("./utils/IdentityServerUtils");

var _Permalinks = require("./utils/permalinks/Permalinks");

var _RoomInvite = require("./RoomInvite");

var _WidgetType = require("./widgets/WidgetType");

var _Jitsi = require("./widgets/Jitsi");

var _parse = require("parse5");

var _BugReportDialog = _interopRequireDefault(require("./components/views/dialogs/BugReportDialog"));

var _createRoom = require("./createRoom");

var _actions = require("./dispatcher/actions");

var _membership = require("./utils/membership");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _UIFeature = require("./settings/UIFeature");

var _effects = require("./effects");

var _CallHandler = _interopRequireDefault(require("./CallHandler"));

var _Rooms = require("./Rooms");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const singleMxcUpload = async () =>
/*: Promise<any>*/
{
  return new Promise(resolve => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');

    fileSelector.onchange = (ev
    /*: HTMLInputEvent*/
    ) => {
      const file = ev.target.files[0];
      const UploadConfirmDialog = sdk.getComponent("dialogs.UploadConfirmDialog");

      _Modal.default.createTrackedDialog('Upload Files confirmation', '', UploadConfirmDialog, {
        file,
        onFinished: shouldContinue => {
          resolve(shouldContinue ? _MatrixClientPeg.MatrixClientPeg.get().uploadContent(file) : null);
        }
      });
    };

    fileSelector.click();
  });
};

const CommandCategories = {
  "messages": (0, _languageHandler._td)("Messages"),
  "actions": (0, _languageHandler._td)("Actions"),
  "admin": (0, _languageHandler._td)("Admin"),
  "advanced": (0, _languageHandler._td)("Advanced"),
  "effects": (0, _languageHandler._td)("Effects"),
  "other": (0, _languageHandler._td)("Other")
};
exports.CommandCategories = CommandCategories;

class Command {
  constructor(opts
  /*: ICommandOpts*/
  ) {
    (0, _defineProperty2.default)(this, "command", void 0);
    (0, _defineProperty2.default)(this, "aliases", void 0);
    (0, _defineProperty2.default)(this, "args", void 0);
    (0, _defineProperty2.default)(this, "description", void 0);
    (0, _defineProperty2.default)(this, "runFn", void 0);
    (0, _defineProperty2.default)(this, "category", void 0);
    (0, _defineProperty2.default)(this, "hideCompletionAfterSpace", void 0);
    (0, _defineProperty2.default)(this, "_isEnabled", void 0);
    this.command = opts.command;
    this.aliases = opts.aliases || [];
    this.args = opts.args || "";
    this.description = opts.description;
    this.runFn = opts.runFn;
    this.category = opts.category || CommandCategories.other;
    this.hideCompletionAfterSpace = opts.hideCompletionAfterSpace || false;
    this._isEnabled = opts.isEnabled;
  }

  getCommand() {
    return `/${this.command}`;
  }

  getCommandWithArgs() {
    return this.getCommand() + " " + this.args;
  }

  run(roomId
  /*: string*/
  , args
  /*: string*/
  ) {
    // if it has no runFn then its an ignored/nop command (autocomplete only) e.g `/me`
    if (!this.runFn) return reject((0, _languageHandler._t)("Command error"));
    return this.runFn.bind(this)(roomId, args);
  }

  getUsage() {
    return (0, _languageHandler._t)('Usage') + ': ' + this.getCommandWithArgs();
  }

  isEnabled() {
    return this._isEnabled ? this._isEnabled() : true;
  }

}

exports.Command = Command;

function reject(error) {
  return {
    error
  };
}

function success(promise
/*: Promise<any>*/
) {
  return {
    promise
  };
}
/* Disable the "unexpected this" error for these commands - all of the run
 * functions are called with `this` bound to the Command instance.
 */


const Commands = [new Command({
  command: 'spoiler',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends the given message as a spoiler'),
  runFn: function (roomId, message) {
    return success(ContentHelpers.makeHtmlMessage(message, `<span data-mx-spoiler>${message}</span>`));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'shrug',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ¯\\_(ツ)_/¯ to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '¯\\_(ツ)_/¯';

    if (args) {
      message = message + ' ' + args;
    }

    return success(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'tableflip',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends (╯°□°）╯︵ ┻━┻ to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '(╯°□°）╯︵ ┻━┻';

    if (args) {
      message = message + ' ' + args;
    }

    return success(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'unflip',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ┬──┬ ノ( ゜-゜ノ) to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '┬──┬ ノ( ゜-゜ノ)';

    if (args) {
      message = message + ' ' + args;
    }

    return success(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'lenny',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ( ͡° ͜ʖ ͡°) to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '( ͡° ͜ʖ ͡°)';

    if (args) {
      message = message + ' ' + args;
    }

    return success(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'plain',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends a message as plain text, without interpreting it as markdown'),
  runFn: function (roomId, messages) {
    return success(ContentHelpers.makeTextMessage(messages));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'html',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends a message as html, without interpreting it as markdown'),
  runFn: function (roomId, messages) {
    return success(ContentHelpers.makeHtmlMessage(messages, messages));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'ddg',
  args: '<query>',
  description: (0, _languageHandler._td)('Searches DuckDuckGo for results'),
  runFn: function () {
    const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog'); // TODO Don't explain this away, actually show a search UI here.

    _Modal.default.createTrackedDialog('Slash Commands', '/ddg is not a command', ErrorDialog, {
      title: (0, _languageHandler._t)('/ddg is not a command'),
      description: (0, _languageHandler._t)('To use it, just wait for autocomplete results to load and tab through them.')
    });

    return success();
  },
  category: CommandCategories.actions,
  hideCompletionAfterSpace: true
}), new Command({
  command: 'upgraderoom',
  args: '<new_version>',
  description: (0, _languageHandler._td)('Upgrades a room to a new version'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(roomId);

      if (!room.currentState.mayClientSendStateEvent("m.room.tombstone", cli)) {
        return reject((0, _languageHandler._t)("You do not have the required permissions to use this command."));
      }

      const RoomUpgradeWarningDialog = sdk.getComponent("dialogs.RoomUpgradeWarningDialog");

      const {
        finished
      } = _Modal.default.createTrackedDialog('Slash Commands', 'upgrade room confirmation', RoomUpgradeWarningDialog, {
        roomId: roomId,
        targetVersion: args
      },
      /*className=*/
      null,
      /*isPriority=*/
      false,
      /*isStatic=*/
      true);

      return success(finished.then(async ([resp]) => {
        if (!resp.continue) return;
        let checkForUpgradeFn;

        try {
          const upgradePromise = cli.upgradeRoom(roomId, args); // We have to wait for the js-sdk to give us the room back so
          // we can more effectively abuse the MultiInviter behaviour
          // which heavily relies on the Room object being available.

          if (resp.invite) {
            checkForUpgradeFn = async newRoom => {
              // The upgradePromise should be done by the time we await it here.
              const {
                replacement_room: newRoomId
              } = await upgradePromise;
              if (newRoom.roomId !== newRoomId) return;
              const toInvite = [...room.getMembersWithMembership("join"), ...room.getMembersWithMembership("invite")].map(m => m.userId).filter(m => m !== cli.getUserId());

              if (toInvite.length > 0) {
                // Errors are handled internally to this function
                await (0, _RoomInvite.inviteUsersToRoom)(newRoomId, toInvite);
              }

              cli.removeListener('Room', checkForUpgradeFn);
            };

            cli.on('Room', checkForUpgradeFn);
          } // We have to await after so that the checkForUpgradesFn has a proper reference
          // to the new room's ID.


          await upgradePromise;
        } catch (e) {
          console.error(e);
          if (checkForUpgradeFn) cli.removeListener('Room', checkForUpgradeFn);
          const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'room upgrade error', ErrorDialog, {
            title: (0, _languageHandler._t)('Error upgrading room'),
            description: (0, _languageHandler._t)('Double check that your server supports the room version chosen and try again.')
          });
        }
      }));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'nick',
  args: '<display_name>',
  description: (0, _languageHandler._td)('Changes your display nickname'),
  runFn: function (roomId, args) {
    if (args) {
      return success(_MatrixClientPeg.MatrixClientPeg.get().setDisplayName(args));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'myroomnick',
  aliases: ['roomnick'],
  args: '<display_name>',
  description: (0, _languageHandler._td)('Changes your display nickname in the current room only'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const ev = cli.getRoom(roomId).currentState.getStateEvents('m.room.member', cli.getUserId());

      const content = _objectSpread(_objectSpread({}, ev ? ev.getContent() : {
        membership: 'join'
      }), {}, {
        displayname: args
      });

      return success(cli.sendStateEvent(roomId, 'm.room.member', content, cli.getUserId()));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'roomavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes the avatar of the current room'),
  runFn: function (roomId, args) {
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      return _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(roomId, 'm.room.avatar', {
        url
      }, '');
    }));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'myroomavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes your avatar in this current room only'),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(roomId);
    const userId = cli.getUserId();
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      const ev = room.currentState.getStateEvents('m.room.member', userId);

      const content = _objectSpread(_objectSpread({}, ev ? ev.getContent() : {
        membership: 'join'
      }), {}, {
        avatar_url: url
      });

      return cli.sendStateEvent(roomId, 'm.room.member', content, userId);
    }));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'myavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes your avatar in all rooms'),
  runFn: function (roomId, args) {
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      return _MatrixClientPeg.MatrixClientPeg.get().setAvatarUrl(url);
    }));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'topic',
  args: '[<topic>]',
  description: (0, _languageHandler._td)('Gets or sets the room topic'),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (args) {
      return success(cli.setRoomTopic(roomId, args));
    }

    const room = cli.getRoom(roomId);
    if (!room) return reject((0, _languageHandler._t)("Failed to set topic"));
    const topicEvents = room.currentState.getStateEvents('m.room.topic', '');
    const topic = topicEvents && topicEvents.getContent().topic;
    const topicHtml = topic ? (0, _HtmlUtils.linkifyAndSanitizeHtml)(topic) : (0, _languageHandler._t)('This room has no topic.');
    const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

    _Modal.default.createTrackedDialog('Slash Commands', 'Topic', InfoDialog, {
      title: room.name,
      description: /*#__PURE__*/React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: topicHtml
        }
      }),
      hasCloseButton: true
    });

    return success();
  },
  category: CommandCategories.admin
}), new Command({
  command: 'roomname',
  args: '<name>',
  description: (0, _languageHandler._td)('Sets the room name'),
  runFn: function (roomId, args) {
    if (args) {
      return success(_MatrixClientPeg.MatrixClientPeg.get().setRoomName(roomId, args));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'invite',
  args: '<user-id> [<reason>]',
  description: (0, _languageHandler._td)('Invites user with given id to current room'),
  runFn: function (roomId, args) {
    if (args) {
      const [address, reason] = args.split(/\s+(.+)/);

      if (address) {
        // We use a MultiInviter to re-use the invite logic, even though
        // we're only inviting one user.
        // If we need an identity server but don't have one, things
        // get a bit more complex here, but we try to show something
        // meaningful.
        let prom = Promise.resolve();

        if ((0, _UserAddress.getAddressType)(address) === 'email' && !_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          const defaultIdentityServerUrl = (0, _IdentityServerUtils.getDefaultIdentityServerUrl)();

          if (defaultIdentityServerUrl) {
            const {
              finished
            } = _Modal.default.createTrackedDialog('Slash Commands', 'Identity server', _QuestionDialog.default, {
              title: (0, _languageHandler._t)("Use an identity server"),
              description: /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Use an identity server to invite by email. " + "Click continue to use the default identity server " + "(%(defaultIdentityServerName)s) or manage in Settings.", {
                defaultIdentityServerName: (0, _UrlUtils.abbreviateUrl)(defaultIdentityServerUrl)
              })),
              button: (0, _languageHandler._t)("Continue")
            });

            prom = finished.then(([useDefault]) => {
              if (useDefault) {
                (0, _IdentityServerUtils.useDefaultIdentityServer)();
                return;
              }

              throw new Error((0, _languageHandler._t)("Use an identity server to invite by email. Manage in Settings."));
            });
          } else {
            return reject((0, _languageHandler._t)("Use an identity server to invite by email. Manage in Settings."));
          }
        }

        const inviter = new _MultiInviter.default(roomId);
        return success(prom.then(() => {
          return inviter.invite([address], reason);
        }).then(() => {
          if (inviter.getCompletionState(address) !== "invited") {
            throw new Error(inviter.getErrorText(address));
          }
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'join',
  aliases: ['j', 'goto'],
  args: '<room-address>',
  description: (0, _languageHandler._td)('Joins room with given address'),
  runFn: function (_, args) {
    if (args) {
      // Note: we support 2 versions of this command. The first is
      // the public-facing one for most users and the other is a
      // power-user edition where someone may join via permalink or
      // room ID with optional servers. Practically, this results
      // in the following variations:
      //   /join #example:example.org
      //   /join !example:example.org
      //   /join !example:example.org altserver.com elsewhere.ca
      //   /join https://matrix.to/#/!example:example.org?via=altserver.com
      // The command also supports event permalinks transparently:
      //   /join https://matrix.to/#/!example:example.org/$something:example.org
      //   /join https://matrix.to/#/!example:example.org/$something:example.org?via=altserver.com
      const params = args.split(' ');
      if (params.length < 1) return reject(this.getUsage());
      let isPermalink = false;

      if (params[0].startsWith("http:") || params[0].startsWith("https:")) {
        // It's at least a URL - try and pull out a hostname to check against the
        // permalink handler
        const parsedUrl = new URL(params[0]);
        const hostname = parsedUrl.host || parsedUrl.hostname; // takes first non-falsey value
        // if we're using a Element permalink handler, this will catch it before we get much further.
        // see below where we make assumptions about parsing the URL.

        if ((0, _Permalinks.isPermalinkHost)(hostname)) {
          isPermalink = true;
        }
      }

      if (params[0][0] === '#') {
        let roomAlias = params[0];

        if (!roomAlias.includes(':')) {
          roomAlias += ':' + _MatrixClientPeg.MatrixClientPeg.get().getDomain();
        }

        _dispatcher.default.dispatch({
          action: 'view_room',
          room_alias: roomAlias,
          auto_join: true,
          _type: "slash_command" // instrumentation

        });

        return success();
      } else if (params[0][0] === '!') {
        const [roomId, ...viaServers] = params;

        _dispatcher.default.dispatch({
          action: 'view_room',
          room_id: roomId,
          opts: {
            // These are passed down to the js-sdk's /join call
            viaServers: viaServers
          },
          via_servers: viaServers,
          // for the rejoin button
          auto_join: true,
          _type: "slash_command" // instrumentation

        });

        return success();
      } else if (isPermalink) {
        const permalinkParts = (0, _Permalinks.parsePermalink)(params[0]); // This check technically isn't needed because we already did our
        // safety checks up above. However, for good measure, let's be sure.

        if (!permalinkParts) {
          return reject(this.getUsage());
        } // If for some reason someone wanted to join a group or user, we should
        // stop them now.


        if (!permalinkParts.roomIdOrAlias) {
          return reject(this.getUsage());
        }

        const entity = permalinkParts.roomIdOrAlias;
        const viaServers = permalinkParts.viaServers;
        const eventId = permalinkParts.eventId;
        const dispatch = {
          action: 'view_room',
          auto_join: true,
          _type: "slash_command" // instrumentation

        };
        if (entity[0] === '!') dispatch["room_id"] = entity;else dispatch["room_alias"] = entity;

        if (eventId) {
          dispatch["event_id"] = eventId;
          dispatch["highlighted"] = true;
        }

        if (viaServers) {
          // For the join
          dispatch["opts"] = {
            // These are passed down to the js-sdk's /join call
            viaServers: viaServers
          }; // For if the join fails (rejoin button)

          dispatch['via_servers'] = viaServers;
        }

        _dispatcher.default.dispatch(dispatch);

        return success();
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'part',
  args: '[<room-address>]',
  description: (0, _languageHandler._td)('Leave room'),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    let targetRoomId;

    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        let roomAlias = matches[1];
        if (roomAlias[0] !== '#') return reject(this.getUsage());

        if (!roomAlias.includes(':')) {
          roomAlias += ':' + cli.getDomain();
        } // Try to find a room with this alias


        const rooms = cli.getRooms();

        for (let i = 0; i < rooms.length; i++) {
          const aliasEvents = rooms[i].currentState.getStateEvents('m.room.aliases');

          for (let j = 0; j < aliasEvents.length; j++) {
            const aliases = aliasEvents[j].getContent().aliases || [];

            for (let k = 0; k < aliases.length; k++) {
              if (aliases[k] === roomAlias) {
                targetRoomId = rooms[i].roomId;
                break;
              }
            }

            if (targetRoomId) break;
          }

          if (targetRoomId) break;
        }

        if (!targetRoomId) return reject((0, _languageHandler._t)('Unrecognised room address:') + ' ' + roomAlias);
      }
    }

    if (!targetRoomId) targetRoomId = roomId;
    return success((0, _membership.leaveRoomBehaviour)(targetRoomId));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'kick',
  args: '<user-id> [reason]',
  description: (0, _languageHandler._td)('Kicks user with given id'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(.*))?$/);

      if (matches) {
        return success(_MatrixClientPeg.MatrixClientPeg.get().kick(roomId, matches[1], matches[3]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'ban',
  args: '<user-id> [reason]',
  description: (0, _languageHandler._td)('Bans user with given id'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(.*))?$/);

      if (matches) {
        return success(_MatrixClientPeg.MatrixClientPeg.get().ban(roomId, matches[1], matches[3]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'unban',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Unbans user with given ID'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        // Reset the user membership to "leave" to unban him
        return success(_MatrixClientPeg.MatrixClientPeg.get().unban(roomId, matches[1]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'ignore',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Ignores a user, hiding their messages from you'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const matches = args.match(/^(@[^:]+:\S+)$/);

      if (matches) {
        const userId = matches[1];
        const ignoredUsers = cli.getIgnoredUsers();
        ignoredUsers.push(userId); // de-duped internally in the js-sdk

        return success(cli.setIgnoredUsers(ignoredUsers).then(() => {
          const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'User ignored', InfoDialog, {
            title: (0, _languageHandler._t)('Ignored user'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('You are now ignoring %(userId)s', {
              userId
            })))
          });
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'unignore',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Stops ignoring a user, showing their messages going forward'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const matches = args.match(/(^@[^:]+:\S+$)/);

      if (matches) {
        const userId = matches[1];
        const ignoredUsers = cli.getIgnoredUsers();
        const index = ignoredUsers.indexOf(userId);
        if (index !== -1) ignoredUsers.splice(index, 1);
        return success(cli.setIgnoredUsers(ignoredUsers).then(() => {
          const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'User unignored', InfoDialog, {
            title: (0, _languageHandler._t)('Unignored user'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('You are no longer ignoring %(userId)s', {
              userId
            })))
          });
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'op',
  args: '<user-id> [<power-level>]',
  description: (0, _languageHandler._td)('Define the power level of a user'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(-?\d+))?$/);
      let powerLevel = 50; // default power level for op

      if (matches) {
        const userId = matches[1];

        if (matches.length === 4 && undefined !== matches[3]) {
          powerLevel = parseInt(matches[3], 10);
        }

        if (!isNaN(powerLevel)) {
          const cli = _MatrixClientPeg.MatrixClientPeg.get();

          const room = cli.getRoom(roomId);
          if (!room) return reject((0, _languageHandler._t)("Command failed"));
          const member = room.getMember(userId);

          if (!member || (0, _membership.getEffectiveMembership)(member.membership) === _membership.EffectiveMembership.Leave) {
            return reject((0, _languageHandler._t)("Could not find user in room"));
          }

          const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
          return success(cli.setPowerLevel(roomId, userId, powerLevel, powerLevelEvent));
        }
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'deop',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Deops user with given id'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const room = cli.getRoom(roomId);
        if (!room) return reject((0, _languageHandler._t)("Command failed"));
        const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
        if (!powerLevelEvent.getContent().users[args]) return reject((0, _languageHandler._t)("Could not find user in room"));
        return success(cli.setPowerLevel(roomId, args, undefined, powerLevelEvent));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'devtools',
  description: (0, _languageHandler._td)('Opens the Developer Tools dialog'),
  runFn: function (roomId) {
    const DevtoolsDialog = sdk.getComponent('dialogs.DevtoolsDialog');

    _Modal.default.createDialog(DevtoolsDialog, {
      roomId
    });

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: 'addwidget',
  args: '<url | embed code | Jitsi url>',
  description: (0, _languageHandler._td)('Adds a custom widget by URL to the room'),
  isEnabled: () => _SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets),
  runFn: function (roomId, widgetUrl) {
    if (!widgetUrl) {
      return reject((0, _languageHandler._t)("Please supply a widget URL or embed code"));
    } // Try and parse out a widget URL from iframes


    if (widgetUrl.toLowerCase().startsWith("<iframe ")) {
      // We use parse5, which doesn't render/create a DOM node. It instead runs
      // some superfast regex over the text so we don't have to.
      const embed = (0, _parse.parseFragment)(widgetUrl);

      if (embed && embed.childNodes && embed.childNodes.length === 1) {
        const iframe = embed.childNodes[0];

        if (iframe.tagName.toLowerCase() === 'iframe' && iframe.attrs) {
          const srcAttr = iframe.attrs.find(a => a.name === 'src');
          console.log("Pulling URL out of iframe (embed code)");
          widgetUrl = srcAttr.value;
        }
      }
    }

    if (!widgetUrl.startsWith("https://") && !widgetUrl.startsWith("http://")) {
      return reject((0, _languageHandler._t)("Please supply a https:// or http:// widget URL"));
    }

    if (_WidgetUtils.default.canUserModifyWidgets(roomId)) {
      const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      const nowMs = new Date().getTime();
      const widgetId = encodeURIComponent(`${roomId}_${userId}_${nowMs}`);
      let type = _WidgetType.WidgetType.CUSTOM;
      let name = "Custom Widget";
      let data = {}; // Make the widget a Jitsi widget if it looks like a Jitsi widget

      const jitsiData = _Jitsi.Jitsi.getInstance().parsePreferredConferenceUrl(widgetUrl);

      if (jitsiData) {
        console.log("Making /addwidget widget a Jitsi conference");
        type = _WidgetType.WidgetType.JITSI;
        name = "Jitsi Conference";
        data = jitsiData;
        widgetUrl = _WidgetUtils.default.getLocalJitsiWrapperUrl();
      }

      return success(_WidgetUtils.default.setRoomWidget(roomId, widgetId, type, widgetUrl, name, data));
    } else {
      return reject((0, _languageHandler._t)("You cannot modify widgets in this room."));
    }
  },
  category: CommandCategories.admin
}), new Command({
  command: 'verify',
  args: '<user-id> <device-id> <device-signing-key>',
  description: (0, _languageHandler._td)('Verifies a user, session, and pubkey tuple'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+) +(\S+) +(\S+)$/);

      if (matches) {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const userId = matches[1];
        const deviceId = matches[2];
        const fingerprint = matches[3];
        return success((async () => {
          const device = cli.getStoredDevice(userId, deviceId);

          if (!device) {
            throw new Error((0, _languageHandler._t)('Unknown (user, session) pair:') + ` (${userId}, ${deviceId})`);
          }

          const deviceTrust = await cli.checkDeviceTrust(userId, deviceId);

          if (deviceTrust.isVerified()) {
            if (device.getFingerprint() === fingerprint) {
              throw new Error((0, _languageHandler._t)('Session already verified!'));
            } else {
              throw new Error((0, _languageHandler._t)('WARNING: Session already verified, but keys do NOT MATCH!'));
            }
          }

          if (device.getFingerprint() !== fingerprint) {
            const fprint = device.getFingerprint();
            throw new Error((0, _languageHandler._t)('WARNING: KEY VERIFICATION FAILED! The signing key for %(userId)s and session' + ' %(deviceId)s is "%(fprint)s" which does not match the provided key ' + '"%(fingerprint)s". This could mean your communications are being intercepted!', {
              fprint,
              userId,
              deviceId,
              fingerprint
            }));
          }

          await cli.setDeviceVerified(userId, deviceId, true); // Tell the user we verified everything

          const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'Verified key', InfoDialog, {
            title: (0, _languageHandler._t)('Verified key'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('The signing key you provided matches the signing key you received ' + 'from %(userId)s\'s session %(deviceId)s. Session marked as verified.', {
              userId,
              deviceId
            })))
          });
        })());
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.advanced
}), new Command({
  command: 'discardsession',
  description: (0, _languageHandler._td)('Forces the current outbound group session in an encrypted room to be discarded'),
  runFn: function (roomId) {
    try {
      _MatrixClientPeg.MatrixClientPeg.get().forceDiscardSession(roomId);
    } catch (e) {
      return reject(e.message);
    }

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "rainbow",
  description: (0, _languageHandler._td)("Sends the given message coloured as a rainbow"),
  args: '<message>',
  runFn: function (roomId, args) {
    if (!args) return reject(this.getUserId());
    return success(ContentHelpers.makeHtmlMessage(args, (0, _colour.textToHtmlRainbow)(args)));
  },
  category: CommandCategories.messages
}), new Command({
  command: "rainbowme",
  description: (0, _languageHandler._td)("Sends the given emote coloured as a rainbow"),
  args: '<message>',
  runFn: function (roomId, args) {
    if (!args) return reject(this.getUserId());
    return success(ContentHelpers.makeHtmlEmote(args, (0, _colour.textToHtmlRainbow)(args)));
  },
  category: CommandCategories.messages
}), new Command({
  command: "help",
  description: (0, _languageHandler._td)("Displays list of commands with usages and descriptions"),
  runFn: function () {
    const SlashCommandHelpDialog = sdk.getComponent('dialogs.SlashCommandHelpDialog');

    _Modal.default.createTrackedDialog('Slash Commands', 'Help', SlashCommandHelpDialog);

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "whois",
  description: (0, _languageHandler._td)("Displays information about a user"),
  args: "<user-id>",
  runFn: function (roomId, userId) {
    if (!userId || !userId.startsWith("@") || !userId.includes(":")) {
      return reject(this.getUsage());
    }

    const member = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId).getMember(userId);

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewUser,
      // XXX: We should be using a real member object and not assuming what the
      // receiver wants.
      member: member || {
        userId
      }
    });

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "rageshake",
  aliases: ["bugreport"],
  description: (0, _languageHandler._td)("Send a bug report with logs"),
  isEnabled: () => !!_SdkConfig.default.get().bug_report_endpoint_url,
  args: "<description>",
  runFn: function (roomId, args) {
    return success(_Modal.default.createTrackedDialog('Slash Commands', 'Bug Report Dialog', _BugReportDialog.default, {
      initialText: args
    }).finished);
  },
  category: CommandCategories.advanced
}), new Command({
  command: "query",
  description: (0, _languageHandler._td)("Opens chat with the given user"),
  args: "<user-id>",
  runFn: function (roomId, userId) {
    // easter-egg for now: look up phone numbers through the thirdparty API
    // (very dumb phone number detection...)
    const isPhoneNumber = userId && /^\+?[0123456789]+$/.test(userId);

    if (!userId || (!userId.startsWith("@") || !userId.includes(":")) && !isPhoneNumber) {
      return reject(this.getUsage());
    }

    return success((async () => {
      if (isPhoneNumber) {
        const results = await _CallHandler.default.sharedInstance().pstnLookup(this.state.value);

        if (!results || results.length === 0 || !results[0].userid) {
          throw new Error("Unable to find Matrix ID for phone number");
        }

        userId = results[0].userid;
      }

      const roomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), userId);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: roomId
      });
    })());
  },
  category: CommandCategories.actions
}), new Command({
  command: "msg",
  description: (0, _languageHandler._td)("Sends a message to the given user"),
  args: "<user-id> <message>",
  runFn: function (_, args) {
    if (args) {
      // matches the first whitespace delimited group and then the rest of the string
      const matches = args.match(/^(\S+?)(?: +(.*))?$/s);

      if (matches) {
        const [userId, msg] = matches.slice(1);

        if (msg && userId && userId.startsWith("@") && userId.includes(":")) {
          return success((async () => {
            const cli = _MatrixClientPeg.MatrixClientPeg.get();

            const roomId = await (0, _createRoom.ensureDMExists)(cli, userId);

            _dispatcher.default.dispatch({
              action: 'view_room',
              room_id: roomId
            });

            cli.sendTextMessage(roomId, msg);
          })());
        }
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: "holdcall",
  description: (0, _languageHandler._td)("Places the call in the current room on hold"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const call = _CallHandler.default.sharedInstance().getCallForRoom(roomId);

    if (!call) {
      return reject("No active call in this room");
    }

    call.setRemoteOnHold(true);
    return success();
  }
}), new Command({
  command: "unholdcall",
  description: (0, _languageHandler._td)("Takes the call in the current room off hold"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const call = _CallHandler.default.sharedInstance().getCallForRoom(roomId);

    if (!call) {
      return reject("No active call in this room");
    }

    call.setRemoteOnHold(false);
    return success();
  }
}), new Command({
  command: "converttodm",
  description: (0, _languageHandler._td)("Converts the room to a DM"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    return success((0, _Rooms.guessAndSetDMRoom)(room, true));
  }
}), new Command({
  command: "converttoroom",
  description: (0, _languageHandler._td)("Converts the DM to a room"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    return success((0, _Rooms.guessAndSetDMRoom)(room, false));
  }
}), // Command definitions for autocompletion ONLY:
// /me is special because its not handled by SlashCommands.js and is instead done inside the Composer classes
new Command({
  command: "me",
  args: '<message>',
  description: (0, _languageHandler._td)('Displays action'),
  category: CommandCategories.messages,
  hideCompletionAfterSpace: true
}), ..._effects.CHAT_EFFECTS.map(effect => {
  return new Command({
    command: effect.command,
    description: effect.description(),
    args: '<message>',
    runFn: function (roomId, args) {
      return success((async () => {
        if (!args) {
          args = effect.fallbackMessage();

          _MatrixClientPeg.MatrixClientPeg.get().sendEmoteMessage(roomId, args);
        } else {
          const content = {
            msgtype: effect.msgType,
            body: args
          };

          _MatrixClientPeg.MatrixClientPeg.get().sendMessage(roomId, content);
        }

        _dispatcher.default.dispatch({
          action: `effects.${effect.command}`
        });
      })());
    },
    category: CommandCategories.effects
  });
})]; // build a map from names and aliases to the Command objects.

exports.Commands = Commands;
const CommandMap = new Map();
exports.CommandMap = CommandMap;
Commands.forEach(cmd => {
  CommandMap.set(cmd.command, cmd);
  cmd.aliases.forEach(alias => {
    CommandMap.set(alias, cmd);
  });
});

function parseCommandString(input
/*: string*/
) {
  // trim any trailing whitespace, as it can confuse the parser for
  // IRC-style commands
  input = input.replace(/\s+$/, '');
  if (input[0] !== '/') return {}; // not a command

  const bits = input.match(/^(\S+?)(?:[ \n]+((.|\n)*))?$/);
  let cmd;
  let args;

  if (bits) {
    cmd = bits[1].substring(1).toLowerCase();
    args = bits[2];
  } else {
    cmd = input;
  }

  return {
    cmd,
    args
  };
}
/**
 * Process the given text for /commands and return a bound method to perform them.
 * @param {string} roomId The room in which the command was performed.
 * @param {string} input The raw text input by the user.
 * @return {null|function(): Object} Function returning an object with the property 'error' if there was an error
 * processing the command, or 'promise' if a request was sent out.
 * Returns null if the input didn't match a command.
 */


function getCommand(input
/*: string*/
) {
  const {
    cmd,
    args
  } = parseCommandString(input);

  if (CommandMap.has(cmd) && CommandMap.get(cmd).isEnabled()) {
    return {
      cmd: CommandMap.get(cmd),
      args
    };
  }

  return {};
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TbGFzaENvbW1hbmRzLnRzeCJdLCJuYW1lcyI6WyJzaW5nbGVNeGNVcGxvYWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZpbGVTZWxlY3RvciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsIm9uY2hhbmdlIiwiZXYiLCJmaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJVcGxvYWRDb25maXJtRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwib25GaW5pc2hlZCIsInNob3VsZENvbnRpbnVlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwidXBsb2FkQ29udGVudCIsImNsaWNrIiwiQ29tbWFuZENhdGVnb3JpZXMiLCJDb21tYW5kIiwiY29uc3RydWN0b3IiLCJvcHRzIiwiY29tbWFuZCIsImFsaWFzZXMiLCJhcmdzIiwiZGVzY3JpcHRpb24iLCJydW5GbiIsImNhdGVnb3J5Iiwib3RoZXIiLCJoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2UiLCJfaXNFbmFibGVkIiwiaXNFbmFibGVkIiwiZ2V0Q29tbWFuZCIsImdldENvbW1hbmRXaXRoQXJncyIsInJ1biIsInJvb21JZCIsInJlamVjdCIsImJpbmQiLCJnZXRVc2FnZSIsImVycm9yIiwic3VjY2VzcyIsInByb21pc2UiLCJDb21tYW5kcyIsIm1lc3NhZ2UiLCJDb250ZW50SGVscGVycyIsIm1ha2VIdG1sTWVzc2FnZSIsIm1lc3NhZ2VzIiwibWFrZVRleHRNZXNzYWdlIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImFjdGlvbnMiLCJjbGkiLCJyb29tIiwiZ2V0Um9vbSIsImN1cnJlbnRTdGF0ZSIsIm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50IiwiUm9vbVVwZ3JhZGVXYXJuaW5nRGlhbG9nIiwiZmluaXNoZWQiLCJ0YXJnZXRWZXJzaW9uIiwidGhlbiIsInJlc3AiLCJjb250aW51ZSIsImNoZWNrRm9yVXBncmFkZUZuIiwidXBncmFkZVByb21pc2UiLCJ1cGdyYWRlUm9vbSIsImludml0ZSIsIm5ld1Jvb20iLCJyZXBsYWNlbWVudF9yb29tIiwibmV3Um9vbUlkIiwidG9JbnZpdGUiLCJnZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAiLCJtYXAiLCJtIiwidXNlcklkIiwiZmlsdGVyIiwiZ2V0VXNlcklkIiwibGVuZ3RoIiwicmVtb3ZlTGlzdGVuZXIiLCJvbiIsImUiLCJjb25zb2xlIiwiYWRtaW4iLCJzZXREaXNwbGF5TmFtZSIsImdldFN0YXRlRXZlbnRzIiwiY29udGVudCIsImdldENvbnRlbnQiLCJtZW1iZXJzaGlwIiwiZGlzcGxheW5hbWUiLCJzZW5kU3RhdGVFdmVudCIsInVybCIsImF2YXRhcl91cmwiLCJzZXRBdmF0YXJVcmwiLCJzZXRSb29tVG9waWMiLCJ0b3BpY0V2ZW50cyIsInRvcGljIiwidG9waWNIdG1sIiwiSW5mb0RpYWxvZyIsIm5hbWUiLCJfX2h0bWwiLCJoYXNDbG9zZUJ1dHRvbiIsInNldFJvb21OYW1lIiwiYWRkcmVzcyIsInJlYXNvbiIsInNwbGl0IiwicHJvbSIsImdldElkZW50aXR5U2VydmVyVXJsIiwiZGVmYXVsdElkZW50aXR5U2VydmVyVXJsIiwiUXVlc3Rpb25EaWFsb2ciLCJkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lIiwiYnV0dG9uIiwidXNlRGVmYXVsdCIsIkVycm9yIiwiaW52aXRlciIsIk11bHRpSW52aXRlciIsImdldENvbXBsZXRpb25TdGF0ZSIsImdldEVycm9yVGV4dCIsIl8iLCJwYXJhbXMiLCJpc1Blcm1hbGluayIsInN0YXJ0c1dpdGgiLCJwYXJzZWRVcmwiLCJVUkwiLCJob3N0bmFtZSIsImhvc3QiLCJyb29tQWxpYXMiLCJpbmNsdWRlcyIsImdldERvbWFpbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwicm9vbV9hbGlhcyIsImF1dG9fam9pbiIsIl90eXBlIiwidmlhU2VydmVycyIsInJvb21faWQiLCJ2aWFfc2VydmVycyIsInBlcm1hbGlua1BhcnRzIiwicm9vbUlkT3JBbGlhcyIsImVudGl0eSIsImV2ZW50SWQiLCJ0YXJnZXRSb29tSWQiLCJtYXRjaGVzIiwibWF0Y2giLCJyb29tcyIsImdldFJvb21zIiwiaSIsImFsaWFzRXZlbnRzIiwiaiIsImsiLCJraWNrIiwiYmFuIiwidW5iYW4iLCJpZ25vcmVkVXNlcnMiLCJnZXRJZ25vcmVkVXNlcnMiLCJwdXNoIiwic2V0SWdub3JlZFVzZXJzIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwicG93ZXJMZXZlbCIsInVuZGVmaW5lZCIsInBhcnNlSW50IiwiaXNOYU4iLCJtZW1iZXIiLCJnZXRNZW1iZXIiLCJFZmZlY3RpdmVNZW1iZXJzaGlwIiwiTGVhdmUiLCJwb3dlckxldmVsRXZlbnQiLCJzZXRQb3dlckxldmVsIiwidXNlcnMiLCJEZXZ0b29sc0RpYWxvZyIsImNyZWF0ZURpYWxvZyIsImFkdmFuY2VkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiV2lkZ2V0cyIsIndpZGdldFVybCIsInRvTG93ZXJDYXNlIiwiZW1iZWQiLCJjaGlsZE5vZGVzIiwiaWZyYW1lIiwidGFnTmFtZSIsImF0dHJzIiwic3JjQXR0ciIsImZpbmQiLCJhIiwibG9nIiwidmFsdWUiLCJXaWRnZXRVdGlscyIsImNhblVzZXJNb2RpZnlXaWRnZXRzIiwibm93TXMiLCJEYXRlIiwiZ2V0VGltZSIsIndpZGdldElkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwidHlwZSIsIldpZGdldFR5cGUiLCJDVVNUT00iLCJkYXRhIiwiaml0c2lEYXRhIiwiSml0c2kiLCJnZXRJbnN0YW5jZSIsInBhcnNlUHJlZmVycmVkQ29uZmVyZW5jZVVybCIsIkpJVFNJIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJzZXRSb29tV2lkZ2V0IiwiZGV2aWNlSWQiLCJmaW5nZXJwcmludCIsImRldmljZSIsImdldFN0b3JlZERldmljZSIsImRldmljZVRydXN0IiwiY2hlY2tEZXZpY2VUcnVzdCIsImlzVmVyaWZpZWQiLCJnZXRGaW5nZXJwcmludCIsImZwcmludCIsInNldERldmljZVZlcmlmaWVkIiwiZm9yY2VEaXNjYXJkU2Vzc2lvbiIsIm1ha2VIdG1sRW1vdGUiLCJTbGFzaENvbW1hbmRIZWxwRGlhbG9nIiwiQWN0aW9uIiwiVmlld1VzZXIiLCJTZGtDb25maWciLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIkJ1Z1JlcG9ydERpYWxvZyIsImluaXRpYWxUZXh0IiwiaXNQaG9uZU51bWJlciIsInRlc3QiLCJyZXN1bHRzIiwiQ2FsbEhhbmRsZXIiLCJzaGFyZWRJbnN0YW5jZSIsInBzdG5Mb29rdXAiLCJzdGF0ZSIsInVzZXJpZCIsIm1zZyIsInNsaWNlIiwic2VuZFRleHRNZXNzYWdlIiwiY2FsbCIsImdldENhbGxGb3JSb29tIiwic2V0UmVtb3RlT25Ib2xkIiwiQ0hBVF9FRkZFQ1RTIiwiZWZmZWN0IiwiZmFsbGJhY2tNZXNzYWdlIiwic2VuZEVtb3RlTWVzc2FnZSIsIm1zZ3R5cGUiLCJtc2dUeXBlIiwiYm9keSIsInNlbmRNZXNzYWdlIiwiZWZmZWN0cyIsIkNvbW1hbmRNYXAiLCJNYXAiLCJmb3JFYWNoIiwiY21kIiwic2V0IiwiYWxpYXMiLCJwYXJzZUNvbW1hbmRTdHJpbmciLCJpbnB1dCIsInJlcGxhY2UiLCJiaXRzIiwic3Vic3RyaW5nIiwiaGFzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQU9BLE1BQU1BLGVBQWUsR0FBRztBQUFBO0FBQTBCO0FBQzlDLFNBQU8sSUFBSUMsT0FBSixDQUFhQyxPQUFELElBQWE7QUFDNUIsVUFBTUMsWUFBWSxHQUFHQyxR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R0FBUDtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU1EsVUFBVCxDQUFvQmdPO0FBQXBCO0FBQUEsRUFBbUM7QUFDdEMsUUFBTTtBQUFDSixJQUFBQSxHQUFEO0FBQU1wTyxJQUFBQTtBQUFOLE1BQWN1TyxrQkFBa0IsQ0FBQ0MsS0FBRCxDQUF0Qzs7QUFFQSxNQUFJUCxVQUFVLENBQUNXLEdBQVgsQ0FBZVIsR0FBZixLQUF1QkgsVUFBVSxDQUFDMU8sR0FBWCxDQUFlNk8sR0FBZixFQUFvQjdOLFNBQXBCLEVBQTNCLEVBQTREO0FBQ3hELFdBQU87QUFDSDZOLE1BQUFBLEdBQUcsRUFBRUgsVUFBVSxDQUFDMU8sR0FBWCxDQUFlNk8sR0FBZixDQURGO0FBRUhwTyxNQUFBQTtBQUZHLEtBQVA7QUFJSDs7QUFDRCxTQUFPLEVBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgQ29udGVudEhlbHBlcnMgZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY29udGVudC1oZWxwZXJzJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7X3QsIF90ZH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IE11bHRpSW52aXRlciBmcm9tICcuL3V0aWxzL011bHRpSW52aXRlcic7XG5pbXBvcnQgeyBsaW5raWZ5QW5kU2FuaXRpemVIdG1sIH0gZnJvbSAnLi9IdG1sVXRpbHMnO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gXCIuL3V0aWxzL1dpZGdldFV0aWxzXCI7XG5pbXBvcnQge3RleHRUb0h0bWxSYWluYm93fSBmcm9tIFwiLi91dGlscy9jb2xvdXJcIjtcbmltcG9ydCB7IGdldEFkZHJlc3NUeXBlIH0gZnJvbSAnLi9Vc2VyQWRkcmVzcyc7XG5pbXBvcnQgeyBhYmJyZXZpYXRlVXJsIH0gZnJvbSAnLi91dGlscy9VcmxVdGlscyc7XG5pbXBvcnQgeyBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwsIHVzZURlZmF1bHRJZGVudGl0eVNlcnZlciB9IGZyb20gJy4vdXRpbHMvSWRlbnRpdHlTZXJ2ZXJVdGlscyc7XG5pbXBvcnQge2lzUGVybWFsaW5rSG9zdCwgcGFyc2VQZXJtYWxpbmt9IGZyb20gXCIuL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHtpbnZpdGVVc2Vyc1RvUm9vbX0gZnJvbSBcIi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuL3dpZGdldHMvV2lkZ2V0VHlwZVwiO1xuaW1wb3J0IHsgSml0c2kgfSBmcm9tIFwiLi93aWRnZXRzL0ppdHNpXCI7XG5pbXBvcnQgeyBwYXJzZUZyYWdtZW50IGFzIHBhcnNlSHRtbCB9IGZyb20gXCJwYXJzZTVcIjtcbmltcG9ydCBCdWdSZXBvcnREaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0J1Z1JlcG9ydERpYWxvZ1wiO1xuaW1wb3J0IHsgZW5zdXJlRE1FeGlzdHMgfSBmcm9tIFwiLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgeyBWaWV3VXNlclBheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdVc2VyUGF5bG9hZFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBFZmZlY3RpdmVNZW1iZXJzaGlwLCBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwLCBsZWF2ZVJvb21CZWhhdmlvdXIgfSBmcm9tIFwiLi91dGlscy9tZW1iZXJzaGlwXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHtDSEFUX0VGRkVDVFN9IGZyb20gXCIuL2VmZmVjdHNcIlxuaW1wb3J0IENhbGxIYW5kbGVyIGZyb20gXCIuL0NhbGxIYW5kbGVyXCI7XG5pbXBvcnQge2d1ZXNzQW5kU2V0RE1Sb29tfSBmcm9tIFwiLi9Sb29tc1wiO1xuXG4vLyBYWFg6IHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMzE4MTZcbmludGVyZmFjZSBIVE1MSW5wdXRFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgICB0YXJnZXQ6IEhUTUxJbnB1dEVsZW1lbnQgJiBFdmVudFRhcmdldDtcbn1cblxuY29uc3Qgc2luZ2xlTXhjVXBsb2FkID0gYXN5bmMgKCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVTZWxlY3RvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGZpbGVTZWxlY3Rvci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnZmlsZScpO1xuICAgICAgICBmaWxlU2VsZWN0b3Iub25jaGFuZ2UgPSAoZXY6IEhUTUxJbnB1dEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0gZXYudGFyZ2V0LmZpbGVzWzBdO1xuXG4gICAgICAgICAgICBjb25zdCBVcGxvYWRDb25maXJtRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuVXBsb2FkQ29uZmlybURpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1VwbG9hZCBGaWxlcyBjb25maXJtYXRpb24nLCAnJywgVXBsb2FkQ29uZmlybURpYWxvZywge1xuICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogKHNob3VsZENvbnRpbnVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc2hvdWxkQ29udGludWUgPyBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudXBsb2FkQ29udGVudChmaWxlKSA6IG51bGwpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBmaWxlU2VsZWN0b3IuY2xpY2soKTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBDb21tYW5kQ2F0ZWdvcmllcyA9IHtcbiAgICBcIm1lc3NhZ2VzXCI6IF90ZChcIk1lc3NhZ2VzXCIpLFxuICAgIFwiYWN0aW9uc1wiOiBfdGQoXCJBY3Rpb25zXCIpLFxuICAgIFwiYWRtaW5cIjogX3RkKFwiQWRtaW5cIiksXG4gICAgXCJhZHZhbmNlZFwiOiBfdGQoXCJBZHZhbmNlZFwiKSxcbiAgICBcImVmZmVjdHNcIjogX3RkKFwiRWZmZWN0c1wiKSxcbiAgICBcIm90aGVyXCI6IF90ZChcIk90aGVyXCIpLFxufTtcblxudHlwZSBSdW5GbiA9ICgocm9vbUlkOiBzdHJpbmcsIGFyZ3M6IHN0cmluZywgY21kOiBzdHJpbmcpID0+IHtlcnJvcjogYW55fSB8IHtwcm9taXNlOiBQcm9taXNlPGFueT59KTtcblxuaW50ZXJmYWNlIElDb21tYW5kT3B0cyB7XG4gICAgY29tbWFuZDogc3RyaW5nO1xuICAgIGFsaWFzZXM/OiBzdHJpbmdbXTtcbiAgICBhcmdzPzogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgcnVuRm4/OiBSdW5GbjtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIGhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZT86IGJvb2xlYW47XG4gICAgaXNFbmFibGVkPygpOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tbWFuZCB7XG4gICAgY29tbWFuZDogc3RyaW5nO1xuICAgIGFsaWFzZXM6IHN0cmluZ1tdO1xuICAgIGFyZ3M6IHVuZGVmaW5lZCB8IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHJ1bkZuOiB1bmRlZmluZWQgfCBSdW5GbjtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIGhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZTogYm9vbGVhbjtcbiAgICBfaXNFbmFibGVkPzogKCkgPT4gYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdHM6IElDb21tYW5kT3B0cykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBvcHRzLmNvbW1hbmQ7XG4gICAgICAgIHRoaXMuYWxpYXNlcyA9IG9wdHMuYWxpYXNlcyB8fCBbXTtcbiAgICAgICAgdGhpcy5hcmdzID0gb3B0cy5hcmdzIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBvcHRzLmRlc2NyaXB0aW9uO1xuICAgICAgICB0aGlzLnJ1bkZuID0gb3B0cy5ydW5GbjtcbiAgICAgICAgdGhpcy5jYXRlZ29yeSA9IG9wdHMuY2F0ZWdvcnkgfHwgQ29tbWFuZENhdGVnb3JpZXMub3RoZXI7XG4gICAgICAgIHRoaXMuaGlkZUNvbXBsZXRpb25BZnRlclNwYWNlID0gb3B0cy5oaWRlQ29tcGxldGlvbkFmdGVyU3BhY2UgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMuX2lzRW5hYmxlZCA9IG9wdHMuaXNFbmFibGVkO1xuICAgIH1cblxuICAgIGdldENvbW1hbmQoKSB7XG4gICAgICAgIHJldHVybiBgLyR7dGhpcy5jb21tYW5kfWA7XG4gICAgfVxuXG4gICAgZ2V0Q29tbWFuZFdpdGhBcmdzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb21tYW5kKCkgKyBcIiBcIiArIHRoaXMuYXJncztcbiAgICB9XG5cbiAgICBydW4ocm9vbUlkOiBzdHJpbmcsIGFyZ3M6IHN0cmluZykge1xuICAgICAgICAvLyBpZiBpdCBoYXMgbm8gcnVuRm4gdGhlbiBpdHMgYW4gaWdub3JlZC9ub3AgY29tbWFuZCAoYXV0b2NvbXBsZXRlIG9ubHkpIGUuZyBgL21lYFxuICAgICAgICBpZiAoIXRoaXMucnVuRm4pIHJldHVybiByZWplY3QoX3QoXCJDb21tYW5kIGVycm9yXCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuRm4uYmluZCh0aGlzKShyb29tSWQsIGFyZ3MpO1xuICAgIH1cblxuICAgIGdldFVzYWdlKCkge1xuICAgICAgICByZXR1cm4gX3QoJ1VzYWdlJykgKyAnOiAnICsgdGhpcy5nZXRDb21tYW5kV2l0aEFyZ3MoKTtcbiAgICB9XG5cbiAgICBpc0VuYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0VuYWJsZWQgPyB0aGlzLl9pc0VuYWJsZWQoKSA6IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QoZXJyb3IpIHtcbiAgICByZXR1cm4ge2Vycm9yfTtcbn1cblxuZnVuY3Rpb24gc3VjY2Vzcyhwcm9taXNlPzogUHJvbWlzZTxhbnk+KSB7XG4gICAgcmV0dXJuIHtwcm9taXNlfTtcbn1cblxuLyogRGlzYWJsZSB0aGUgXCJ1bmV4cGVjdGVkIHRoaXNcIiBlcnJvciBmb3IgdGhlc2UgY29tbWFuZHMgLSBhbGwgb2YgdGhlIHJ1blxuICogZnVuY3Rpb25zIGFyZSBjYWxsZWQgd2l0aCBgdGhpc2AgYm91bmQgdG8gdGhlIENvbW1hbmQgaW5zdGFuY2UuXG4gKi9cblxuZXhwb3J0IGNvbnN0IENvbW1hbmRzID0gW1xuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3Nwb2lsZXInLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnU2VuZHMgdGhlIGdpdmVuIG1lc3NhZ2UgYXMgYSBzcG9pbGVyJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKENvbnRlbnRIZWxwZXJzLm1ha2VIdG1sTWVzc2FnZShcbiAgICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIGA8c3BhbiBkYXRhLW14LXNwb2lsZXI+JHttZXNzYWdlfTwvc3Bhbj5gLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdzaHJ1ZycsXG4gICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdQcmVwZW5kcyDCr1xcXFxfKOODhClfL8KvIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ8KvXFxcXF8o44OEKV8vwq8nO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSArICcgJyArIGFyZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhDb250ZW50SGVscGVycy5tYWtlVGV4dE1lc3NhZ2UobWVzc2FnZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndGFibGVmbGlwJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzICjila/CsOKWocKw77yJ4pWv77i1IOKUu+KUgeKUuyB0byBhIHBsYWluLXRleHQgbWVzc2FnZScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICco4pWvwrDilqHCsO+8ieKVr++4tSDilLvilIHilLsnO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSArICcgJyArIGFyZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhDb250ZW50SGVscGVycy5tYWtlVGV4dE1lc3NhZ2UobWVzc2FnZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndW5mbGlwJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzIOKUrOKUgOKUgOKUrCDjg44oIOOCnC3jgpzjg44pIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ+KUrOKUgOKUgOKUrCDjg44oIOOCnC3jgpzjg44pJztcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnICcgKyBhcmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoQ29udGVudEhlbHBlcnMubWFrZVRleHRNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2xlbm55JyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzICggzaHCsCDNnMqWIM2hwrApIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJyggzaHCsCDNnMqWIM2hwrApJztcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnICcgKyBhcmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoQ29udGVudEhlbHBlcnMubWFrZVRleHRNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3BsYWluJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1NlbmRzIGEgbWVzc2FnZSBhcyBwbGFpbiB0ZXh0LCB3aXRob3V0IGludGVycHJldGluZyBpdCBhcyBtYXJrZG93bicpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBtZXNzYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoQ29udGVudEhlbHBlcnMubWFrZVRleHRNZXNzYWdlKG1lc3NhZ2VzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdodG1sJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1NlbmRzIGEgbWVzc2FnZSBhcyBodG1sLCB3aXRob3V0IGludGVycHJldGluZyBpdCBhcyBtYXJrZG93bicpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBtZXNzYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoQ29udGVudEhlbHBlcnMubWFrZUh0bWxNZXNzYWdlKG1lc3NhZ2VzLCBtZXNzYWdlcykpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnZGRnJyxcbiAgICAgICAgYXJnczogJzxxdWVyeT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdTZWFyY2hlcyBEdWNrRHVja0dvIGZvciByZXN1bHRzJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5FcnJvckRpYWxvZycpO1xuICAgICAgICAgICAgLy8gVE9ETyBEb24ndCBleHBsYWluIHRoaXMgYXdheSwgYWN0dWFsbHkgc2hvdyBhIHNlYXJjaCBVSSBoZXJlLlxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2xhc2ggQ29tbWFuZHMnLCAnL2RkZyBpcyBub3QgYSBjb21tYW5kJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJy9kZGcgaXMgbm90IGEgY29tbWFuZCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnVG8gdXNlIGl0LCBqdXN0IHdhaXQgZm9yIGF1dG9jb21wbGV0ZSByZXN1bHRzIHRvIGxvYWQgYW5kIHRhYiB0aHJvdWdoIHRoZW0uJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgICAgICBoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2U6IHRydWUsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndXBncmFkZXJvb20nLFxuICAgICAgICBhcmdzOiAnPG5ld192ZXJzaW9uPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1VwZ3JhZGVzIGEgcm9vbSB0byBhIG5ldyB2ZXJzaW9uJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoXCJtLnJvb20udG9tYnN0b25lXCIsIGNsaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIllvdSBkbyBub3QgaGF2ZSB0aGUgcmVxdWlyZWQgcGVybWlzc2lvbnMgdG8gdXNlIHRoaXMgY29tbWFuZC5cIikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IFJvb21VcGdyYWRlV2FybmluZ0RpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlJvb21VcGdyYWRlV2FybmluZ0RpYWxvZ1wiKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICd1cGdyYWRlIHJvb20gY29uZmlybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgUm9vbVVwZ3JhZGVXYXJuaW5nRGlhbG9nLCB7cm9vbUlkOiByb29tSWQsIHRhcmdldFZlcnNpb246IGFyZ3N9LCAvKmNsYXNzTmFtZT0qL251bGwsXG4gICAgICAgICAgICAgICAgICAgIC8qaXNQcmlvcml0eT0qL2ZhbHNlLCAvKmlzU3RhdGljPSovdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhmaW5pc2hlZC50aGVuKGFzeW5jIChbcmVzcF0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwLmNvbnRpbnVlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrRm9yVXBncmFkZUZuO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBncmFkZVByb21pc2UgPSBjbGkudXBncmFkZVJvb20ocm9vbUlkLCBhcmdzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byB3YWl0IGZvciB0aGUganMtc2RrIHRvIGdpdmUgdXMgdGhlIHJvb20gYmFjayBzb1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIG1vcmUgZWZmZWN0aXZlbHkgYWJ1c2UgdGhlIE11bHRpSW52aXRlciBiZWhhdmlvdXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIGhlYXZpbHkgcmVsaWVzIG9uIHRoZSBSb29tIG9iamVjdCBiZWluZyBhdmFpbGFibGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5pbnZpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja0ZvclVwZ3JhZGVGbiA9IGFzeW5jIChuZXdSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB1cGdyYWRlUHJvbWlzZSBzaG91bGQgYmUgZG9uZSBieSB0aGUgdGltZSB3ZSBhd2FpdCBpdCBoZXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7cmVwbGFjZW1lbnRfcm9vbTogbmV3Um9vbUlkfSA9IGF3YWl0IHVwZ3JhZGVQcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Um9vbS5yb29tSWQgIT09IG5ld1Jvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvSW52aXRlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoXCJqb2luXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoXCJpbnZpdGVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0ubWFwKG0gPT4gbS51c2VySWQpLmZpbHRlcihtID0+IG0gIT09IGNsaS5nZXRVc2VySWQoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvSW52aXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVycm9ycyBhcmUgaGFuZGxlZCBpbnRlcm5hbGx5IHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGludml0ZVVzZXJzVG9Sb29tKG5ld1Jvb21JZCwgdG9JbnZpdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKCdSb29tJywgY2hlY2tGb3JVcGdyYWRlRm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpLm9uKCdSb29tJywgY2hlY2tGb3JVcGdyYWRlRm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGF3YWl0IGFmdGVyIHNvIHRoYXQgdGhlIGNoZWNrRm9yVXBncmFkZXNGbiBoYXMgYSBwcm9wZXIgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgbmV3IHJvb20ncyBJRC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHVwZ3JhZGVQcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGb3JVcGdyYWRlRm4pIGNsaS5yZW1vdmVMaXN0ZW5lcignUm9vbScsIGNoZWNrRm9yVXBncmFkZUZuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkVycm9yRGlhbG9nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICdyb29tIHVwZ3JhZGUgZXJyb3InLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3IgdXBncmFkaW5nIHJvb20nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEb3VibGUgY2hlY2sgdGhhdCB5b3VyIHNlcnZlciBzdXBwb3J0cyB0aGUgcm9vbSB2ZXJzaW9uIGNob3NlbiBhbmQgdHJ5IGFnYWluLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICduaWNrJyxcbiAgICAgICAgYXJnczogJzxkaXNwbGF5X25hbWU+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnQ2hhbmdlcyB5b3VyIGRpc3BsYXkgbmlja25hbWUnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0RGlzcGxheU5hbWUoYXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdteXJvb21uaWNrJyxcbiAgICAgICAgYWxpYXNlczogWydyb29tbmljayddLFxuICAgICAgICBhcmdzOiAnPGRpc3BsYXlfbmFtZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdDaGFuZ2VzIHlvdXIgZGlzcGxheSBuaWNrbmFtZSBpbiB0aGUgY3VycmVudCByb29tIG9ubHknKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXYgPSBjbGkuZ2V0Um9vbShyb29tSWQpLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLm1lbWJlcicsIGNsaS5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZXYgPyBldi5nZXRDb250ZW50KCkgOiB7IG1lbWJlcnNoaXA6ICdqb2luJyB9LFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogYXJncyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGNsaS5zZW5kU3RhdGVFdmVudChyb29tSWQsICdtLnJvb20ubWVtYmVyJywgY29udGVudCwgY2xpLmdldFVzZXJJZCgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3Jvb21hdmF0YXInLFxuICAgICAgICBhcmdzOiAnWzxteGNfdXJsPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdDaGFuZ2VzIHRoZSBhdmF0YXIgb2YgdGhlIGN1cnJlbnQgcm9vbScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShhcmdzKTtcbiAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgIHByb21pc2UgPSBzaW5nbGVNeGNVcGxvYWQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocHJvbWlzZS50aGVuKCh1cmwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXVybCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLmF2YXRhcicsIHt1cmx9LCAnJyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ215cm9vbWF2YXRhcicsXG4gICAgICAgIGFyZ3M6ICdbPG14Y191cmw+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0NoYW5nZXMgeW91ciBhdmF0YXIgaW4gdGhpcyBjdXJyZW50IHJvb20gb25seScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcblxuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoYXJncyk7XG4gICAgICAgICAgICBpZiAoIWFyZ3MpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gc2luZ2xlTXhjVXBsb2FkKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHByb21pc2UudGhlbigodXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBldiA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ubWVtYmVyJywgdXNlcklkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5ldiA/IGV2LmdldENvbnRlbnQoKSA6IHsgbWVtYmVyc2hpcDogJ2pvaW4nIH0sXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHVybCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLm1lbWJlcicsIGNvbnRlbnQsIHVzZXJJZCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ215YXZhdGFyJyxcbiAgICAgICAgYXJnczogJ1s8bXhjX3VybD5dJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnQ2hhbmdlcyB5b3VyIGF2YXRhciBpbiBhbGwgcm9vbXMnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoYXJncyk7XG4gICAgICAgICAgICBpZiAoIWFyZ3MpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gc2luZ2xlTXhjVXBsb2FkKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHByb21pc2UudGhlbigodXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybjtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldEF2YXRhclVybCh1cmwpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICd0b3BpYycsXG4gICAgICAgIGFyZ3M6ICdbPHRvcGljPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdHZXRzIG9yIHNldHMgdGhlIHJvb20gdG9waWMnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhjbGkuc2V0Um9vbVRvcGljKHJvb21JZCwgYXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHJldHVybiByZWplY3QoX3QoXCJGYWlsZWQgdG8gc2V0IHRvcGljXCIpKTtcblxuICAgICAgICAgICAgY29uc3QgdG9waWNFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnRvcGljJywgJycpO1xuICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0b3BpY0V2ZW50cyAmJiB0b3BpY0V2ZW50cy5nZXRDb250ZW50KCkudG9waWM7XG4gICAgICAgICAgICBjb25zdCB0b3BpY0h0bWwgPSB0b3BpYyA/IGxpbmtpZnlBbmRTYW5pdGl6ZUh0bWwodG9waWMpIDogX3QoJ1RoaXMgcm9vbSBoYXMgbm8gdG9waWMuJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IEluZm9EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkluZm9EaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1NsYXNoIENvbW1hbmRzJywgJ1RvcGljJywgSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiByb29tLm5hbWUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiB0b3BpY0h0bWwgfX0gLz4sXG4gICAgICAgICAgICAgICAgaGFzQ2xvc2VCdXR0b246IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdyb29tbmFtZScsXG4gICAgICAgIGFyZ3M6ICc8bmFtZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdTZXRzIHRoZSByb29tIG5hbWUnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Um9vbU5hbWUocm9vbUlkLCBhcmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdpbnZpdGUnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+IFs8cmVhc29uPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdJbnZpdGVzIHVzZXIgd2l0aCBnaXZlbiBpZCB0byBjdXJyZW50IHJvb20nKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbYWRkcmVzcywgcmVhc29uXSA9IGFyZ3Muc3BsaXQoL1xccysoLispLyk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgdXNlIGEgTXVsdGlJbnZpdGVyIHRvIHJlLXVzZSB0aGUgaW52aXRlIGxvZ2ljLCBldmVuIHRob3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBvbmx5IGludml0aW5nIG9uZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBuZWVkIGFuIGlkZW50aXR5IHNlcnZlciBidXQgZG9uJ3QgaGF2ZSBvbmUsIHRoaW5nc1xuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgYSBiaXQgbW9yZSBjb21wbGV4IGhlcmUsIGJ1dCB3ZSB0cnkgdG8gc2hvdyBzb21ldGhpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVhbmluZ2Z1bC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb20gPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0QWRkcmVzc1R5cGUoYWRkcmVzcykgPT09ICdlbWFpbCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRJZGVudGl0eVNlcnZlclVybCA9IGdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmF1bHRJZGVudGl0eVNlcnZlclVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2c8W2Jvb2xlYW5dPihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1NsYXNoIENvbW1hbmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lkZW50aXR5IHNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDbGljayBjb250aW51ZSB0byB1c2UgdGhlIGRlZmF1bHQgaWRlbnRpdHkgc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiglKGRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWUpcykgb3IgbWFuYWdlIGluIFNldHRpbmdzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZTogYWJicmV2aWF0ZVVybChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTwvcD4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IF90KFwiQ29udGludWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb20gPSBmaW5pc2hlZC50aGVuKChbdXNlRGVmYXVsdF0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZURlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZURlZmF1bHRJZGVudGl0eVNlcnZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihfdChcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBNYW5hZ2UgaW4gU2V0dGluZ3MuXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBNYW5hZ2UgaW4gU2V0dGluZ3MuXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnZpdGVyID0gbmV3IE11bHRpSW52aXRlcihyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2Vzcyhwcm9tLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludml0ZXIuaW52aXRlKFthZGRyZXNzXSwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW52aXRlci5nZXRDb21wbGV0aW9uU3RhdGUoYWRkcmVzcykgIT09IFwiaW52aXRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludml0ZXIuZ2V0RXJyb3JUZXh0KGFkZHJlc3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnam9pbicsXG4gICAgICAgIGFsaWFzZXM6IFsnaicsICdnb3RvJ10sXG4gICAgICAgIGFyZ3M6ICc8cm9vbS1hZGRyZXNzPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0pvaW5zIHJvb20gd2l0aCBnaXZlbiBhZGRyZXNzJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihfLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIC8vIE5vdGU6IHdlIHN1cHBvcnQgMiB2ZXJzaW9ucyBvZiB0aGlzIGNvbW1hbmQuIFRoZSBmaXJzdCBpc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBwdWJsaWMtZmFjaW5nIG9uZSBmb3IgbW9zdCB1c2VycyBhbmQgdGhlIG90aGVyIGlzIGFcbiAgICAgICAgICAgICAgICAvLyBwb3dlci11c2VyIGVkaXRpb24gd2hlcmUgc29tZW9uZSBtYXkgam9pbiB2aWEgcGVybWFsaW5rIG9yXG4gICAgICAgICAgICAgICAgLy8gcm9vbSBJRCB3aXRoIG9wdGlvbmFsIHNlcnZlcnMuIFByYWN0aWNhbGx5LCB0aGlzIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGUgZm9sbG93aW5nIHZhcmlhdGlvbnM6XG4gICAgICAgICAgICAgICAgLy8gICAvam9pbiAjZXhhbXBsZTpleGFtcGxlLm9yZ1xuICAgICAgICAgICAgICAgIC8vICAgL2pvaW4gIWV4YW1wbGU6ZXhhbXBsZS5vcmdcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luICFleGFtcGxlOmV4YW1wbGUub3JnIGFsdHNlcnZlci5jb20gZWxzZXdoZXJlLmNhXG4gICAgICAgICAgICAgICAgLy8gICAvam9pbiBodHRwczovL21hdHJpeC50by8jLyFleGFtcGxlOmV4YW1wbGUub3JnP3ZpYT1hbHRzZXJ2ZXIuY29tXG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvbW1hbmQgYWxzbyBzdXBwb3J0cyBldmVudCBwZXJtYWxpbmtzIHRyYW5zcGFyZW50bHk6XG4gICAgICAgICAgICAgICAgLy8gICAvam9pbiBodHRwczovL21hdHJpeC50by8jLyFleGFtcGxlOmV4YW1wbGUub3JnLyRzb21ldGhpbmc6ZXhhbXBsZS5vcmdcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luIGh0dHBzOi8vbWF0cml4LnRvLyMvIWV4YW1wbGU6ZXhhbXBsZS5vcmcvJHNvbWV0aGluZzpleGFtcGxlLm9yZz92aWE9YWx0c2VydmVyLmNvbVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IGFyZ3Muc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDEpIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcblxuICAgICAgICAgICAgICAgIGxldCBpc1Blcm1hbGluayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXNbMF0uc3RhcnRzV2l0aChcImh0dHA6XCIpIHx8IHBhcmFtc1swXS5zdGFydHNXaXRoKFwiaHR0cHM6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEl0J3MgYXQgbGVhc3QgYSBVUkwgLSB0cnkgYW5kIHB1bGwgb3V0IGEgaG9zdG5hbWUgdG8gY2hlY2sgYWdhaW5zdCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gcGVybWFsaW5rIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTChwYXJhbXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBob3N0bmFtZSA9IHBhcnNlZFVybC5ob3N0IHx8IHBhcnNlZFVybC5ob3N0bmFtZTsgLy8gdGFrZXMgZmlyc3Qgbm9uLWZhbHNleSB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHdlJ3JlIHVzaW5nIGEgRWxlbWVudCBwZXJtYWxpbmsgaGFuZGxlciwgdGhpcyB3aWxsIGNhdGNoIGl0IGJlZm9yZSB3ZSBnZXQgbXVjaCBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgICAgICAvLyBzZWUgYmVsb3cgd2hlcmUgd2UgbWFrZSBhc3N1bXB0aW9ucyBhYm91dCBwYXJzaW5nIHRoZSBVUkwuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1Blcm1hbGlua0hvc3QoaG9zdG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Blcm1hbGluayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtc1swXVswXSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb29tQWxpYXMgPSBwYXJhbXNbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmICghcm9vbUFsaWFzLmluY2x1ZGVzKCc6JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21BbGlhcyArPSAnOicgKyBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0RG9tYWluKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21fYWxpYXM6IHJvb21BbGlhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9fam9pbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF90eXBlOiBcInNsYXNoX2NvbW1hbmRcIiwgLy8gaW5zdHJ1bWVudGF0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1zWzBdWzBdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3Jvb21JZCwgLi4udmlhU2VydmVyc10gPSBwYXJhbXM7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2UgYXJlIHBhc3NlZCBkb3duIHRvIHRoZSBqcy1zZGsncyAvam9pbiBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlhU2VydmVyczogdmlhU2VydmVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWFfc2VydmVyczogdmlhU2VydmVycywgLy8gZm9yIHRoZSByZWpvaW4gYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvX2pvaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdHlwZTogXCJzbGFzaF9jb21tYW5kXCIsIC8vIGluc3RydW1lbnRhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUGVybWFsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBlcm1hbGlua1BhcnRzID0gcGFyc2VQZXJtYWxpbmsocGFyYW1zWzBdKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNoZWNrIHRlY2huaWNhbGx5IGlzbid0IG5lZWRlZCBiZWNhdXNlIHdlIGFscmVhZHkgZGlkIG91clxuICAgICAgICAgICAgICAgICAgICAvLyBzYWZldHkgY2hlY2tzIHVwIGFib3ZlLiBIb3dldmVyLCBmb3IgZ29vZCBtZWFzdXJlLCBsZXQncyBiZSBzdXJlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBlcm1hbGlua1BhcnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBmb3Igc29tZSByZWFzb24gc29tZW9uZSB3YW50ZWQgdG8gam9pbiBhIGdyb3VwIG9yIHVzZXIsIHdlIHNob3VsZFxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9wIHRoZW0gbm93LlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBlcm1hbGlua1BhcnRzLnJvb21JZE9yQWxpYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IHBlcm1hbGlua1BhcnRzLnJvb21JZE9yQWxpYXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpYVNlcnZlcnMgPSBwZXJtYWxpbmtQYXJ0cy52aWFTZXJ2ZXJzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudElkID0gcGVybWFsaW5rUGFydHMuZXZlbnRJZDtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXNwYXRjaCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvX2pvaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdHlwZTogXCJzbGFzaF9jb21tYW5kXCIsIC8vIGluc3RydW1lbnRhdGlvblxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHlbMF0gPT09ICchJykgZGlzcGF0Y2hbXCJyb29tX2lkXCJdID0gZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGRpc3BhdGNoW1wicm9vbV9hbGlhc1wiXSA9IGVudGl0eTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hbXCJldmVudF9pZFwiXSA9IGV2ZW50SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaFtcImhpZ2hsaWdodGVkXCJdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2aWFTZXJ2ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgdGhlIGpvaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoW1wib3B0c1wiXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBhcmUgcGFzc2VkIGRvd24gdG8gdGhlIGpzLXNkaydzIC9qb2luIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFTZXJ2ZXJzOiB2aWFTZXJ2ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGlmIHRoZSBqb2luIGZhaWxzIChyZWpvaW4gYnV0dG9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hbJ3ZpYV9zZXJ2ZXJzJ10gPSB2aWFTZXJ2ZXJzO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKGRpc3BhdGNoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3BhcnQnLFxuICAgICAgICBhcmdzOiAnWzxyb29tLWFkZHJlc3M+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0xlYXZlIHJvb20nKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgICAgICBsZXQgdGFyZ2V0Um9vbUlkO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm9vbUFsaWFzID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvb21BbGlhc1swXSAhPT0gJyMnKSByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tQWxpYXMuaW5jbHVkZXMoJzonKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUFsaWFzICs9ICc6JyArIGNsaS5nZXREb21haW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyeSB0byBmaW5kIGEgcm9vbSB3aXRoIHRoaXMgYWxpYXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbXMgPSBjbGkuZ2V0Um9vbXMoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb29tcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxpYXNFdmVudHMgPSByb29tc1tpXS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5hbGlhc2VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGFsaWFzRXZlbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxpYXNlcyA9IGFsaWFzRXZlbnRzW2pdLmdldENvbnRlbnQoKS5hbGlhc2VzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgYWxpYXNlcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxpYXNlc1trXSA9PT0gcm9vbUFsaWFzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRSb29tSWQgPSByb29tc1tpXS5yb29tSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Um9vbUlkKSBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRSb29tSWQpIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0Um9vbUlkKSByZXR1cm4gcmVqZWN0KF90KCdVbnJlY29nbmlzZWQgcm9vbSBhZGRyZXNzOicpICsgJyAnICsgcm9vbUFsaWFzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGFyZ2V0Um9vbUlkKSB0YXJnZXRSb29tSWQgPSByb29tSWQ7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhsZWF2ZVJvb21CZWhhdmlvdXIodGFyZ2V0Um9vbUlkKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2tpY2snLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+IFtyZWFzb25dJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnS2lja3MgdXNlciB3aXRoIGdpdmVuIGlkJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKCArKC4qKSk/JC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKE1hdHJpeENsaWVudFBlZy5nZXQoKS5raWNrKHJvb21JZCwgbWF0Y2hlc1sxXSwgbWF0Y2hlc1szXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkbWluLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2JhbicsXG4gICAgICAgIGFyZ3M6ICc8dXNlci1pZD4gW3JlYXNvbl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdCYW5zIHVzZXIgd2l0aCBnaXZlbiBpZCcpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUys/KSggKyguKikpPyQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuYmFuKHJvb21JZCwgbWF0Y2hlc1sxXSwgbWF0Y2hlc1szXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkbWluLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3VuYmFuJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1VuYmFucyB1c2VyIHdpdGggZ2l2ZW4gSUQnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCB0aGUgdXNlciBtZW1iZXJzaGlwIHRvIFwibGVhdmVcIiB0byB1bmJhbiBoaW1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnVuYmFuKHJvb21JZCwgbWF0Y2hlc1sxXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkbWluLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2lnbm9yZScsXG4gICAgICAgIGFyZ3M6ICc8dXNlci1pZD4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdJZ25vcmVzIGEgdXNlciwgaGlkaW5nIHRoZWlyIG1lc3NhZ2VzIGZyb20geW91JyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oQFteOl0rOlxcUyspJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IG1hdGNoZXNbMV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlnbm9yZWRVc2VycyA9IGNsaS5nZXRJZ25vcmVkVXNlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWdub3JlZFVzZXJzLnB1c2godXNlcklkKTsgLy8gZGUtZHVwZWQgaW50ZXJuYWxseSBpbiB0aGUganMtc2RrXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpLnNldElnbm9yZWRVc2VycyhpZ25vcmVkVXNlcnMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IEluZm9EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkluZm9EaWFsb2cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICdVc2VyIGlnbm9yZWQnLCBJbmZvRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnSWdub3JlZCB1c2VyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdCgnWW91IGFyZSBub3cgaWdub3JpbmcgJSh1c2VySWQpcycsIHt1c2VySWR9KSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3VuaWdub3JlJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1N0b3BzIGlnbm9yaW5nIGEgdXNlciwgc2hvd2luZyB0aGVpciBtZXNzYWdlcyBnb2luZyBmb3J3YXJkJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goLyheQFteOl0rOlxcUyskKS8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IG1hdGNoZXNbMV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlnbm9yZWRVc2VycyA9IGNsaS5nZXRJZ25vcmVkVXNlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBpZ25vcmVkVXNlcnMuaW5kZXhPZih1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSBpZ25vcmVkVXNlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGkuc2V0SWdub3JlZFVzZXJzKGlnbm9yZWRVc2VycykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgSW5mb0RpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuSW5mb0RpYWxvZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1NsYXNoIENvbW1hbmRzJywgJ1VzZXIgdW5pZ25vcmVkJywgSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1VuaWdub3JlZCB1c2VyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdCgnWW91IGFyZSBubyBsb25nZXIgaWdub3JpbmcgJSh1c2VySWQpcycsIHt1c2VySWR9KSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ29wJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPiBbPHBvd2VyLWxldmVsPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdEZWZpbmUgdGhlIHBvd2VyIGxldmVsIG9mIGEgdXNlcicpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUys/KSggKygtP1xcZCspKT8kLyk7XG4gICAgICAgICAgICAgICAgbGV0IHBvd2VyTGV2ZWwgPSA1MDsgLy8gZGVmYXVsdCBwb3dlciBsZXZlbCBmb3Igb3BcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDQgJiYgdW5kZWZpbmVkICE9PSBtYXRjaGVzWzNdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3dlckxldmVsID0gcGFyc2VJbnQobWF0Y2hlc1szXSwgMTApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4ocG93ZXJMZXZlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tKSByZXR1cm4gcmVqZWN0KF90KFwiQ29tbWFuZCBmYWlsZWRcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyIHx8IGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAobWVtYmVyLm1lbWJlcnNoaXApID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkxlYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIkNvdWxkIG5vdCBmaW5kIHVzZXIgaW4gcm9vbVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3dlckxldmVsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnBvd2VyX2xldmVscycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGNsaS5zZXRQb3dlckxldmVsKHJvb21JZCwgdXNlcklkLCBwb3dlckxldmVsLCBwb3dlckxldmVsRXZlbnQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkbWluLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2Rlb3AnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnRGVvcHMgdXNlciB3aXRoIGdpdmVuIGlkJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKykkLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tKSByZXR1cm4gcmVqZWN0KF90KFwiQ29tbWFuZCBmYWlsZWRcIikpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ucG93ZXJfbGV2ZWxzJywgJycpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCkudXNlcnNbYXJnc10pIHJldHVybiByZWplY3QoX3QoXCJDb3VsZCBub3QgZmluZCB1c2VyIGluIHJvb21cIikpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhjbGkuc2V0UG93ZXJMZXZlbChyb29tSWQsIGFyZ3MsIHVuZGVmaW5lZCwgcG93ZXJMZXZlbEV2ZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnZGV2dG9vbHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdPcGVucyB0aGUgRGV2ZWxvcGVyIFRvb2xzIGRpYWxvZycpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCBEZXZ0b29sc0RpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuRGV2dG9vbHNEaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhEZXZ0b29sc0RpYWxvZywge3Jvb21JZH0pO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2FkZHdpZGdldCcsXG4gICAgICAgIGFyZ3M6ICc8dXJsIHwgZW1iZWQgY29kZSB8IEppdHNpIHVybD4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdBZGRzIGEgY3VzdG9tIHdpZGdldCBieSBVUkwgdG8gdGhlIHJvb20nKSxcbiAgICAgICAgaXNFbmFibGVkOiAoKSA9PiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5XaWRnZXRzKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgd2lkZ2V0VXJsKSB7XG4gICAgICAgICAgICBpZiAoIXdpZGdldFVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoX3QoXCJQbGVhc2Ugc3VwcGx5IGEgd2lkZ2V0IFVSTCBvciBlbWJlZCBjb2RlXCIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJ5IGFuZCBwYXJzZSBvdXQgYSB3aWRnZXQgVVJMIGZyb20gaWZyYW1lc1xuICAgICAgICAgICAgaWYgKHdpZGdldFVybC50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoXCI8aWZyYW1lIFwiKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBwYXJzZTUsIHdoaWNoIGRvZXNuJ3QgcmVuZGVyL2NyZWF0ZSBhIERPTSBub2RlLiBJdCBpbnN0ZWFkIHJ1bnNcbiAgICAgICAgICAgICAgICAvLyBzb21lIHN1cGVyZmFzdCByZWdleCBvdmVyIHRoZSB0ZXh0IHNvIHdlIGRvbid0IGhhdmUgdG8uXG4gICAgICAgICAgICAgICAgY29uc3QgZW1iZWQgPSBwYXJzZUh0bWwod2lkZ2V0VXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoZW1iZWQgJiYgZW1iZWQuY2hpbGROb2RlcyAmJiBlbWJlZC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZnJhbWUgPSBlbWJlZC5jaGlsZE5vZGVzWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWZyYW1lLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lmcmFtZScgJiYgaWZyYW1lLmF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcmNBdHRyID0gaWZyYW1lLmF0dHJzLmZpbmQoYSA9PiBhLm5hbWUgPT09ICdzcmMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUHVsbGluZyBVUkwgb3V0IG9mIGlmcmFtZSAoZW1iZWQgY29kZSlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXRVcmwgPSBzcmNBdHRyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXdpZGdldFVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikgJiYgIXdpZGdldFVybC5zdGFydHNXaXRoKFwiaHR0cDovL1wiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoX3QoXCJQbGVhc2Ugc3VwcGx5IGEgaHR0cHM6Ly8gb3IgaHR0cDovLyB3aWRnZXQgVVJMXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChXaWRnZXRVdGlscy5jYW5Vc2VyTW9kaWZ5V2lkZ2V0cyhyb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vd01zID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWRnZXRJZCA9IGVuY29kZVVSSUNvbXBvbmVudChgJHtyb29tSWR9XyR7dXNlcklkfV8ke25vd01zfWApO1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gV2lkZ2V0VHlwZS5DVVNUT007XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBcIkN1c3RvbSBXaWRnZXRcIjtcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLy8gTWFrZSB0aGUgd2lkZ2V0IGEgSml0c2kgd2lkZ2V0IGlmIGl0IGxvb2tzIGxpa2UgYSBKaXRzaSB3aWRnZXRcbiAgICAgICAgICAgICAgICBjb25zdCBqaXRzaURhdGEgPSBKaXRzaS5nZXRJbnN0YW5jZSgpLnBhcnNlUHJlZmVycmVkQ29uZmVyZW5jZVVybCh3aWRnZXRVcmwpO1xuICAgICAgICAgICAgICAgIGlmIChqaXRzaURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJNYWtpbmcgL2FkZHdpZGdldCB3aWRnZXQgYSBKaXRzaSBjb25mZXJlbmNlXCIpO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID0gV2lkZ2V0VHlwZS5KSVRTSTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFwiSml0c2kgQ29uZmVyZW5jZVwiO1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gaml0c2lEYXRhO1xuICAgICAgICAgICAgICAgICAgICB3aWRnZXRVcmwgPSBXaWRnZXRVdGlscy5nZXRMb2NhbEppdHNpV3JhcHBlclVybCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXQocm9vbUlkLCB3aWRnZXRJZCwgdHlwZSwgd2lkZ2V0VXJsLCBuYW1lLCBkYXRhKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoX3QoXCJZb3UgY2Fubm90IG1vZGlmeSB3aWRnZXRzIGluIHRoaXMgcm9vbS5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndmVyaWZ5JyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPiA8ZGV2aWNlLWlkPiA8ZGV2aWNlLXNpZ25pbmcta2V5PicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ZlcmlmaWVzIGEgdXNlciwgc2Vzc2lvbiwgYW5kIHB1YmtleSB0dXBsZScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUyspICsoXFxTKykgKyhcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlSWQgPSBtYXRjaGVzWzJdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5nZXJwcmludCA9IG1hdGNoZXNbM107XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IGNsaS5nZXRTdG9yZWREZXZpY2UodXNlcklkLCBkZXZpY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRldmljZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihfdCgnVW5rbm93biAodXNlciwgc2Vzc2lvbikgcGFpcjonKSArIGAgKCR7dXNlcklkfSwgJHtkZXZpY2VJZH0pYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VUcnVzdCA9IGF3YWl0IGNsaS5jaGVja0RldmljZVRydXN0KHVzZXJJZCwgZGV2aWNlSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldmljZS5nZXRGaW5nZXJwcmludCgpID09PSBmaW5nZXJwcmludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoX3QoJ1Nlc3Npb24gYWxyZWFkeSB2ZXJpZmllZCEnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKF90KCdXQVJOSU5HOiBTZXNzaW9uIGFscmVhZHkgdmVyaWZpZWQsIGJ1dCBrZXlzIGRvIE5PVCBNQVRDSCEnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlLmdldEZpbmdlcnByaW50KCkgIT09IGZpbmdlcnByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnByaW50ID0gZGV2aWNlLmdldEZpbmdlcnByaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdCgnV0FSTklORzogS0VZIFZFUklGSUNBVElPTiBGQUlMRUQhIFRoZSBzaWduaW5nIGtleSBmb3IgJSh1c2VySWQpcyBhbmQgc2Vzc2lvbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAlKGRldmljZUlkKXMgaXMgXCIlKGZwcmludClzXCIgd2hpY2ggZG9lcyBub3QgbWF0Y2ggdGhlIHByb3ZpZGVkIGtleSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcIiUoZmluZ2VycHJpbnQpc1wiLiBUaGlzIGNvdWxkIG1lYW4geW91ciBjb21tdW5pY2F0aW9ucyBhcmUgYmVpbmcgaW50ZXJjZXB0ZWQhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnByaW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5nZXJwcmludCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGkuc2V0RGV2aWNlVmVyaWZpZWQodXNlcklkLCBkZXZpY2VJZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbGwgdGhlIHVzZXIgd2UgdmVyaWZpZWQgZXZlcnl0aGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgSW5mb0RpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuSW5mb0RpYWxvZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2xhc2ggQ29tbWFuZHMnLCAnVmVyaWZpZWQga2V5JywgSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVmVyaWZpZWQga2V5JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90KCdUaGUgc2lnbmluZyBrZXkgeW91IHByb3ZpZGVkIG1hdGNoZXMgdGhlIHNpZ25pbmcga2V5IHlvdSByZWNlaXZlZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Zyb20gJSh1c2VySWQpc1xcJ3Mgc2Vzc2lvbiAlKGRldmljZUlkKXMuIFNlc3Npb24gbWFya2VkIGFzIHZlcmlmaWVkLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXJJZCwgZGV2aWNlSWR9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2Rpc2NhcmRzZXNzaW9uJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnRm9yY2VzIHRoZSBjdXJyZW50IG91dGJvdW5kIGdyb3VwIHNlc3Npb24gaW4gYW4gZW5jcnlwdGVkIHJvb20gdG8gYmUgZGlzY2FyZGVkJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmZvcmNlRGlzY2FyZFNlc3Npb24ocm9vbUlkKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcInJhaW5ib3dcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIlNlbmRzIHRoZSBnaXZlbiBtZXNzYWdlIGNvbG91cmVkIGFzIGEgcmFpbmJvd1wiKSxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghYXJncykgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKENvbnRlbnRIZWxwZXJzLm1ha2VIdG1sTWVzc2FnZShhcmdzLCB0ZXh0VG9IdG1sUmFpbmJvdyhhcmdzKSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcInJhaW5ib3dtZVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiU2VuZHMgdGhlIGdpdmVuIGVtb3RlIGNvbG91cmVkIGFzIGEgcmFpbmJvd1wiKSxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghYXJncykgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKENvbnRlbnRIZWxwZXJzLm1ha2VIdG1sRW1vdGUoYXJncywgdGV4dFRvSHRtbFJhaW5ib3coYXJncykpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJoZWxwXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJEaXNwbGF5cyBsaXN0IG9mIGNvbW1hbmRzIHdpdGggdXNhZ2VzIGFuZCBkZXNjcmlwdGlvbnNcIiksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IFNsYXNoQ29tbWFuZEhlbHBEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLlNsYXNoQ29tbWFuZEhlbHBEaWFsb2cnKTtcblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2xhc2ggQ29tbWFuZHMnLCAnSGVscCcsIFNsYXNoQ29tbWFuZEhlbHBEaWFsb2cpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJ3aG9pc1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiRGlzcGxheXMgaW5mb3JtYXRpb24gYWJvdXQgYSB1c2VyXCIpLFxuICAgICAgICBhcmdzOiBcIjx1c2VyLWlkPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCB1c2VySWQpIHtcbiAgICAgICAgICAgIGlmICghdXNlcklkIHx8ICF1c2VySWQuc3RhcnRzV2l0aChcIkBcIikgfHwgIXVzZXJJZC5pbmNsdWRlcyhcIjpcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCkuZ2V0TWVtYmVyKHVzZXJJZCk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1VzZXJQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXIsXG4gICAgICAgICAgICAgICAgLy8gWFhYOiBXZSBzaG91bGQgYmUgdXNpbmcgYSByZWFsIG1lbWJlciBvYmplY3QgYW5kIG5vdCBhc3N1bWluZyB3aGF0IHRoZVxuICAgICAgICAgICAgICAgIC8vIHJlY2VpdmVyIHdhbnRzLlxuICAgICAgICAgICAgICAgIG1lbWJlcjogbWVtYmVyIHx8IHt1c2VySWR9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcInJhZ2VzaGFrZVwiLFxuICAgICAgICBhbGlhc2VzOiBbXCJidWdyZXBvcnRcIl0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJTZW5kIGEgYnVnIHJlcG9ydCB3aXRoIGxvZ3NcIiksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gISFTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwsXG4gICAgICAgIGFyZ3M6IFwiPGRlc2NyaXB0aW9uPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICdCdWcgUmVwb3J0IERpYWxvZycsIEJ1Z1JlcG9ydERpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVGV4dDogYXJncyxcbiAgICAgICAgICAgICAgICB9KS5maW5pc2hlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZHZhbmNlZCxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwicXVlcnlcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIk9wZW5zIGNoYXQgd2l0aCB0aGUgZ2l2ZW4gdXNlclwiKSxcbiAgICAgICAgYXJnczogXCI8dXNlci1pZD5cIixcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgdXNlcklkKSB7XG4gICAgICAgICAgICAvLyBlYXN0ZXItZWdnIGZvciBub3c6IGxvb2sgdXAgcGhvbmUgbnVtYmVycyB0aHJvdWdoIHRoZSB0aGlyZHBhcnR5IEFQSVxuICAgICAgICAgICAgLy8gKHZlcnkgZHVtYiBwaG9uZSBudW1iZXIgZGV0ZWN0aW9uLi4uKVxuICAgICAgICAgICAgY29uc3QgaXNQaG9uZU51bWJlciA9IHVzZXJJZCAmJiAvXlxcKz9bMDEyMzQ1Njc4OV0rJC8udGVzdCh1c2VySWQpO1xuICAgICAgICAgICAgaWYgKCF1c2VySWQgfHwgKCF1c2VySWQuc3RhcnRzV2l0aChcIkBcIikgfHwgIXVzZXJJZC5pbmNsdWRlcyhcIjpcIikpICYmICFpc1Bob25lTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc1Bob25lTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLnBzdG5Mb29rdXAodGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCA9PT0gMCB8fCAhcmVzdWx0c1swXS51c2VyaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBmaW5kIE1hdHJpeCBJRCBmb3IgcGhvbmUgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZCA9IHJlc3VsdHNbMF0udXNlcmlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGF3YWl0IGVuc3VyZURNRXhpc3RzKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgdXNlcklkKTtcblxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwibXNnXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIGdpdmVuIHVzZXJcIiksXG4gICAgICAgIGFyZ3M6IFwiPHVzZXItaWQ+IDxtZXNzYWdlPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24oXywgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAvLyBtYXRjaGVzIHRoZSBmaXJzdCB3aGl0ZXNwYWNlIGRlbGltaXRlZCBncm91cCBhbmQgdGhlbiB0aGUgcmVzdCBvZiB0aGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKD86ICsoLiopKT8kL3MpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFt1c2VySWQsIG1zZ10gPSBtYXRjaGVzLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXNnICYmIHVzZXJJZCAmJiB1c2VySWQuc3RhcnRzV2l0aChcIkBcIikgJiYgdXNlcklkLmluY2x1ZGVzKFwiOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gYXdhaXQgZW5zdXJlRE1FeGlzdHMoY2xpLCB1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGkuc2VuZFRleHRNZXNzYWdlKHJvb21JZCwgbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJob2xkY2FsbFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiUGxhY2VzIHRoZSBjYWxsIGluIHRoZSBjdXJyZW50IHJvb20gb24gaG9sZFwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRDYWxsRm9yUm9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcIk5vIGFjdGl2ZSBjYWxsIGluIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwidW5ob2xkY2FsbFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiVGFrZXMgdGhlIGNhbGwgaW4gdGhlIGN1cnJlbnQgcm9vbSBvZmYgaG9sZFwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRDYWxsRm9yUm9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcIk5vIGFjdGl2ZSBjYWxsIGluIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcImNvbnZlcnR0b2RtXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJDb252ZXJ0cyB0aGUgcm9vbSB0byBhIERNXCIpLFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMub3RoZXIsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoZ3Vlc3NBbmRTZXRETVJvb20ocm9vbSwgdHJ1ZSkpO1xuICAgICAgICB9LFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJjb252ZXJ0dG9yb29tXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJDb252ZXJ0cyB0aGUgRE0gdG8gYSByb29tXCIpLFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMub3RoZXIsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoZ3Vlc3NBbmRTZXRETVJvb20ocm9vbSwgZmFsc2UpKTtcbiAgICAgICAgfSxcbiAgICB9KSxcblxuICAgIC8vIENvbW1hbmQgZGVmaW5pdGlvbnMgZm9yIGF1dG9jb21wbGV0aW9uIE9OTFk6XG4gICAgLy8gL21lIGlzIHNwZWNpYWwgYmVjYXVzZSBpdHMgbm90IGhhbmRsZWQgYnkgU2xhc2hDb21tYW5kcy5qcyBhbmQgaXMgaW5zdGVhZCBkb25lIGluc2lkZSB0aGUgQ29tcG9zZXIgY2xhc3Nlc1xuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJtZVwiLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnRGlzcGxheXMgYWN0aW9uJyksXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICAgICAgaGlkZUNvbXBsZXRpb25BZnRlclNwYWNlOiB0cnVlLFxuICAgIH0pLFxuXG4gICAgLi4uQ0hBVF9FRkZFQ1RTLm1hcCgoZWZmZWN0KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgICAgICBjb21tYW5kOiBlZmZlY3QuY29tbWFuZCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlZmZlY3QuZGVzY3JpcHRpb24oKSxcbiAgICAgICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9IGVmZmVjdC5mYWxsYmFja01lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kRW1vdGVNZXNzYWdlKHJvb21JZCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZ3R5cGU6IGVmZmVjdC5tc2dUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRNZXNzYWdlKHJvb21JZCwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IGBlZmZlY3RzLiR7ZWZmZWN0LmNvbW1hbmR9YH0pO1xuICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5lZmZlY3RzLFxuICAgICAgICB9KVxuICAgIH0pLFxuXTtcblxuLy8gYnVpbGQgYSBtYXAgZnJvbSBuYW1lcyBhbmQgYWxpYXNlcyB0byB0aGUgQ29tbWFuZCBvYmplY3RzLlxuZXhwb3J0IGNvbnN0IENvbW1hbmRNYXAgPSBuZXcgTWFwKCk7XG5Db21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgQ29tbWFuZE1hcC5zZXQoY21kLmNvbW1hbmQsIGNtZCk7XG4gICAgY21kLmFsaWFzZXMuZm9yRWFjaChhbGlhcyA9PiB7XG4gICAgICAgIENvbW1hbmRNYXAuc2V0KGFsaWFzLCBjbWQpO1xuICAgIH0pO1xufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1hbmRTdHJpbmcoaW5wdXQ6IHN0cmluZykge1xuICAgIC8vIHRyaW0gYW55IHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFzIGl0IGNhbiBjb25mdXNlIHRoZSBwYXJzZXIgZm9yXG4gICAgLy8gSVJDLXN0eWxlIGNvbW1hbmRzXG4gICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9cXHMrJC8sICcnKTtcbiAgICBpZiAoaW5wdXRbMF0gIT09ICcvJykgcmV0dXJuIHt9OyAvLyBub3QgYSBjb21tYW5kXG5cbiAgICBjb25zdCBiaXRzID0gaW5wdXQubWF0Y2goL14oXFxTKz8pKD86WyBcXG5dKygoLnxcXG4pKikpPyQvKTtcbiAgICBsZXQgY21kO1xuICAgIGxldCBhcmdzO1xuICAgIGlmIChiaXRzKSB7XG4gICAgICAgIGNtZCA9IGJpdHNbMV0uc3Vic3RyaW5nKDEpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGFyZ3MgPSBiaXRzWzJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNtZCA9IGlucHV0O1xuICAgIH1cblxuICAgIHJldHVybiB7Y21kLCBhcmdzfTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSBnaXZlbiB0ZXh0IGZvciAvY29tbWFuZHMgYW5kIHJldHVybiBhIGJvdW5kIG1ldGhvZCB0byBwZXJmb3JtIHRoZW0uXG4gKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIFRoZSByb29tIGluIHdoaWNoIHRoZSBjb21tYW5kIHdhcyBwZXJmb3JtZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgVGhlIHJhdyB0ZXh0IGlucHV0IGJ5IHRoZSB1c2VyLlxuICogQHJldHVybiB7bnVsbHxmdW5jdGlvbigpOiBPYmplY3R9IEZ1bmN0aW9uIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCB0aGUgcHJvcGVydHkgJ2Vycm9yJyBpZiB0aGVyZSB3YXMgYW4gZXJyb3JcbiAqIHByb2Nlc3NpbmcgdGhlIGNvbW1hbmQsIG9yICdwcm9taXNlJyBpZiBhIHJlcXVlc3Qgd2FzIHNlbnQgb3V0LlxuICogUmV0dXJucyBudWxsIGlmIHRoZSBpbnB1dCBkaWRuJ3QgbWF0Y2ggYSBjb21tYW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWFuZChpbnB1dDogc3RyaW5nKSB7XG4gICAgY29uc3Qge2NtZCwgYXJnc30gPSBwYXJzZUNvbW1hbmRTdHJpbmcoaW5wdXQpO1xuXG4gICAgaWYgKENvbW1hbmRNYXAuaGFzKGNtZCkgJiYgQ29tbWFuZE1hcC5nZXQoY21kKS5pc0VuYWJsZWQoKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY21kOiBDb21tYW5kTWFwLmdldChjbWQpLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xufVxuIl19