"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _AutocompleteProvider = _interopRequireDefault(require("./AutocompleteProvider"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _QueryMatcher = _interopRequireDefault(require("./QueryMatcher"));

var _Components = require("./Components");

var sdk = _interopRequireWildcard(require("../index"));

var _lodash = require("lodash");

var _Permalinks = require("../utils/permalinks/Permalinks");

var _FlairStore = _interopRequireDefault(require("../stores/FlairStore"));

/*
Copyright 2018 New Vector Ltd
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const COMMUNITY_REGEX = /\B\+\S*/g;

function score(query, space) {
  const index = space.indexOf(query);

  if (index === -1) {
    return Infinity;
  } else {
    return index;
  }
}

class CommunityProvider extends _AutocompleteProvider.default {
  constructor() {
    super(COMMUNITY_REGEX);
    (0, _defineProperty2.default)(this, "matcher", void 0);
    this.matcher = new _QueryMatcher.default([], {
      keys: ['groupId', 'name', 'shortDescription']
    });
  }

  async getCompletions(query
  /*: string*/
  , selection
  /*: ISelectionRange*/
  , force = false)
  /*: Promise<ICompletion[]>*/
  {
    const BaseAvatar = sdk.getComponent('views.avatars.BaseAvatar'); // Disable autocompletions when composing commands because of various issues
    // (see https://github.com/vector-im/element-web/issues/4762)

    if (/^(\/join|\/leave)/.test(query)) {
      return [];
    }

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    let completions = [];
    const {
      command,
      range
    } = this.getCurrentCommand(query, selection, force);

    if (command) {
      const joinedGroups = cli.getGroups().filter(({
        myMembership
      }) => myMembership === 'join');
      const groups = await Promise.all(joinedGroups.map(async ({
        groupId
      }) => {
        try {
          return _FlairStore.default.getGroupProfileCached(cli, groupId);
        } catch (e) {
          // if FlairStore failed, fall back to just groupId
          return Promise.resolve({
            name: '',
            groupId,
            avatarUrl: '',
            shortDescription: ''
          });
        }
      }));
      this.matcher.setObjects(groups);
      const matchedString = command[0];
      completions = this.matcher.match(matchedString);
      completions = (0, _lodash.sortBy)(completions, [c => score(matchedString, c.groupId), c => c.groupId.length]).map(({
        avatarUrl,
        groupId,
        name
      }) => ({
        completion: groupId,
        suffix: ' ',
        type: "community",
        href: (0, _Permalinks.makeGroupPermalink)(groupId),
        component: /*#__PURE__*/_react.default.createElement(_Components.PillCompletion, {
          title: name,
          description: groupId
        }, /*#__PURE__*/_react.default.createElement(BaseAvatar, {
          name: name || groupId,
          width: 24,
          height: 24,
          url: avatarUrl ? cli.mxcUrlToHttp(avatarUrl, 24, 24) : null
        })),
        range
      })).slice(0, 4);
    }

    return completions;
  }

  getName() {
    return '💬 ' + (0, _languageHandler._t)('Communities');
  }

  renderCompletions(completions
  /*: React.ReactNode[]*/
  )
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Autocomplete_Completion_container_pill mx_Autocomplete_Completion_container_truncate",
      role: "listbox",
      "aria-label": (0, _languageHandler._t)("Community Autocomplete")
    }, completions);
  }

}

exports.default = CommunityProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvQ29tbXVuaXR5UHJvdmlkZXIudHN4Il0sIm5hbWVzIjpbIkNPTU1VTklUWV9SRUdFWCIsInNjb3JlIiwicXVlcnkiLCJzcGFjZSIsImluZGV4IiwiaW5kZXhPZiIsIkluZmluaXR5IiwiQ29tbXVuaXR5UHJvdmlkZXIiLCJBdXRvY29tcGxldGVQcm92aWRlciIsImNvbnN0cnVjdG9yIiwibWF0Y2hlciIsIlF1ZXJ5TWF0Y2hlciIsImtleXMiLCJnZXRDb21wbGV0aW9ucyIsInNlbGVjdGlvbiIsImZvcmNlIiwiQmFzZUF2YXRhciIsInNkayIsImdldENvbXBvbmVudCIsInRlc3QiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjb21wbGV0aW9ucyIsImNvbW1hbmQiLCJyYW5nZSIsImdldEN1cnJlbnRDb21tYW5kIiwiam9pbmVkR3JvdXBzIiwiZ2V0R3JvdXBzIiwiZmlsdGVyIiwibXlNZW1iZXJzaGlwIiwiZ3JvdXBzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsImdyb3VwSWQiLCJGbGFpclN0b3JlIiwiZ2V0R3JvdXBQcm9maWxlQ2FjaGVkIiwiZSIsInJlc29sdmUiLCJuYW1lIiwiYXZhdGFyVXJsIiwic2hvcnREZXNjcmlwdGlvbiIsInNldE9iamVjdHMiLCJtYXRjaGVkU3RyaW5nIiwibWF0Y2giLCJjIiwibGVuZ3RoIiwiY29tcGxldGlvbiIsInN1ZmZpeCIsInR5cGUiLCJocmVmIiwiY29tcG9uZW50IiwibXhjVXJsVG9IdHRwIiwic2xpY2UiLCJnZXROYW1lIiwicmVuZGVyQ29tcGxldGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFBLE1BQU0sRUFBRSxHQUY0QjtBQUdwQ0MsUUFBQUEsSUFBSSxFQUFFLFdBSDhCO0FBSXBDQyxRQUFBQSxJQUFJLEVBQUUsb0NBQW1CaEIsT0FBbkIsQ0FKOEI7QUFLcENpQixRQUFBQSxTQUFTLGVBQ0wsNkJBQUMsMEJBQUQ7QUFBZ0IsVUFBQSxLQUFLLEVBQUVaLElBQXZCO0FBQTZCLFVBQUEsV0FBVyxFQUFFTDtBQUExQyx3QkFDSSw2QkFBQyxVQUFEO0FBQ0ksVUFBQSxJQUFJLEVBQUVLLElBQUksSUFBSUwsT0FEbEI7QUFFSSxVQUFBLEtBQUssRUFBRSxFQUZYO0FBR0ksVUFBQSxNQUFNLEVBQUUsRUFIWjtBQUlJLFVBQUEsR0FBRyxFQUFFTSxTQUFTLEdBQUdyQixHQUFHLENBQUNpQyxZQUFKLENBQWlCWixTQUFqQixFQUE0QixFQUE1QixFQUFnQyxFQUFoQyxDQUFILEdBQXlDO0FBSjNELFVBREosQ0FOZ0M7QUFjcENoQixRQUFBQTtBQWRvQyxPQUFqQyxDQUhPLEVBa0JWNkIsS0FsQlUsQ0FrQkosQ0FsQkksRUFrQkQsQ0FsQkMsQ0FBZDtBQW1CSDs7QUFDRCxXQUFPL0IsV0FBUDtBQUNIOztBQUVEZ0MsRUFBQUEsT0FBTyxHQUFHO0FBQ04sV0FBTyxRQUFRLHlCQUFHLGFBQUgsQ0FBZjtBQUNIOztBQUVEQyxFQUFBQSxpQkFBaUIsQ0FBQ2pDO0FBQUQ7QUFBQTtBQUFBO0FBQWtEO0FBQy9ELHdCQUNJO0FBQ0ksTUFBQSxTQUFTLEVBQUMseUZBRGQ7QUFFSSxNQUFBLElBQUksRUFBQyxTQUZUO0FBR0ksb0JBQVkseUJBQUcsd0JBQUg7QUFIaEIsT0FLTUEsV0FMTixDQURKO0FBU0g7O0FBL0UrRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTggTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBHcm91cCBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2dyb3VwXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQXV0b2NvbXBsZXRlUHJvdmlkZXIgZnJvbSAnLi9BdXRvY29tcGxldGVQcm92aWRlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBRdWVyeU1hdGNoZXIgZnJvbSAnLi9RdWVyeU1hdGNoZXInO1xuaW1wb3J0IHtQaWxsQ29tcGxldGlvbn0gZnJvbSAnLi9Db21wb25lbnRzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQge3NvcnRCeX0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHttYWtlR3JvdXBQZXJtYWxpbmt9IGZyb20gXCIuLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7SUNvbXBsZXRpb24sIElTZWxlY3Rpb25SYW5nZX0gZnJvbSBcIi4vQXV0b2NvbXBsZXRlclwiO1xuaW1wb3J0IEZsYWlyU3RvcmUgZnJvbSBcIi4uL3N0b3Jlcy9GbGFpclN0b3JlXCI7XG5cbmNvbnN0IENPTU1VTklUWV9SRUdFWCA9IC9cXEJcXCtcXFMqL2c7XG5cbmZ1bmN0aW9uIHNjb3JlKHF1ZXJ5LCBzcGFjZSkge1xuICAgIGNvbnN0IGluZGV4ID0gc3BhY2UuaW5kZXhPZihxdWVyeSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbXVuaXR5UHJvdmlkZXIgZXh0ZW5kcyBBdXRvY29tcGxldGVQcm92aWRlciB7XG4gICAgbWF0Y2hlcjogUXVlcnlNYXRjaGVyPEdyb3VwPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihDT01NVU5JVFlfUkVHRVgpO1xuICAgICAgICB0aGlzLm1hdGNoZXIgPSBuZXcgUXVlcnlNYXRjaGVyKFtdLCB7XG4gICAgICAgICAgICBrZXlzOiBbJ2dyb3VwSWQnLCAnbmFtZScsICdzaG9ydERlc2NyaXB0aW9uJ10sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGdldENvbXBsZXRpb25zKHF1ZXJ5OiBzdHJpbmcsIHNlbGVjdGlvbjogSVNlbGVjdGlvblJhbmdlLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxJQ29tcGxldGlvbltdPiB7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5hdmF0YXJzLkJhc2VBdmF0YXInKTtcblxuICAgICAgICAvLyBEaXNhYmxlIGF1dG9jb21wbGV0aW9ucyB3aGVuIGNvbXBvc2luZyBjb21tYW5kcyBiZWNhdXNlIG9mIHZhcmlvdXMgaXNzdWVzXG4gICAgICAgIC8vIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNDc2MilcbiAgICAgICAgaWYgKC9eKFxcL2pvaW58XFwvbGVhdmUpLy50ZXN0KHF1ZXJ5KSkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBsZXQgY29tcGxldGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIHJhbmdlfSA9IHRoaXMuZ2V0Q3VycmVudENvbW1hbmQocXVlcnksIHNlbGVjdGlvbiwgZm9yY2UpO1xuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgY29uc3Qgam9pbmVkR3JvdXBzID0gY2xpLmdldEdyb3VwcygpLmZpbHRlcigoe215TWVtYmVyc2hpcH0pID0+IG15TWVtYmVyc2hpcCA9PT0gJ2pvaW4nKTtcblxuICAgICAgICAgICAgY29uc3QgZ3JvdXBzID0gKGF3YWl0IFByb21pc2UuYWxsKGpvaW5lZEdyb3Vwcy5tYXAoYXN5bmMgKHtncm91cElkfSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGbGFpclN0b3JlLmdldEdyb3VwUHJvZmlsZUNhY2hlZChjbGksIGdyb3VwSWQpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgLy8gaWYgRmxhaXJTdG9yZSBmYWlsZWQsIGZhbGwgYmFjayB0byBqdXN0IGdyb3VwSWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnREZXNjcmlwdGlvbjogJycsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKSk7XG5cbiAgICAgICAgICAgIHRoaXMubWF0Y2hlci5zZXRPYmplY3RzKGdyb3Vwcyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRTdHJpbmcgPSBjb21tYW5kWzBdO1xuICAgICAgICAgICAgY29tcGxldGlvbnMgPSB0aGlzLm1hdGNoZXIubWF0Y2gobWF0Y2hlZFN0cmluZyk7XG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IHNvcnRCeShjb21wbGV0aW9ucywgW1xuICAgICAgICAgICAgICAgIChjKSA9PiBzY29yZShtYXRjaGVkU3RyaW5nLCBjLmdyb3VwSWQpLFxuICAgICAgICAgICAgICAgIChjKSA9PiBjLmdyb3VwSWQubGVuZ3RoLFxuICAgICAgICAgICAgXSkubWFwKCh7YXZhdGFyVXJsLCBncm91cElkLCBuYW1lfSkgPT4gKHtcbiAgICAgICAgICAgICAgICBjb21wbGV0aW9uOiBncm91cElkLFxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJyAnLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiY29tbXVuaXR5XCIsXG4gICAgICAgICAgICAgICAgaHJlZjogbWFrZUdyb3VwUGVybWFsaW5rKGdyb3VwSWQpLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogKFxuICAgICAgICAgICAgICAgICAgICA8UGlsbENvbXBsZXRpb24gdGl0bGU9e25hbWV9IGRlc2NyaXB0aW9uPXtncm91cElkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17bmFtZSB8fCBncm91cElkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXsyNH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezI0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybD17YXZhdGFyVXJsID8gY2xpLm14Y1VybFRvSHR0cChhdmF0YXJVcmwsIDI0LCAyNCkgOiBudWxsfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L1BpbGxDb21wbGV0aW9uPlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgICB9KSkuc2xpY2UoMCwgNCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRpb25zO1xuICAgIH1cblxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiAn8J+SrCAnICsgX3QoJ0NvbW11bml0aWVzJyk7XG4gICAgfVxuXG4gICAgcmVuZGVyQ29tcGxldGlvbnMoY29tcGxldGlvbnM6IFJlYWN0LlJlYWN0Tm9kZVtdKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl9jb250YWluZXJfcGlsbCBteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl9jb250YWluZXJfdHJ1bmNhdGVcIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJsaXN0Ym94XCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIkNvbW11bml0eSBBdXRvY29tcGxldGVcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjb21wbGV0aW9ucyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=