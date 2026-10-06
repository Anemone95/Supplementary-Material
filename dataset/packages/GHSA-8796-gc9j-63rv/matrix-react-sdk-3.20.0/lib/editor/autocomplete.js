"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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

/*:: export interface ICallback {
    replaceParts?: Part[];
    close?: boolean;
}*/

/*:: export type UpdateCallback = (data: ICallback) => void;*/

/*:: export type GetAutocompleterComponent = () => Autocomplete;*/

/*:: export type UpdateQuery = (test: string) => Promise<void>;*/
class AutocompleteWrapperModel {
  constructor(updateCallback
  /*: UpdateCallback*/
  , getAutocompleterComponent
  /*: GetAutocompleterComponent*/
  , updateQuery
  /*: UpdateQuery*/
  , partCreator
  /*: PartCreator | CommandPartCreator*/
  ) {
    this.updateCallback
    /*:: */
    = updateCallback
    /*:: */
    ;
    this.getAutocompleterComponent
    /*:: */
    = getAutocompleterComponent
    /*:: */
    ;
    this.updateQuery
    /*:: */
    = updateQuery
    /*:: */
    ;
    this.partCreator
    /*:: */
    = partCreator
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "queryPart", void 0);
    (0, _defineProperty2.default)(this, "partIndex", void 0);
  }

  onEscape(e
  /*: KeyboardEvent*/
  ) {
    this.getAutocompleterComponent().onEscape(e);
    this.updateCallback({
      replaceParts: [this.partCreator.plain(this.queryPart.text)],
      close: true
    });
  }

  close() {
    this.updateCallback({
      close: true
    });
  }

  hasSelection() {
    return this.getAutocompleterComponent().hasSelection();
  }

  hasCompletions() {
    const ac = this.getAutocompleterComponent();
    return ac && ac.countCompletions() > 0;
  }

  onEnter() {
    this.updateCallback({
      close: true
    });
  }
  /**
   * If there is no current autocompletion, start one and move to the first selection.
   */


  async startSelection() {
    const acComponent = this.getAutocompleterComponent();

    if (acComponent.countCompletions() === 0) {
      // Force completions to show for the text currently entered
      await acComponent.forceComplete(); // Select the first item by moving "down"

      await acComponent.moveSelection(+1);
    }
  }

  selectPreviousSelection() {
    this.getAutocompleterComponent().moveSelection(-1);
  }

  selectNextSelection() {
    this.getAutocompleterComponent().moveSelection(+1);
  }

  onPartUpdate(part
  /*: Part*/
  , pos
  /*: DocumentPosition*/
  ) {
    // cache the typed value and caret here
    // so we can restore it in onComponentSelectionChange when the value is undefined (meaning it should be the typed text)
    this.queryPart = part;
    this.partIndex = pos.index;
    return this.updateQuery(part.text);
  }

  onComponentSelectionChange(completion
  /*: ICompletion*/
  ) {
    if (!completion) {
      this.updateCallback({
        replaceParts: [this.queryPart]
      });
    } else {
      this.updateCallback({
        replaceParts: this.partForCompletion(completion)
      });
    }
  }

  onComponentConfirm(completion
  /*: ICompletion*/
  ) {
    this.updateCallback({
      replaceParts: this.partForCompletion(completion),
      close: true
    });
  }

  partForCompletion(completion
  /*: ICompletion*/
  ) {
    const {
      completionId
    } = completion;
    const text = completion.completion;

    switch (completion.type) {
      case "room":
        return [this.partCreator.roomPill(text, completionId), this.partCreator.plain(completion.suffix)];

      case "at-room":
        return [this.partCreator.atRoomPill(completionId), this.partCreator.plain(completion.suffix)];

      case "user":
        // Insert suffix only if the pill is the part with index 0 - we are at the start of the composer
        return this.partCreator.createMentionParts(this.partIndex === 0, text, completionId);

      case "command":
        // command needs special handling for auto complete, but also renders as plain texts
        return [this.partCreator.command(text)];

      default:
        // used for emoji and other plain text completion replacement
        return [this.partCreator.plain(text)];
    }
  }

}

exports.default = AutocompleteWrapperModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvYXV0b2NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCIsImNvbnN0cnVjdG9yIiwidXBkYXRlQ2FsbGJhY2siLCJnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50IiwidXBkYXRlUXVlcnkiLCJwYXJ0Q3JlYXRvciIsIm9uRXNjYXBlIiwiZSIsInJlcGxhY2VQYXJ0cyIsInBsYWluIiwicXVlcnlQYXJ0IiwidGV4dCIsImNsb3NlIiwiaGFzU2VsZWN0aW9uIiwiaGFzQ29tcGxldGlvbnMiLCJhYyIsImNvdW50Q29tcGxldGlvbnMiLCJvbkVudGVyIiwic3RhcnRTZWxlY3Rpb24iLCJhY0NvbXBvbmVudCIsImZvcmNlQ29tcGxldGUiLCJtb3ZlU2VsZWN0aW9uIiwic2VsZWN0UHJldmlvdXNTZWxlY3Rpb24iLCJzZWxlY3ROZXh0U2VsZWN0aW9uIiwib25QYXJ0VXBkYXRlIiwicGFydCIsInBvcyIsInBhcnRJbmRleCIsImluZGV4Iiwib25Db21wb25lbnRTZWxlY3Rpb25DaGFuZ2UiLCJjb21wbGV0aW9uIiwicGFydEZvckNvbXBsZXRpb24iLCJvbkNvbXBvbmVudENvbmZpcm0iLCJjb21wbGV0aW9uSWQiLCJ0eXBlIiwicm9vbVBpbGwiLCJzdWZmaXgiLCJhdFJvb21QaWxsIiwiY3JlYXRlTWVudGlvblBhcnRzIiwiY29tbWFuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBZkE7QUFDQTtBQUNBOzs7Ozs7O0FBK0JlLE1BQU1BLHdCQUFOLENBQStCO0FBSTFDQyxFQUFBQSxXQUFXLENBQ0NDO0FBREQ7QUFBQSxJQUVDQztBQUZEO0FBQUEsSUFHQ0M7QUFIRDtBQUFBLElBSUNDO0FBSkQ7QUFBQSxJQUtUO0FBQUEsU0FKVUg7QUFJVjtBQUFB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O0FBQUNHLE1BQUFBO0FBQUQsUUFBaUJILFVBQXZCO0FBQ0EsVUFBTW5CLElBQUksR0FBR21CLFVBQVUsQ0FBQ0EsVUFBeEI7O0FBQ0EsWUFBUUEsVUFBVSxDQUFDSSxJQUFuQjtBQUNJLFdBQUssTUFBTDtBQUNJLGVBQU8sQ0FBQyxLQUFLN0IsV0FBTCxDQUFpQjhCLFFBQWpCLENBQTBCeEIsSUFBMUIsRUFBZ0NzQixZQUFoQyxDQUFELEVBQWdELEtBQUs1QixXQUFMLENBQWlCSSxLQUFqQixDQUF1QnFCLFVBQVUsQ0FBQ00sTUFBbEMsQ0FBaEQsQ0FBUDs7QUFDSixXQUFLLFNBQUw7QUFDSSxlQUFPLENBQUMsS0FBSy9CLFdBQUwsQ0FBaUJnQyxVQUFqQixDQUE0QkosWUFBNUIsQ0FBRCxFQUE0QyxLQUFLNUIsV0FBTCxDQUFpQkksS0FBakIsQ0FBdUJxQixVQUFVLENBQUNNLE1BQWxDLENBQTVDLENBQVA7O0FBQ0osV0FBSyxNQUFMO0FBQ0k7QUFDQSxlQUFPLEtBQUsvQixXQUFMLENBQWlCaUMsa0JBQWpCLENBQW9DLEtBQUtYLFNBQUwsS0FBbUIsQ0FBdkQsRUFBMERoQixJQUExRCxFQUFnRXNCLFlBQWhFLENBQVA7O0FBQ0osV0FBSyxTQUFMO0FBQ0k7QUFDQSxlQUFPLENBQUUsS0FBSzVCLFdBQU4sQ0FBeUNrQyxPQUF6QyxDQUFpRDVCLElBQWpELENBQUQsQ0FBUDs7QUFDSjtBQUNJO0FBQ0EsZUFBTyxDQUFDLEtBQUtOLFdBQUwsQ0FBaUJJLEtBQWpCLENBQXVCRSxJQUF2QixDQUFELENBQVA7QUFiUjtBQWVIOztBQXZHeUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHtQYXJ0LCBDb21tYW5kUGFydENyZWF0b3IsIFBhcnRDcmVhdG9yfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IERvY3VtZW50UG9zaXRpb24gZnJvbSBcIi4vcG9zaXRpb25cIjtcbmltcG9ydCB7SUNvbXBsZXRpb259IGZyb20gXCIuLi9hdXRvY29tcGxldGUvQXV0b2NvbXBsZXRlclwiO1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9yb29tcy9BdXRvY29tcGxldGVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJQ2FsbGJhY2sge1xuICAgIHJlcGxhY2VQYXJ0cz86IFBhcnRbXTtcbiAgICBjbG9zZT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZUNhbGxiYWNrID0gKGRhdGE6IElDYWxsYmFjaykgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIEdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQgPSAoKSA9PiBBdXRvY29tcGxldGU7XG5leHBvcnQgdHlwZSBVcGRhdGVRdWVyeSA9ICh0ZXN0OiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCB7XG4gICAgcHJpdmF0ZSBxdWVyeVBhcnQ6IFBhcnQ7XG4gICAgcHJpdmF0ZSBwYXJ0SW5kZXg6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayxcbiAgICAgICAgcHJpdmF0ZSBnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50OiBHZXRBdXRvY29tcGxldGVyQ29tcG9uZW50LFxuICAgICAgICBwcml2YXRlIHVwZGF0ZVF1ZXJ5OiBVcGRhdGVRdWVyeSxcbiAgICAgICAgcHJpdmF0ZSBwYXJ0Q3JlYXRvcjogUGFydENyZWF0b3IgfCBDb21tYW5kUGFydENyZWF0b3IsXG4gICAgKSB7XG4gICAgfVxuXG4gICAgcHVibGljIG9uRXNjYXBlKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgdGhpcy5nZXRBdXRvY29tcGxldGVyQ29tcG9uZW50KCkub25Fc2NhcGUoZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soe1xuICAgICAgICAgICAgcmVwbGFjZVBhcnRzOiBbdGhpcy5wYXJ0Q3JlYXRvci5wbGFpbih0aGlzLnF1ZXJ5UGFydC50ZXh0KV0sXG4gICAgICAgICAgICBjbG9zZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHtjbG9zZTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXNTZWxlY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKS5oYXNTZWxlY3Rpb24oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaGFzQ29tcGxldGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IGFjID0gdGhpcy5nZXRBdXRvY29tcGxldGVyQ29tcG9uZW50KCk7XG4gICAgICAgIHJldHVybiBhYyAmJiBhYy5jb3VudENvbXBsZXRpb25zKCkgPiAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkVudGVyKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHtjbG9zZTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRoZXJlIGlzIG5vIGN1cnJlbnQgYXV0b2NvbXBsZXRpb24sIHN0YXJ0IG9uZSBhbmQgbW92ZSB0byB0aGUgZmlyc3Qgc2VsZWN0aW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBzdGFydFNlbGVjdGlvbigpIHtcbiAgICAgICAgY29uc3QgYWNDb21wb25lbnQgPSB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKTtcbiAgICAgICAgaWYgKGFjQ29tcG9uZW50LmNvdW50Q29tcGxldGlvbnMoKSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gRm9yY2UgY29tcGxldGlvbnMgdG8gc2hvdyBmb3IgdGhlIHRleHQgY3VycmVudGx5IGVudGVyZWRcbiAgICAgICAgICAgIGF3YWl0IGFjQ29tcG9uZW50LmZvcmNlQ29tcGxldGUoKTtcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZmlyc3QgaXRlbSBieSBtb3ZpbmcgXCJkb3duXCJcbiAgICAgICAgICAgIGF3YWl0IGFjQ29tcG9uZW50Lm1vdmVTZWxlY3Rpb24oKzEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNlbGVjdFByZXZpb3VzU2VsZWN0aW9uKCkge1xuICAgICAgICB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKS5tb3ZlU2VsZWN0aW9uKC0xKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2VsZWN0TmV4dFNlbGVjdGlvbigpIHtcbiAgICAgICAgdGhpcy5nZXRBdXRvY29tcGxldGVyQ29tcG9uZW50KCkubW92ZVNlbGVjdGlvbigrMSk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uUGFydFVwZGF0ZShwYXJ0OiBQYXJ0LCBwb3M6IERvY3VtZW50UG9zaXRpb24pIHtcbiAgICAgICAgLy8gY2FjaGUgdGhlIHR5cGVkIHZhbHVlIGFuZCBjYXJldCBoZXJlXG4gICAgICAgIC8vIHNvIHdlIGNhbiByZXN0b3JlIGl0IGluIG9uQ29tcG9uZW50U2VsZWN0aW9uQ2hhbmdlIHdoZW4gdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCAobWVhbmluZyBpdCBzaG91bGQgYmUgdGhlIHR5cGVkIHRleHQpXG4gICAgICAgIHRoaXMucXVlcnlQYXJ0ID0gcGFydDtcbiAgICAgICAgdGhpcy5wYXJ0SW5kZXggPSBwb3MuaW5kZXg7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVF1ZXJ5KHBhcnQudGV4dCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uQ29tcG9uZW50U2VsZWN0aW9uQ2hhbmdlKGNvbXBsZXRpb246IElDb21wbGV0aW9uKSB7XG4gICAgICAgIGlmICghY29tcGxldGlvbikge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgcmVwbGFjZVBhcnRzOiBbdGhpcy5xdWVyeVBhcnRdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICByZXBsYWNlUGFydHM6IHRoaXMucGFydEZvckNvbXBsZXRpb24oY29tcGxldGlvbiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvbkNvbXBvbmVudENvbmZpcm0oY29tcGxldGlvbjogSUNvbXBsZXRpb24pIHtcbiAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayh7XG4gICAgICAgICAgICByZXBsYWNlUGFydHM6IHRoaXMucGFydEZvckNvbXBsZXRpb24oY29tcGxldGlvbiksXG4gICAgICAgICAgICBjbG9zZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJ0Rm9yQ29tcGxldGlvbihjb21wbGV0aW9uOiBJQ29tcGxldGlvbikge1xuICAgICAgICBjb25zdCB7Y29tcGxldGlvbklkfSA9IGNvbXBsZXRpb247XG4gICAgICAgIGNvbnN0IHRleHQgPSBjb21wbGV0aW9uLmNvbXBsZXRpb247XG4gICAgICAgIHN3aXRjaCAoY29tcGxldGlvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwicm9vbVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBbdGhpcy5wYXJ0Q3JlYXRvci5yb29tUGlsbCh0ZXh0LCBjb21wbGV0aW9uSWQpLCB0aGlzLnBhcnRDcmVhdG9yLnBsYWluKGNvbXBsZXRpb24uc3VmZml4KV07XG4gICAgICAgICAgICBjYXNlIFwiYXQtcm9vbVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBbdGhpcy5wYXJ0Q3JlYXRvci5hdFJvb21QaWxsKGNvbXBsZXRpb25JZCksIHRoaXMucGFydENyZWF0b3IucGxhaW4oY29tcGxldGlvbi5zdWZmaXgpXTtcbiAgICAgICAgICAgIGNhc2UgXCJ1c2VyXCI6XG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHN1ZmZpeCBvbmx5IGlmIHRoZSBwaWxsIGlzIHRoZSBwYXJ0IHdpdGggaW5kZXggMCAtIHdlIGFyZSBhdCB0aGUgc3RhcnQgb2YgdGhlIGNvbXBvc2VyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydENyZWF0b3IuY3JlYXRlTWVudGlvblBhcnRzKHRoaXMucGFydEluZGV4ID09PSAwLCB0ZXh0LCBjb21wbGV0aW9uSWQpO1xuICAgICAgICAgICAgY2FzZSBcImNvbW1hbmRcIjpcbiAgICAgICAgICAgICAgICAvLyBjb21tYW5kIG5lZWRzIHNwZWNpYWwgaGFuZGxpbmcgZm9yIGF1dG8gY29tcGxldGUsIGJ1dCBhbHNvIHJlbmRlcnMgYXMgcGxhaW4gdGV4dHNcbiAgICAgICAgICAgICAgICByZXR1cm4gWyh0aGlzLnBhcnRDcmVhdG9yIGFzIENvbW1hbmRQYXJ0Q3JlYXRvcikuY29tbWFuZCh0ZXh0KV07XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIHVzZWQgZm9yIGVtb2ppIGFuZCBvdGhlciBwbGFpbiB0ZXh0IGNvbXBsZXRpb24gcmVwbGFjZW1lbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gW3RoaXMucGFydENyZWF0b3IucGxhaW4odGV4dCldO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19