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

  async onTab(e
  /*: KeyboardEvent*/
  ) {
    const acComponent = this.getAutocompleterComponent();

    if (acComponent.countCompletions() === 0) {
      // Force completions to show for the text currently entered
      await acComponent.forceComplete(); // Select the first item by moving "down"

      await acComponent.moveSelection(+1);
    } else {
      await acComponent.moveSelection(e.shiftKey ? -1 : +1);
    }
  }

  onUpArrow(e
  /*: KeyboardEvent*/
  ) {
    this.getAutocompleterComponent().moveSelection(-1);
  }

  onDownArrow(e
  /*: KeyboardEvent*/
  ) {
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
        // not using suffix here, because we also need to calculate
        // the suffix when clicking a display name to insert a mention,
        // which happens in createMentionParts
        return this.partCreator.createMentionParts(this.partIndex, text, completionId);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvYXV0b2NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCIsImNvbnN0cnVjdG9yIiwidXBkYXRlQ2FsbGJhY2siLCJnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50IiwidXBkYXRlUXVlcnkiLCJwYXJ0Q3JlYXRvciIsIm9uRXNjYXBlIiwiZSIsInJlcGxhY2VQYXJ0cyIsInBsYWluIiwicXVlcnlQYXJ0IiwidGV4dCIsImNsb3NlIiwiaGFzU2VsZWN0aW9uIiwiaGFzQ29tcGxldGlvbnMiLCJhYyIsImNvdW50Q29tcGxldGlvbnMiLCJvbkVudGVyIiwib25UYWIiLCJhY0NvbXBvbmVudCIsImZvcmNlQ29tcGxldGUiLCJtb3ZlU2VsZWN0aW9uIiwic2hpZnRLZXkiLCJvblVwQXJyb3ciLCJvbkRvd25BcnJvdyIsIm9uUGFydFVwZGF0ZSIsInBhcnQiLCJwb3MiLCJwYXJ0SW5kZXgiLCJpbmRleCIsIm9uQ29tcG9uZW50U2VsZWN0aW9uQ2hhbmdlIiwiY29tcGxldGlvbiIsInBhcnRGb3JDb21wbGV0aW9uIiwib25Db21wb25lbnRDb25maXJtIiwiY29tcGxldGlvbklkIiwidHlwZSIsInJvb21QaWxsIiwic3VmZml4IiwiYXRSb29tUGlsbCIsImNyZWF0ZU1lbnRpb25QYXJ0cyIsImNvbW1hbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQWZBO0FBQ0E7QUFDQTs7Ozs7OztBQStCZSxNQUFNQSx3QkFBTixDQUErQjtBQUkxQ0MsRUFBQUEsV0FBVyxDQUNDQztBQUREO0FBQUEsSUFFQ0M7QUFGRDtBQUFBLElBR0NDO0FBSEQ7QUFBQSxJQUlDQztBQUpEO0FBQUEsSUFLVDtBQUFBLFNBSlVIO0FBSVY7QUFBQSxNQUpVQTtBQUlWO0FBQUE7QUFB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LGlCQUFMLENBQXVCRCxVQUF2QixDQURFO0FBRWhCbkIsTUFBQUEsS0FBSyxFQUFFO0FBRlMsS0FBcEI7QUFJSDs7QUFFT29CLEVBQUFBLGlCQUFSLENBQTBCRDtBQUExQjtBQUFBLElBQW1EO0FBQy9DLFVBQU07QUFBQ0csTUFBQUE7QUFBRCxRQUFpQkgsVUFBdkI7QUFDQSxVQUFNcEIsSUFBSSxHQUFHb0IsVUFBVSxDQUFDQSxVQUF4Qjs7QUFDQSxZQUFRQSxVQUFVLENBQUNJLElBQW5CO0FBQ0ksV0FBSyxNQUFMO0FBQ0ksZUFBTyxDQUFDLEtBQUs5QixXQUFMLENBQWlCK0IsUUFBakIsQ0FBMEJ6QixJQUExQixFQUFnQ3VCLFlBQWhDLENBQUQsRUFBZ0QsS0FBSzdCLFdBQUwsQ0FBaUJJLEtBQWpCLENBQXVCc0IsVUFBVSxDQUFDTSxNQUFsQyxDQUFoRCxDQUFQOztBQUNKLFdBQUssU0FBTDtBQUNJLGVBQU8sQ0FBQyxLQUFLaEMsV0FBTCxDQUFpQmlDLFVBQWpCLENBQTRCSixZQUE1QixDQUFELEVBQTRDLEtBQUs3QixXQUFMLENBQWlCSSxLQUFqQixDQUF1QnNCLFVBQVUsQ0FBQ00sTUFBbEMsQ0FBNUMsQ0FBUDs7QUFDSixXQUFLLE1BQUw7QUFDSTtBQUNBO0FBQ0E7QUFDQSxlQUFPLEtBQUtoQyxXQUFMLENBQWlCa0Msa0JBQWpCLENBQW9DLEtBQUtYLFNBQXpDLEVBQW9EakIsSUFBcEQsRUFBMER1QixZQUExRCxDQUFQOztBQUNKLFdBQUssU0FBTDtBQUNJO0FBQ0EsZUFBTyxDQUFFLEtBQUs3QixXQUFOLENBQXlDbUMsT0FBekMsQ0FBaUQ3QixJQUFqRCxDQUFELENBQVA7O0FBQ0o7QUFDSTtBQUNBLGVBQU8sQ0FBQyxLQUFLTixXQUFMLENBQWlCSSxLQUFqQixDQUF1QkUsSUFBdkIsQ0FBRCxDQUFQO0FBZlI7QUFpQkg7O0FBekd5QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQge1BhcnQsIENvbW1hbmRQYXJ0Q3JlYXRvciwgUGFydENyZWF0b3J9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgRG9jdW1lbnRQb3NpdGlvbiBmcm9tIFwiLi9wb3NpdGlvblwiO1xuaW1wb3J0IHtJQ29tcGxldGlvbn0gZnJvbSBcIi4uL2F1dG9jb21wbGV0ZS9BdXRvY29tcGxldGVyXCI7XG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0F1dG9jb21wbGV0ZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElDYWxsYmFjayB7XG4gICAgcmVwbGFjZVBhcnRzPzogUGFydFtdO1xuICAgIGNsb3NlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgVXBkYXRlQ2FsbGJhY2sgPSAoZGF0YTogSUNhbGxiYWNrKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgR2V0QXV0b2NvbXBsZXRlckNvbXBvbmVudCA9ICgpID0+IEF1dG9jb21wbGV0ZTtcbmV4cG9ydCB0eXBlIFVwZGF0ZVF1ZXJ5ID0gKHRlc3Q6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsIHtcbiAgICBwcml2YXRlIHF1ZXJ5UGFydDogUGFydDtcbiAgICBwcml2YXRlIHBhcnRJbmRleDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgdXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrLFxuICAgICAgICBwcml2YXRlIGdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQ6IEdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQsXG4gICAgICAgIHByaXZhdGUgdXBkYXRlUXVlcnk6IFVwZGF0ZVF1ZXJ5LFxuICAgICAgICBwcml2YXRlIHBhcnRDcmVhdG9yOiBQYXJ0Q3JlYXRvciB8IENvbW1hbmRQYXJ0Q3JlYXRvcixcbiAgICApIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Fc2NhcGUoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKS5vbkVzY2FwZShlKTtcbiAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayh7XG4gICAgICAgICAgICByZXBsYWNlUGFydHM6IFt0aGlzLnBhcnRDcmVhdG9yLnBsYWluKHRoaXMucXVlcnlQYXJ0LnRleHQpXSxcbiAgICAgICAgICAgIGNsb3NlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soe2Nsb3NlOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGhhc1NlbGVjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXV0b2NvbXBsZXRlckNvbXBvbmVudCgpLmhhc1NlbGVjdGlvbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXNDb21wbGV0aW9ucygpIHtcbiAgICAgICAgY29uc3QgYWMgPSB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKTtcbiAgICAgICAgcmV0dXJuIGFjICYmIGFjLmNvdW50Q29tcGxldGlvbnMoKSA+IDA7XG4gICAgfVxuXG4gICAgcHVibGljIG9uRW50ZXIoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soe2Nsb3NlOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIG9uVGFiKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgY29uc3QgYWNDb21wb25lbnQgPSB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKTtcblxuICAgICAgICBpZiAoYWNDb21wb25lbnQuY291bnRDb21wbGV0aW9ucygpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBGb3JjZSBjb21wbGV0aW9ucyB0byBzaG93IGZvciB0aGUgdGV4dCBjdXJyZW50bHkgZW50ZXJlZFxuICAgICAgICAgICAgYXdhaXQgYWNDb21wb25lbnQuZm9yY2VDb21wbGV0ZSgpO1xuICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBmaXJzdCBpdGVtIGJ5IG1vdmluZyBcImRvd25cIlxuICAgICAgICAgICAgYXdhaXQgYWNDb21wb25lbnQubW92ZVNlbGVjdGlvbigrMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBhY0NvbXBvbmVudC5tb3ZlU2VsZWN0aW9uKGUuc2hpZnRLZXkgPyAtMSA6ICsxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvblVwQXJyb3coZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKS5tb3ZlU2VsZWN0aW9uKC0xKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Eb3duQXJyb3coZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICB0aGlzLmdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQoKS5tb3ZlU2VsZWN0aW9uKCsxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25QYXJ0VXBkYXRlKHBhcnQ6IFBhcnQsIHBvczogRG9jdW1lbnRQb3NpdGlvbikge1xuICAgICAgICAvLyBjYWNoZSB0aGUgdHlwZWQgdmFsdWUgYW5kIGNhcmV0IGhlcmVcbiAgICAgICAgLy8gc28gd2UgY2FuIHJlc3RvcmUgaXQgaW4gb25Db21wb25lbnRTZWxlY3Rpb25DaGFuZ2Ugd2hlbiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkIChtZWFuaW5nIGl0IHNob3VsZCBiZSB0aGUgdHlwZWQgdGV4dClcbiAgICAgICAgdGhpcy5xdWVyeVBhcnQgPSBwYXJ0O1xuICAgICAgICB0aGlzLnBhcnRJbmRleCA9IHBvcy5pbmRleDtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlUXVlcnkocGFydC50ZXh0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Db21wb25lbnRTZWxlY3Rpb25DaGFuZ2UoY29tcGxldGlvbjogSUNvbXBsZXRpb24pIHtcbiAgICAgICAgaWYgKCFjb21wbGV0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICByZXBsYWNlUGFydHM6IFt0aGlzLnF1ZXJ5UGFydF0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soe1xuICAgICAgICAgICAgICAgIHJlcGxhY2VQYXJ0czogdGhpcy5wYXJ0Rm9yQ29tcGxldGlvbihjb21wbGV0aW9uKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG9uQ29tcG9uZW50Q29uZmlybShjb21wbGV0aW9uOiBJQ29tcGxldGlvbikge1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHtcbiAgICAgICAgICAgIHJlcGxhY2VQYXJ0czogdGhpcy5wYXJ0Rm9yQ29tcGxldGlvbihjb21wbGV0aW9uKSxcbiAgICAgICAgICAgIGNsb3NlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnRGb3JDb21wbGV0aW9uKGNvbXBsZXRpb246IElDb21wbGV0aW9uKSB7XG4gICAgICAgIGNvbnN0IHtjb21wbGV0aW9uSWR9ID0gY29tcGxldGlvbjtcbiAgICAgICAgY29uc3QgdGV4dCA9IGNvbXBsZXRpb24uY29tcGxldGlvbjtcbiAgICAgICAgc3dpdGNoIChjb21wbGV0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJyb29tXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFt0aGlzLnBhcnRDcmVhdG9yLnJvb21QaWxsKHRleHQsIGNvbXBsZXRpb25JZCksIHRoaXMucGFydENyZWF0b3IucGxhaW4oY29tcGxldGlvbi5zdWZmaXgpXTtcbiAgICAgICAgICAgIGNhc2UgXCJhdC1yb29tXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFt0aGlzLnBhcnRDcmVhdG9yLmF0Um9vbVBpbGwoY29tcGxldGlvbklkKSwgdGhpcy5wYXJ0Q3JlYXRvci5wbGFpbihjb21wbGV0aW9uLnN1ZmZpeCldO1xuICAgICAgICAgICAgY2FzZSBcInVzZXJcIjpcbiAgICAgICAgICAgICAgICAvLyBub3QgdXNpbmcgc3VmZml4IGhlcmUsIGJlY2F1c2Ugd2UgYWxzbyBuZWVkIHRvIGNhbGN1bGF0ZVxuICAgICAgICAgICAgICAgIC8vIHRoZSBzdWZmaXggd2hlbiBjbGlja2luZyBhIGRpc3BsYXkgbmFtZSB0byBpbnNlcnQgYSBtZW50aW9uLFxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGhhcHBlbnMgaW4gY3JlYXRlTWVudGlvblBhcnRzXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydENyZWF0b3IuY3JlYXRlTWVudGlvblBhcnRzKHRoaXMucGFydEluZGV4LCB0ZXh0LCBjb21wbGV0aW9uSWQpO1xuICAgICAgICAgICAgY2FzZSBcImNvbW1hbmRcIjpcbiAgICAgICAgICAgICAgICAvLyBjb21tYW5kIG5lZWRzIHNwZWNpYWwgaGFuZGxpbmcgZm9yIGF1dG8gY29tcGxldGUsIGJ1dCBhbHNvIHJlbmRlcnMgYXMgcGxhaW4gdGV4dHNcbiAgICAgICAgICAgICAgICByZXR1cm4gWyh0aGlzLnBhcnRDcmVhdG9yIGFzIENvbW1hbmRQYXJ0Q3JlYXRvcikuY29tbWFuZCh0ZXh0KV07XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIHVzZWQgZm9yIGVtb2ppIGFuZCBvdGhlciBwbGFpbiB0ZXh0IGNvbXBsZXRpb24gcmVwbGFjZW1lbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gW3RoaXMucGFydENyZWF0b3IucGxhaW4odGV4dCldO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19