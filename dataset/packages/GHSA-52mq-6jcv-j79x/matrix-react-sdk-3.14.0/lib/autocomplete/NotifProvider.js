"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _AutocompleteProvider = _interopRequireDefault(require("./AutocompleteProvider"));

var _languageHandler = require("../languageHandler");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _Components = require("./Components");

var sdk = _interopRequireWildcard(require("../index"));

/*
Copyright 2017 New Vector Ltd

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
const AT_ROOM_REGEX = /@\S*/g;

class NotifProvider extends _AutocompleteProvider.default {
  constructor(room) {
    super(AT_ROOM_REGEX);
    (0, _defineProperty2.default)(this, "room", void 0);
    this.room = room;
  }

  async getCompletions(query
  /*: string*/
  , selection
  /*: ISelectionRange*/
  , force = false)
  /*: Promise<ICompletion[]>*/
  {
    const RoomAvatar = sdk.getComponent('views.avatars.RoomAvatar');

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!this.room.currentState.mayTriggerNotifOfType('room', client.credentials.userId)) return [];
    const {
      command,
      range
    } = this.getCurrentCommand(query, selection, force);

    if (command && command[0] && '@room'.startsWith(command[0]) && command[0].length > 1) {
      return [{
        completion: '@room',
        completionId: '@room',
        type: "at-room",
        suffix: ' ',
        component: /*#__PURE__*/_react.default.createElement(_Components.PillCompletion, {
          title: "@room",
          description: (0, _languageHandler._t)("Notify the whole room")
        }, /*#__PURE__*/_react.default.createElement(RoomAvatar, {
          width: 24,
          height: 24,
          room: this.room
        })),
        range
      }];
    }

    return [];
  }

  getName() {
    return '❗️ ' + (0, _languageHandler._t)('Room Notification');
  }

  renderCompletions(completions
  /*: React.ReactNode[]*/
  )
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Autocomplete_Completion_container_pill mx_Autocomplete_Completion_container_truncate",
      role: "listbox",
      "aria-label": (0, _languageHandler._t)("Notification Autocomplete")
    }, completions);
  }

}

exports.default = NotifProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvTm90aWZQcm92aWRlci50c3giXSwibmFtZXMiOlsiQVRfUk9PTV9SRUdFWCIsIk5vdGlmUHJvdmlkZXIiLCJBdXRvY29tcGxldGVQcm92aWRlciIsImNvbnN0cnVjdG9yIiwicm9vbSIsImdldENvbXBsZXRpb25zIiwicXVlcnkiLCJzZWxlY3Rpb24iLCJmb3JjZSIsIlJvb21BdmF0YXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjdXJyZW50U3RhdGUiLCJtYXlUcmlnZ2VyTm90aWZPZlR5cGUiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsImNvbW1hbmQiLCJyYW5nZSIsImdldEN1cnJlbnRDb21tYW5kIiwic3RhcnRzV2l0aCIsImxlbmd0aCIsImNvbXBsZXRpb24iLCJjb21wbGV0aW9uSWQiLCJ0eXBlIiwic3VmZml4IiwiY29tcG9uZW50IiwiZ2V0TmFtZSIsInJlbmRlckNvbXBsZXRpb25zIiwiY29tcGxldGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVdBLE1BQU1BLGFBQWEsR0FBRyxPQUF0Qjs7QUFFZSxNQUFNQyxhQUFOLFNBQTRCQyw2QkFBNUIsQ0FBaUQ7QUFHNURDLEVBQUFBLFdBQVcsQ0FBQ0MsSUFBRCxFQUFPO0FBQ2QsVUFBTUosYUFBTjtBQURjO0FBRWQsU0FBS0ksSUFBTCxHQUFZQSxJQUFaO0FBQ0g7O0FBRUQsUUFBTUMsY0FBTixDQUFxQkM7QUFBckI7QUFBQSxJQUFvQ0M7QUFBcEM7QUFBQSxJQUFnRUMsS0FBSyxHQUFFLEtBQXZFO0FBQUE7QUFBc0c7QUFDbEcsVUFBTUMsVUFBVSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5COztBQUVBLFVBQU1DLE1BQU0sR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFmOztBQUVBLFFBQUksQ0FBQyxLQUFLVixJQUFMLENBQVVXLFlBQVYsQ0FBdUJDLHFCQUF2QixDQUE2QyxNQUE3QyxFQUFxREosTUFBTSxDQUFDSyxXQUFQLENBQW1CQyxNQUF4RSxDQUFMLEVBQXNGLE9BQU8sRUFBUDtBQUV0RixVQUFNO0FBQUNDLE1BQUFBLE9BQUQ7QUFBVUMsTUFBQUE7QUFBVixRQUFtQixLQUFLQyxpQkFBTCxDQUF1QmYsS0FBdkIsRUFBOEJDLFNBQTlCLEVBQXlDQyxLQUF6QyxDQUF6Qjs7QUFDQSxRQUFJVyxPQUFPLElBQUlBLE9BQU8sQ0FBQyxDQUFELENBQWxCLElBQXlCLFFBQVFHLFVBQVIsQ0FBbUJILE9BQU8sQ0FBQyxDQUFELENBQTFCLENBQXpCLElBQTJEQSxPQUFPLENBQUMsQ0FBRCxDQUFQLENBQVdJLE1BQVgsR0FBb0IsQ0FBbkYsRUFBc0Y7QUFDbEYsYUFBTyxDQUFDO0FBQ0pDLFFBQUFBLFVBQVUsRUFBRSxPQURSO0FBRUpDLFFBQUFBLFlBQVksRUFBRSxPQUZWO0FBR0pDLFFBQUFBLElBQUksRUFBRSxTQUhGO0FBSUpDLFFBQUFBLE1BQU0sRUFBRSxHQUpKO0FBS0pDLFFBQUFBLFNBQVMsZUFDTCw2QkFBQywwQkFBRDtBQUFnQixVQUFBLEtBQUssRUFBQyxPQUF0QjtBQUE4QixVQUFBLFdBQVcsRUFBRSx5QkFBRyx1QkFBSDtBQUEzQyx3QkFDSSw2QkFBQyxVQUFEO0FBQVksVUFBQSxLQUFLLEVBQUUsRUFBbkI7QUFBdUIsVUFBQSxNQUFNLEVBQUUsRUFBL0I7QUFBbUMsVUFBQSxJQUFJLEVBQUUsS0FBS3hCO0FBQTlDLFVBREosQ0FOQTtBQVVKZ0IsUUFBQUE7QUFWSSxPQUFELENBQVA7QUFZSDs7QUFDRCxXQUFPLEVBQVA7QUFDSDs7QUFFRFMsRUFBQUEsT0FBTyxHQUFHO0FBQ04sV0FBTyxRQUFRLHlCQUFHLG1CQUFILENBQWY7QUFDSDs7QUFFREMsRUFBQUEsaUJBQWlCLENBQUNDO0FBQUQ7QUFBQTtBQUFBO0FBQWtEO0FBQy9ELHdCQUNJO0FBQ0ksTUFBQSxTQUFTLEVBQUMseUZBRGQ7QUFFSSxNQUFBLElBQUksRUFBQyxTQUZUO0FBR0ksb0JBQVkseUJBQUcsMkJBQUg7QUFIaEIsT0FLTUEsV0FMTixDQURKO0FBU0g7O0FBL0MyRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm9vbSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBBdXRvY29tcGxldGVQcm92aWRlciBmcm9tICcuL0F1dG9jb21wbGV0ZVByb3ZpZGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHtQaWxsQ29tcGxldGlvbn0gZnJvbSAnLi9Db21wb25lbnRzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQge0lDb21wbGV0aW9uLCBJU2VsZWN0aW9uUmFuZ2V9IGZyb20gXCIuL0F1dG9jb21wbGV0ZXJcIjtcblxuY29uc3QgQVRfUk9PTV9SRUdFWCA9IC9AXFxTKi9nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3RpZlByb3ZpZGVyIGV4dGVuZHMgQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuICAgIHJvb206IFJvb207XG5cbiAgICBjb25zdHJ1Y3Rvcihyb29tKSB7XG4gICAgICAgIHN1cGVyKEFUX1JPT01fUkVHRVgpO1xuICAgICAgICB0aGlzLnJvb20gPSByb29tO1xuICAgIH1cblxuICAgIGFzeW5jIGdldENvbXBsZXRpb25zKHF1ZXJ5OiBzdHJpbmcsIHNlbGVjdGlvbjogSVNlbGVjdGlvblJhbmdlLCBmb3JjZT0gZmFsc2UpOiBQcm9taXNlPElDb21wbGV0aW9uW10+IHtcbiAgICAgICAgY29uc3QgUm9vbUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmF2YXRhcnMuUm9vbUF2YXRhcicpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBpZiAoIXRoaXMucm9vbS5jdXJyZW50U3RhdGUubWF5VHJpZ2dlck5vdGlmT2ZUeXBlKCdyb29tJywgY2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCkpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCB7Y29tbWFuZCwgcmFuZ2V9ID0gdGhpcy5nZXRDdXJyZW50Q29tbWFuZChxdWVyeSwgc2VsZWN0aW9uLCBmb3JjZSk7XG4gICAgICAgIGlmIChjb21tYW5kICYmIGNvbW1hbmRbMF0gJiYgJ0Byb29tJy5zdGFydHNXaXRoKGNvbW1hbmRbMF0pICYmIGNvbW1hbmRbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgY29tcGxldGlvbjogJ0Byb29tJyxcbiAgICAgICAgICAgICAgICBjb21wbGV0aW9uSWQ6ICdAcm9vbScsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhdC1yb29tXCIsXG4gICAgICAgICAgICAgICAgc3VmZml4OiAnICcsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiAoXG4gICAgICAgICAgICAgICAgICAgIDxQaWxsQ29tcGxldGlvbiB0aXRsZT1cIkByb29tXCIgZGVzY3JpcHRpb249e190KFwiTm90aWZ5IHRoZSB3aG9sZSByb29tXCIpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHdpZHRoPXsyNH0gaGVpZ2h0PXsyNH0gcm9vbT17dGhpcy5yb29tfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L1BpbGxDb21wbGV0aW9uPlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICfinZfvuI8gJyArIF90KCdSb29tIE5vdGlmaWNhdGlvbicpO1xuICAgIH1cblxuICAgIHJlbmRlckNvbXBsZXRpb25zKGNvbXBsZXRpb25zOiBSZWFjdC5SZWFjdE5vZGVbXSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fY29udGFpbmVyX3BpbGwgbXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fY29udGFpbmVyX3RydW5jYXRlXCJcbiAgICAgICAgICAgICAgICByb2xlPVwibGlzdGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJOb3RpZmljYXRpb24gQXV0b2NvbXBsZXRlXCIpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgY29tcGxldGlvbnMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19