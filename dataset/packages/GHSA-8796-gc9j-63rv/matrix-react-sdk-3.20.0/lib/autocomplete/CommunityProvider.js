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

var _Media = require("../customisations/Media");

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
          url: avatarUrl ? (0, _Media.mediaFromMxc)(avatarUrl).getSquareThumbnailHttp(24) : null
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvQ29tbXVuaXR5UHJvdmlkZXIudHN4Il0sIm5hbWVzIjpbIkNPTU1VTklUWV9SRUdFWCIsInNjb3JlIiwicXVlcnkiLCJzcGFjZSIsImluZGV4IiwiaW5kZXhPZiIsIkluZmluaXR5IiwiQ29tbXVuaXR5UHJvdmlkZXIiLCJBdXRvY29tcGxldGVQcm92aWRlciIsImNvbnN0cnVjdG9yIiwibWF0Y2hlciIsIlF1ZXJ5TWF0Y2hlciIsImtleXMiLCJnZXRDb21wbGV0aW9ucyIsInNlbGVjdGlvbiIsImZvcmNlIiwiQmFzZUF2YXRhciIsInNkayIsImdldENvbXBvbmVudCIsInRlc3QiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjb21wbGV0aW9ucyIsImNvbW1hbmQiLCJyYW5nZSIsImdldEN1cnJlbnRDb21tYW5kIiwiam9pbmVkR3JvdXBzIiwiZ2V0R3JvdXBzIiwiZmlsdGVyIiwibXlNZW1iZXJzaGlwIiwiZ3JvdXBzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsImdyb3VwSWQiLCJGbGFpclN0b3JlIiwiZ2V0R3JvdXBQcm9maWxlQ2FjaGVkIiwiZSIsInJlc29sdmUiLCJuYW1lIiwiYXZhdGFyVXJsIiwic2hvcnREZXNjcmlwdGlvbiIsInNldE9iamVjdHMiLCJtYXRjaGVkU3RyaW5nIiwibWF0Y2giLCJjIiwibGVuZ3RoIiwiY29tcGxldGlvbiIsInN1ZmZpeCIsInR5cGUiLCJocmVmIiwiY29tcG9uZW50IiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsInNsaWNlIiwiZ2V0TmFtZSIsInJlbmRlckNvbXBsZXRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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YixPQUR3QjtBQUVwQ2MsUUFBQUEsTUFBTSxFQUFFLEdBRjRCO0FBR3BDQyxRQUFBQSxJQUFJLEVBQUUsV0FIOEI7QUFJcENDLFFBQUFBLElBQUksRUFBRSxvQ0FBbUJoQixPQUFuQixDQUo4QjtBQUtwQ2lCLFFBQUFBLFNBQVMsZUFDTCw2QkFBQywwQkFBRDtBQUFnQixVQUFBLEtBQUssRUFBRVosSUFBdkI7QUFBNkIsVUFBQSxXQUFXLEVBQUVMO0FBQTFDLHdCQUNJLDZCQUFDLFVBQUQ7QUFDSSxVQUFBLElBQUksRUFBRUssSUFBSSxJQUFJTCxPQURsQjtBQUVJLFVBQUEsS0FBSyxFQUFFLEVBRlg7QUFHSSxVQUFBLE1BQU0sRUFBRSxFQUhaO0FBSUksVUFBQSxHQUFHLEVBQUVNLFNBQVMsR0FBRyx5QkFBYUEsU0FBYixFQUF3Qlksc0JBQXhCLENBQStDLEVBQS9DLENBQUgsR0FBd0Q7QUFKMUUsVUFESixDQU5nQztBQWNwQzVCLFFBQUFBO0FBZG9DLE9BQWpDLENBSE8sRUFrQlY2QixLQWxCVSxDQWtCSixDQWxCSSxFQWtCRCxDQWxCQyxDQUFkO0FBbUJIOztBQUNELFdBQU8vQixXQUFQO0FBQ0g7O0FBRURnQyxFQUFBQSxPQUFPLEdBQUc7QUFDTixXQUFPLFFBQVEseUJBQUcsYUFBSCxDQUFmO0FBQ0g7O0FBRURDLEVBQUFBLGlCQUFpQixDQUFDakM7QUFBRDtBQUFBO0FBQUE7QUFBa0Q7QUFDL0Qsd0JBQ0k7QUFDSSxNQUFBLFNBQVMsRUFBQyx5RkFEZDtBQUVJLE1BQUEsSUFBSSxFQUFDLFNBRlQ7QUFHSSxvQkFBWSx5QkFBRyx3QkFBSDtBQUhoQixPQUtNQSxXQUxOLENBREo7QUFTSDs7QUEvRStEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IEdyb3VwIGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZ3JvdXBcIjtcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBdXRvY29tcGxldGVQcm92aWRlciBmcm9tICcuL0F1dG9jb21wbGV0ZVByb3ZpZGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFF1ZXJ5TWF0Y2hlciBmcm9tICcuL1F1ZXJ5TWF0Y2hlcic7XG5pbXBvcnQge1BpbGxDb21wbGV0aW9ufSBmcm9tICcuL0NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7c29ydEJ5fSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge21ha2VHcm91cFBlcm1hbGlua30gZnJvbSBcIi4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHtJQ29tcGxldGlvbiwgSVNlbGVjdGlvblJhbmdlfSBmcm9tIFwiLi9BdXRvY29tcGxldGVyXCI7XG5pbXBvcnQgRmxhaXJTdG9yZSBmcm9tIFwiLi4vc3RvcmVzL0ZsYWlyU3RvcmVcIjtcbmltcG9ydCB7bWVkaWFGcm9tTXhjfSBmcm9tIFwiLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcblxuY29uc3QgQ09NTVVOSVRZX1JFR0VYID0gL1xcQlxcK1xcUyovZztcblxuZnVuY3Rpb24gc2NvcmUocXVlcnksIHNwYWNlKSB7XG4gICAgY29uc3QgaW5kZXggPSBzcGFjZS5pbmRleE9mKHF1ZXJ5KTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tdW5pdHlQcm92aWRlciBleHRlbmRzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcbiAgICBtYXRjaGVyOiBRdWVyeU1hdGNoZXI8R3JvdXA+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKENPTU1VTklUWV9SRUdFWCk7XG4gICAgICAgIHRoaXMubWF0Y2hlciA9IG5ldyBRdWVyeU1hdGNoZXIoW10sIHtcbiAgICAgICAgICAgIGtleXM6IFsnZ3JvdXBJZCcsICduYW1lJywgJ3Nob3J0RGVzY3JpcHRpb24nXSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0Q29tcGxldGlvbnMocXVlcnk6IHN0cmluZywgc2VsZWN0aW9uOiBJU2VsZWN0aW9uUmFuZ2UsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPElDb21wbGV0aW9uW10+IHtcbiAgICAgICAgY29uc3QgQmFzZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmF2YXRhcnMuQmFzZUF2YXRhcicpO1xuXG4gICAgICAgIC8vIERpc2FibGUgYXV0b2NvbXBsZXRpb25zIHdoZW4gY29tcG9zaW5nIGNvbW1hbmRzIGJlY2F1c2Ugb2YgdmFyaW91cyBpc3N1ZXNcbiAgICAgICAgLy8gKHNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy80NzYyKVxuICAgICAgICBpZiAoL14oXFwvam9pbnxcXC9sZWF2ZSkvLnRlc3QocXVlcnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGxldCBjb21wbGV0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgcmFuZ2V9ID0gdGhpcy5nZXRDdXJyZW50Q29tbWFuZChxdWVyeSwgc2VsZWN0aW9uLCBmb3JjZSk7XG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBjb25zdCBqb2luZWRHcm91cHMgPSBjbGkuZ2V0R3JvdXBzKCkuZmlsdGVyKCh7bXlNZW1iZXJzaGlwfSkgPT4gbXlNZW1iZXJzaGlwID09PSAnam9pbicpO1xuXG4gICAgICAgICAgICBjb25zdCBncm91cHMgPSAoYXdhaXQgUHJvbWlzZS5hbGwoam9pbmVkR3JvdXBzLm1hcChhc3luYyAoe2dyb3VwSWR9KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZsYWlyU3RvcmUuZ2V0R3JvdXBQcm9maWxlQ2FjaGVkKGNsaSwgZ3JvdXBJZCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyAvLyBpZiBGbGFpclN0b3JlIGZhaWxlZCwgZmFsbCBiYWNrIHRvIGp1c3QgZ3JvdXBJZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG9ydERlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpKTtcblxuICAgICAgICAgICAgdGhpcy5tYXRjaGVyLnNldE9iamVjdHMoZ3JvdXBzKTtcblxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlZFN0cmluZyA9IGNvbW1hbmRbMF07XG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IHRoaXMubWF0Y2hlci5tYXRjaChtYXRjaGVkU3RyaW5nKTtcbiAgICAgICAgICAgIGNvbXBsZXRpb25zID0gc29ydEJ5KGNvbXBsZXRpb25zLCBbXG4gICAgICAgICAgICAgICAgKGMpID0+IHNjb3JlKG1hdGNoZWRTdHJpbmcsIGMuZ3JvdXBJZCksXG4gICAgICAgICAgICAgICAgKGMpID0+IGMuZ3JvdXBJZC5sZW5ndGgsXG4gICAgICAgICAgICBdKS5tYXAoKHthdmF0YXJVcmwsIGdyb3VwSWQsIG5hbWV9KSA9PiAoe1xuICAgICAgICAgICAgICAgIGNvbXBsZXRpb246IGdyb3VwSWQsXG4gICAgICAgICAgICAgICAgc3VmZml4OiAnICcsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJjb21tdW5pdHlcIixcbiAgICAgICAgICAgICAgICBocmVmOiBtYWtlR3JvdXBQZXJtYWxpbmsoZ3JvdXBJZCksXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiAoXG4gICAgICAgICAgICAgICAgICAgIDxQaWxsQ29tcGxldGlvbiB0aXRsZT17bmFtZX0gZGVzY3JpcHRpb249e2dyb3VwSWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtuYW1lIHx8IGdyb3VwSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezI0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17MjR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXthdmF0YXJVcmwgPyBtZWRpYUZyb21NeGMoYXZhdGFyVXJsKS5nZXRTcXVhcmVUaHVtYm5haWxIdHRwKDI0KSA6IG51bGx9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvUGlsbENvbXBsZXRpb24+XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICByYW5nZSxcbiAgICAgICAgICAgIH0pKS5zbGljZSgwLCA0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcGxldGlvbnM7XG4gICAgfVxuXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICfwn5KsICcgKyBfdCgnQ29tbXVuaXRpZXMnKTtcbiAgICB9XG5cbiAgICByZW5kZXJDb21wbGV0aW9ucyhjb21wbGV0aW9uczogUmVhY3QuUmVhY3ROb2RlW10pOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0F1dG9jb21wbGV0ZV9Db21wbGV0aW9uX2NvbnRhaW5lcl9waWxsIG14X0F1dG9jb21wbGV0ZV9Db21wbGV0aW9uX2NvbnRhaW5lcl90cnVuY2F0ZVwiXG4gICAgICAgICAgICAgICAgcm9sZT1cImxpc3Rib3hcIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiQ29tbXVuaXR5IEF1dG9jb21wbGV0ZVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNvbXBsZXRpb25zIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==