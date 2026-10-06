"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _AutocompleteProvider = _interopRequireDefault(require("./AutocompleteProvider"));

var _QueryMatcher = _interopRequireDefault(require("./QueryMatcher"));

var _Components = require("./Components");

var _SlashCommands = require("../SlashCommands");

/*
Copyright 2016 Aviral Dasgupta
Copyright 2017 Vector Creations Ltd
Copyright 2017 New Vector Ltd
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
const COMMAND_RE = /(^\/\w*)(?: .*)?/g;

class CommandProvider extends _AutocompleteProvider.default {
  constructor() {
    super(COMMAND_RE);
    (0, _defineProperty2.default)(this, "matcher", void 0);
    this.matcher = new _QueryMatcher.default(_SlashCommands.Commands, {
      keys: ['command', 'args', 'description'],
      funcs: [({
        aliases
      }) => aliases.join(" ")] // aliases

    });
  }

  async getCompletions(query
  /*: string*/
  , selection
  /*: ISelectionRange*/
  , force
  /*: boolean*/
  )
  /*: Promise<ICompletion[]>*/
  {
    const {
      command,
      range
    } = this.getCurrentCommand(query, selection);
    if (!command) return [];
    let matches = []; // check if the full match differs from the first word (i.e. returns false if the command has args)

    if (command[0] !== command[1]) {
      // The input looks like a command with arguments, perform exact match
      const name = command[1].substr(1); // strip leading `/`

      if (_SlashCommands.CommandMap.has(name) && _SlashCommands.CommandMap.get(name).isEnabled()) {
        // some commands, namely `me` and `ddg` don't suit having the usage shown whilst typing their arguments
        if (_SlashCommands.CommandMap.get(name).hideCompletionAfterSpace) return [];
        matches = [_SlashCommands.CommandMap.get(name)];
      }
    } else {
      if (query === '/') {
        // If they have just entered `/` show everything
        matches = _SlashCommands.Commands;
      } else {
        // otherwise fuzzy match against all of the fields
        matches = this.matcher.match(command[1]);
      }
    }

    return matches.filter(cmd => cmd.isEnabled()).map(result => {
      let completion = result.getCommand() + ' ';
      const usedAlias = result.aliases.find(alias => `/${alias}` === command[1]); // If the command (or an alias) is the same as the one they entered, we don't want to discard their arguments

      if (usedAlias || result.getCommand() === command[1]) {
        completion = command[0];
      }

      return {
        completion,
        type: "command",
        component: /*#__PURE__*/_react.default.createElement(_Components.TextualCompletion, {
          title: `/${usedAlias || result.command}`,
          subtitle: result.args,
          description: (0, _languageHandler._t)(result.description)
        }),
        range
      };
    });
  }

  getName() {
    return '*️⃣ ' + (0, _languageHandler._t)('Commands');
  }

  renderCompletions(completions
  /*: React.ReactNode[]*/
  )
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Autocomplete_Completion_container_block",
      role: "listbox",
      "aria-label": (0, _languageHandler._t)("Command Autocomplete")
    }, completions);
  }

}

exports.default = CommandProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvQ29tbWFuZFByb3ZpZGVyLnRzeCJdLCJuYW1lcyI6WyJDT01NQU5EX1JFIiwiQ29tbWFuZFByb3ZpZGVyIiwiQXV0b2NvbXBsZXRlUHJvdmlkZXIiLCJjb25zdHJ1Y3RvciIsIm1hdGNoZXIiLCJRdWVyeU1hdGNoZXIiLCJDb21tYW5kcyIsImtleXMiLCJmdW5jcyIsImFsaWFzZXMiLCJqb2luIiwiZ2V0Q29tcGxldGlvbnMiLCJxdWVyeSIsInNlbGVjdGlvbiIsImZvcmNlIiwiY29tbWFuZCIsInJhbmdlIiwiZ2V0Q3VycmVudENvbW1hbmQiLCJtYXRjaGVzIiwibmFtZSIsInN1YnN0ciIsIkNvbW1hbmRNYXAiLCJoYXMiLCJnZXQiLCJpc0VuYWJsZWQiLCJoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2UiLCJtYXRjaCIsImZpbHRlciIsImNtZCIsIm1hcCIsInJlc3VsdCIsImNvbXBsZXRpb24iLCJnZXRDb21tYW5kIiwidXNlZEFsaWFzIiwiZmluZCIsImFsaWFzIiwidHlwZSIsImNvbXBvbmVudCIsImFyZ3MiLCJkZXNjcmlwdGlvbiIsImdldE5hbWUiLCJyZW5kZXJDb21wbGV0aW9ucyIsImNvbXBsZXRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVUEsTUFBTUEsVUFBVSxHQUFHLG1CQUFuQjs7QUFFZSxNQUFNQyxlQUFOLFNBQThCQyw2QkFBOUIsQ0FBbUQ7QUFHOURDLEVBQUFBLFdBQVcsR0FBRztBQUNWLFVBQU1ILFVBQU47QUFEVTtBQUVWLFNBQUtJLE9BQUwsR0FBZSxJQUFJQyxxQkFBSixDQUFpQkMsdUJBQWpCLEVBQTJCO0FBQ3RDQyxNQUFBQSxJQUFJLEVBQUUs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QUFBLFNBQVMsRUFBQyw0Q0FEZDtBQUVJLE1BQUEsSUFBSSxFQUFDLFNBRlQ7QUFHSSxvQkFBWSx5QkFBRyxzQkFBSDtBQUhoQixPQUtNQSxXQUxOLENBREo7QUFTSDs7QUF0RTZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IEF2aXJhbCBEYXNndXB0YVxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtfdH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBdXRvY29tcGxldGVQcm92aWRlciBmcm9tICcuL0F1dG9jb21wbGV0ZVByb3ZpZGVyJztcbmltcG9ydCBRdWVyeU1hdGNoZXIgZnJvbSAnLi9RdWVyeU1hdGNoZXInO1xuaW1wb3J0IHtUZXh0dWFsQ29tcGxldGlvbn0gZnJvbSAnLi9Db21wb25lbnRzJztcbmltcG9ydCB7SUNvbXBsZXRpb24sIElTZWxlY3Rpb25SYW5nZX0gZnJvbSBcIi4vQXV0b2NvbXBsZXRlclwiO1xuaW1wb3J0IHtDb21tYW5kLCBDb21tYW5kcywgQ29tbWFuZE1hcH0gZnJvbSAnLi4vU2xhc2hDb21tYW5kcyc7XG5cbmNvbnN0IENPTU1BTkRfUkUgPSAvKF5cXC9cXHcqKSg/OiAuKik/L2c7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRQcm92aWRlciBleHRlbmRzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcbiAgICBtYXRjaGVyOiBRdWVyeU1hdGNoZXI8Q29tbWFuZD47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoQ09NTUFORF9SRSk7XG4gICAgICAgIHRoaXMubWF0Y2hlciA9IG5ldyBRdWVyeU1hdGNoZXIoQ29tbWFuZHMsIHtcbiAgICAgICAgICAgIGtleXM6IFsnY29tbWFuZCcsICdhcmdzJywgJ2Rlc2NyaXB0aW9uJ10sXG4gICAgICAgICAgICBmdW5jczogWyh7YWxpYXNlc30pID0+IGFsaWFzZXMuam9pbihcIiBcIildLCAvLyBhbGlhc2VzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGdldENvbXBsZXRpb25zKHF1ZXJ5OiBzdHJpbmcsIHNlbGVjdGlvbjogSVNlbGVjdGlvblJhbmdlLCBmb3JjZT86IGJvb2xlYW4pOiBQcm9taXNlPElDb21wbGV0aW9uW10+IHtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIHJhbmdlfSA9IHRoaXMuZ2V0Q3VycmVudENvbW1hbmQocXVlcnksIHNlbGVjdGlvbik7XG4gICAgICAgIGlmICghY29tbWFuZCkgcmV0dXJuIFtdO1xuXG4gICAgICAgIGxldCBtYXRjaGVzID0gW107XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBmdWxsIG1hdGNoIGRpZmZlcnMgZnJvbSB0aGUgZmlyc3Qgd29yZCAoaS5lLiByZXR1cm5zIGZhbHNlIGlmIHRoZSBjb21tYW5kIGhhcyBhcmdzKVxuICAgICAgICBpZiAoY29tbWFuZFswXSAhPT0gY29tbWFuZFsxXSkge1xuICAgICAgICAgICAgLy8gVGhlIGlucHV0IGxvb2tzIGxpa2UgYSBjb21tYW5kIHdpdGggYXJndW1lbnRzLCBwZXJmb3JtIGV4YWN0IG1hdGNoXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY29tbWFuZFsxXS5zdWJzdHIoMSk7IC8vIHN0cmlwIGxlYWRpbmcgYC9gXG4gICAgICAgICAgICBpZiAoQ29tbWFuZE1hcC5oYXMobmFtZSkgJiYgQ29tbWFuZE1hcC5nZXQobmFtZSkuaXNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBzb21lIGNvbW1hbmRzLCBuYW1lbHkgYG1lYCBhbmQgYGRkZ2AgZG9uJ3Qgc3VpdCBoYXZpbmcgdGhlIHVzYWdlIHNob3duIHdoaWxzdCB0eXBpbmcgdGhlaXIgYXJndW1lbnRzXG4gICAgICAgICAgICAgICAgaWYgKENvbW1hbmRNYXAuZ2V0KG5hbWUpLmhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBbQ29tbWFuZE1hcC5nZXQobmFtZSldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHF1ZXJ5ID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGV5IGhhdmUganVzdCBlbnRlcmVkIGAvYCBzaG93IGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gQ29tbWFuZHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBmdXp6eSBtYXRjaCBhZ2FpbnN0IGFsbCBvZiB0aGUgZmllbGRzXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHRoaXMubWF0Y2hlci5tYXRjaChjb21tYW5kWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZXMuZmlsdGVyKGNtZCA9PiBjbWQuaXNFbmFibGVkKCkpLm1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBsZXQgY29tcGxldGlvbiA9IHJlc3VsdC5nZXRDb21tYW5kKCkgKyAnICc7XG4gICAgICAgICAgICBjb25zdCB1c2VkQWxpYXMgPSByZXN1bHQuYWxpYXNlcy5maW5kKGFsaWFzID0+IGAvJHthbGlhc31gID09PSBjb21tYW5kWzFdKTtcbiAgICAgICAgICAgIC8vIElmIHRoZSBjb21tYW5kIChvciBhbiBhbGlhcykgaXMgdGhlIHNhbWUgYXMgdGhlIG9uZSB0aGV5IGVudGVyZWQsIHdlIGRvbid0IHdhbnQgdG8gZGlzY2FyZCB0aGVpciBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmICh1c2VkQWxpYXMgfHwgcmVzdWx0LmdldENvbW1hbmQoKSA9PT0gY29tbWFuZFsxXSkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRpb24gPSBjb21tYW5kWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRpb24sXG4gICAgICAgICAgICAgICAgdHlwZTogXCJjb21tYW5kXCIsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiA8VGV4dHVhbENvbXBsZXRpb25cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2AvJHt1c2VkQWxpYXMgfHwgcmVzdWx0LmNvbW1hbmR9YH1cbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU9e3Jlc3VsdC5hcmdzfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbj17X3QocmVzdWx0LmRlc2NyaXB0aW9uKX0gLz4sXG4gICAgICAgICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gJyrvuI/ig6MgJyArIF90KCdDb21tYW5kcycpO1xuICAgIH1cblxuICAgIHJlbmRlckNvbXBsZXRpb25zKGNvbXBsZXRpb25zOiBSZWFjdC5SZWFjdE5vZGVbXSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fY29udGFpbmVyX2Jsb2NrXCJcbiAgICAgICAgICAgICAgICByb2xlPVwibGlzdGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJDb21tYW5kIEF1dG9jb21wbGV0ZVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNvbXBsZXRpb25zIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==