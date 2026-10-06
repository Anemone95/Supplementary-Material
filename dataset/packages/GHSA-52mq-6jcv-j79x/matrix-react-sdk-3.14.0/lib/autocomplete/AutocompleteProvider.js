"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2016 Aviral Dasgupta
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018 New Vector Ltd

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

/*:: export interface ICommand {
    command: string | null;
    range: {
        start: number;
        end: number;
    };
}*/
class AutocompleteProvider {
  constructor(commandRegex
  /*: RegExp*/
  , forcedCommandRegex
  /*: RegExp*/
  ) {
    (0, _defineProperty2.default)(this, "commandRegex", void 0);
    (0, _defineProperty2.default)(this, "forcedCommandRegex", void 0);

    if (commandRegex) {
      if (!commandRegex.global) {
        throw new Error('commandRegex must have global flag set');
      }

      this.commandRegex = commandRegex;
    }

    if (forcedCommandRegex) {
      if (!forcedCommandRegex.global) {
        throw new Error('forcedCommandRegex must have global flag set');
      }

      this.forcedCommandRegex = forcedCommandRegex;
    }
  }

  destroy() {// stub
  }
  /**
   * Of the matched commands in the query, returns the first that contains or is contained by the selection, or null.
   * @param {string} query The query string
   * @param {ISelectionRange} selection Selection to search
   * @param {boolean} force True if the user is forcing completion
   * @return {object} { command, range } where both objects fields are null if no match
   */


  getCurrentCommand(query
  /*: string*/
  , selection
  /*: ISelectionRange*/
  , force = false) {
    let commandRegex = this.commandRegex;

    if (force && this.shouldForceComplete()) {
      commandRegex = this.forcedCommandRegex || /\S+/g;
    }

    if (!commandRegex) {
      return null;
    }

    commandRegex.lastIndex = 0;
    let match;

    while ((match = commandRegex.exec(query)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (selection.start <= end && selection.end >= start) {
        return {
          command: match,
          range: {
            start,
            end
          }
        };
      }
    }

    return {
      command: null,
      range: {
        start: -1,
        end: -1
      }
    };
  }

  async getCompletions(query
  /*: string*/
  , selection
  /*: ISelectionRange*/
  , force = false)
  /*: Promise<ICompletion[]>*/
  {
    return [];
  }

  getName()
  /*: string*/
  {
    return 'Default Provider';
  }

  renderCompletions(completions
  /*: React.ReactNode[]*/
  )
  /*: React.ReactNode | null*/
  {
    console.error('stub; should be implemented in subclasses');
    return null;
  } // Whether we should provide completions even if triggered forcefully, without a sigil.


  shouldForceComplete()
  /*: boolean*/
  {
    return false;
  }

}

exports.default = AutocompleteProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvQXV0b2NvbXBsZXRlUHJvdmlkZXIudHN4Il0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyIiwiY29uc3RydWN0b3IiLCJjb21tYW5kUmVnZXgiLCJmb3JjZWRDb21tYW5kUmVnZXgiLCJnbG9iYWwiLCJFcnJvciIsImRlc3Ryb3kiLCJnZXRDdXJyZW50Q29tbWFuZCIsInF1ZXJ5Iiwic2VsZWN0aW9uIiwiZm9yY2UiLCJzaG91bGRGb3JjZUNvbXBsZXRlIiwibGFzdEluZGV4IiwibWF0Y2giLCJleGVjIiwic3RhcnQiLCJpbmRleCIsImVuZCIsImxlbmd0aCIsImNvbW1hbmQiLCJyYW5nZSIsImdldENvbXBsZXRpb25zIiwiZ2V0TmFtZSIsInJlbmRlckNvbXBsZXRpb25zIiwiY29tcGxldGlvbnMiLCJjb25zb2xlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXdCZSxNQUFNQSxvQkFBTixDQUEyQjtBQUl0Q0MsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBd0JDO0FBQXhCO0FBQUEsSUFBcUQ7QUFBQTtBQUFBOztBQUM1RCxRQUFJRCxZQUFKLEVBQWtCO0FBQ2QsVUFBSSxDQUFDQSxZQUFZLENBQUNFLE1BQWxCLEVBQTBCO0FBQ3RCLGNBQU0sSUFBSUMsS0FBSixDQUFVLHdDQUFWLENBQU47QUFDSDs7QUFDRCxXQUFLSCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNIOztBQUNELFFBQUlDLGtCQUFKLEVBQXdCO0FBQ3BCLFVBQUksQ0FBQ0Esa0JBQWtCLENBQUNDLE1BQXhCLEVBQWdDO0FBQzVCLGNBQU0sSUFBSUMsS0FBSixDQUFVLDhDQUFWLENBQU47QUFDSDs7QUFDRCxXQUFLRixrQkFBTCxHQUEwQkEsa0JBQTFCO0FBQ0g7QUFDSjs7QUFFREcsRUFBQUEsT0FBTyxHQUFHLENBQ047QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSUMsRUFBQUEsaUJBQWlCLENBQUNDO0FBQUQ7QUFBQSxJQUFnQkM7QUFBaEI7QUFBQSxJQUE0Q0MsS0FBSyxHQUFHLEtBQXBELEVBQTJEO0FBQ3hFLFFBQUlSLFlBQVksR0FBRyxLQUFLQSxZQUF4Qjs7QUFFQSxRQUFJUSxLQUFLLElBQUksS0FBS0MsbUJBQUwsRUFBYixFQUF5QztBQUNyQ1QsTUFBQUEsWUFBWSxHQUFHLEtBQUtDLGtCQUFMLElBQTJCLE1BQTFDO0FBQ0g7O0FBRUQsUUFBSSxDQUFDRCxZQUFMLEVBQW1CO0FBQ2YsYUFBTyxJQUFQO0FBQ0g7O0FBRURBLElBQUFBLFlBQVksQ0FBQ1UsU0FBYixHQUF5QixDQUF6QjtBQUVBLFFBQUlDLEtBQUo7O0FBQ0EsV0FBTyxDQUFDQSxLQUFLLEdBQUdYLFlBQVksQ0FBQ1ksSUFBYixDQUFrQk4sS0FBbEIsQ0FBVCxNQUF1QyxJQUE5QyxFQUFvRDtBQUNoRCxZQUFNTyxLQUFLLEdBQUdGLEtBQUssQ0FBQ0csS0FBcEI7QUFDQSxZQUFNQyxHQUFHLEdBQUdGLEtBQUssR0FBR0YsS0FBSyxDQUFDLENBQUQsQ0FBTCxDQUFTSyxNQUE3Qjs7QUFDQSxVQUFJVCxTQUFTLENBQUNNLEtBQVYsSUFBbUJFLEdBQW5CLElBQTBCUixTQUFTLENBQUNRLEdBQVYsSUFBaUJGLEtBQS9DLEVBQXNEO0FBQ2xELGVBQU87QUFDSEksVUFBQUEsT0FBTyxFQUFFTixLQUROO0FBRUhPLFVBQUFBLEtBQUssRUFBRTtBQUNITCxZQUFBQSxLQURHO0FBRUhFLFlBQUFBO0FBRkc7QUFGSixTQUFQO0FBT0g7QUFDSjs7QUFDRCxXQUFPO0FBQ0hFLE1BQUFBLE9BQU8sRUFBRSxJQUROO0FBRUhDLE1BQUFBLEtBQUssRUFBRTtBQUNITCxRQUFBQSxLQUFLLEVBQUUsQ0FBQyxDQURMO0FBRUhFLFFBQUFBLEdBQUcsRUFBRSxDQUFDO0FBRkg7QUFGSixLQUFQO0FBT0g7O0FBRUQsUUFBTUksY0FBTixDQUFxQmI7QUFBckI7QUFBQSxJQUFvQ0M7QUFBcEM7QUFBQSxJQUFnRUMsS0FBSyxHQUFHLEtBQXhFO0FBQUE7QUFBdUc7QUFDbkcsV0FBTyxFQUFQO0FBQ0g7O0FBRURZLEVBQUFBLE9BQU87QUFBQTtBQUFXO0FBQ2QsV0FBTyxrQkFBUDtBQUNIOztBQUVEQyxFQUFBQSxpQkFBaUIsQ0FBQ0M7QUFBRDtBQUFBO0FBQUE7QUFBeUQ7QUFDdEVDLElBQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFjLDJDQUFkO0FBQ0EsV0FBTyxJQUFQO0FBQ0gsR0E3RXFDLENBK0V0Qzs7O0FBQ0FmLEVBQUFBLG1CQUFtQjtBQUFBO0FBQVk7QUFDM0IsV0FBTyxLQUFQO0FBQ0g7O0FBbEZxQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBBdmlyYWwgRGFzZ3VwdGFcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7SUNvbXBsZXRpb24sIElTZWxlY3Rpb25SYW5nZX0gZnJvbSAnLi9BdXRvY29tcGxldGVyJztcblxuZXhwb3J0IGludGVyZmFjZSBJQ29tbWFuZCB7XG4gICAgY29tbWFuZDogc3RyaW5nIHwgbnVsbDtcbiAgICByYW5nZToge1xuICAgICAgICBzdGFydDogbnVtYmVyO1xuICAgICAgICBlbmQ6IG51bWJlcjtcbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XG4gICAgY29tbWFuZFJlZ2V4OiBSZWdFeHA7XG4gICAgZm9yY2VkQ29tbWFuZFJlZ2V4OiBSZWdFeHA7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb21tYW5kUmVnZXg/OiBSZWdFeHAsIGZvcmNlZENvbW1hbmRSZWdleD86IFJlZ0V4cCkge1xuICAgICAgICBpZiAoY29tbWFuZFJlZ2V4KSB7XG4gICAgICAgICAgICBpZiAoIWNvbW1hbmRSZWdleC5nbG9iYWwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbW1hbmRSZWdleCBtdXN0IGhhdmUgZ2xvYmFsIGZsYWcgc2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRSZWdleCA9IGNvbW1hbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZm9yY2VkQ29tbWFuZFJlZ2V4KSB7XG4gICAgICAgICAgICBpZiAoIWZvcmNlZENvbW1hbmRSZWdleC5nbG9iYWwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZvcmNlZENvbW1hbmRSZWdleCBtdXN0IGhhdmUgZ2xvYmFsIGZsYWcgc2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZvcmNlZENvbW1hbmRSZWdleCA9IGZvcmNlZENvbW1hbmRSZWdleDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIC8vIHN0dWJcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPZiB0aGUgbWF0Y2hlZCBjb21tYW5kcyBpbiB0aGUgcXVlcnksIHJldHVybnMgdGhlIGZpcnN0IHRoYXQgY29udGFpbnMgb3IgaXMgY29udGFpbmVkIGJ5IHRoZSBzZWxlY3Rpb24sIG9yIG51bGwuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5IFRoZSBxdWVyeSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge0lTZWxlY3Rpb25SYW5nZX0gc2VsZWN0aW9uIFNlbGVjdGlvbiB0byBzZWFyY2hcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIFRydWUgaWYgdGhlIHVzZXIgaXMgZm9yY2luZyBjb21wbGV0aW9uXG4gICAgICogQHJldHVybiB7b2JqZWN0fSB7IGNvbW1hbmQsIHJhbmdlIH0gd2hlcmUgYm90aCBvYmplY3RzIGZpZWxkcyBhcmUgbnVsbCBpZiBubyBtYXRjaFxuICAgICAqL1xuICAgIGdldEN1cnJlbnRDb21tYW5kKHF1ZXJ5OiBzdHJpbmcsIHNlbGVjdGlvbjogSVNlbGVjdGlvblJhbmdlLCBmb3JjZSA9IGZhbHNlKSB7XG4gICAgICAgIGxldCBjb21tYW5kUmVnZXggPSB0aGlzLmNvbW1hbmRSZWdleDtcblxuICAgICAgICBpZiAoZm9yY2UgJiYgdGhpcy5zaG91bGRGb3JjZUNvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIGNvbW1hbmRSZWdleCA9IHRoaXMuZm9yY2VkQ29tbWFuZFJlZ2V4IHx8IC9cXFMrL2c7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNvbW1hbmRSZWdleCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb21tYW5kUmVnZXgubGFzdEluZGV4ID0gMDtcblxuICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgIHdoaWxlICgobWF0Y2ggPSBjb21tYW5kUmVnZXguZXhlYyhxdWVyeSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IG1hdGNoLmluZGV4O1xuICAgICAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uLnN0YXJ0IDw9IGVuZCAmJiBzZWxlY3Rpb24uZW5kID49IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogbWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21tYW5kOiBudWxsLFxuICAgICAgICAgICAgcmFuZ2U6IHtcbiAgICAgICAgICAgICAgICBzdGFydDogLTEsXG4gICAgICAgICAgICAgICAgZW5kOiAtMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0Q29tcGxldGlvbnMocXVlcnk6IHN0cmluZywgc2VsZWN0aW9uOiBJU2VsZWN0aW9uUmFuZ2UsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPElDb21wbGV0aW9uW10+IHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICdEZWZhdWx0IFByb3ZpZGVyJztcbiAgICB9XG5cbiAgICByZW5kZXJDb21wbGV0aW9ucyhjb21wbGV0aW9uczogUmVhY3QuUmVhY3ROb2RlW10pOiBSZWFjdC5SZWFjdE5vZGUgfCBudWxsIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignc3R1Yjsgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIHN1YmNsYXNzZXMnKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2hldGhlciB3ZSBzaG91bGQgcHJvdmlkZSBjb21wbGV0aW9ucyBldmVuIGlmIHRyaWdnZXJlZCBmb3JjZWZ1bGx5LCB3aXRob3V0IGEgc2lnaWwuXG4gICAgc2hvdWxkRm9yY2VDb21wbGV0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiJdfQ==