"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.MAX_STEP_LENGTH = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
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
const MAX_STEP_LENGTH = 10;
exports.MAX_STEP_LENGTH = MAX_STEP_LENGTH;

class HistoryManager {
  constructor() {
    (0, _defineProperty2.default)(this, "stack", []);
    (0, _defineProperty2.default)(this, "newlyTypedCharCount", 0);
    (0, _defineProperty2.default)(this, "currentIndex", -1);
    (0, _defineProperty2.default)(this, "changedSinceLastPush", false);
    (0, _defineProperty2.default)(this, "lastCaret", null);
    (0, _defineProperty2.default)(this, "nonWordBoundarySinceLastPush", false);
    (0, _defineProperty2.default)(this, "addedSinceLastPush", false);
    (0, _defineProperty2.default)(this, "removedSinceLastPush", false);
  }

  clear() {
    this.stack = [];
    this.newlyTypedCharCount = 0;
    this.currentIndex = -1;
    this.changedSinceLastPush = false;
    this.lastCaret = null;
    this.nonWordBoundarySinceLastPush = false;
    this.addedSinceLastPush = false;
    this.removedSinceLastPush = false;
  }

  shouldPush(inputType, diff) {
    // right now we can only push a step after
    // the input has been applied to the model,
    // so we can't push the state before something happened.
    // not ideal but changing this would be harder to fit cleanly into
    // the editor model.
    const isNonBulkInput = inputType === "insertText" || inputType === "deleteContentForward" || inputType === "deleteContentBackward";

    if (diff && isNonBulkInput) {
      if (diff.added) {
        this.addedSinceLastPush = true;
      }

      if (diff.removed) {
        this.removedSinceLastPush = true;
      } // as long as you've only been adding or removing since the last push


      if (this.addedSinceLastPush !== this.removedSinceLastPush) {
        // add steps by word boundary, up to MAX_STEP_LENGTH characters
        const str = diff.added ? diff.added : diff.removed;
        const isWordBoundary = str === " " || str === "\t" || str === "\n";

        if (this.nonWordBoundarySinceLastPush && isWordBoundary) {
          return true;
        }

        if (!isWordBoundary) {
          this.nonWordBoundarySinceLastPush = true;
        }

        this.newlyTypedCharCount += str.length;
        return this.newlyTypedCharCount > MAX_STEP_LENGTH;
      } else {
        // if starting to remove while adding before, or the opposite, push
        return true;
      }
    } else {
      // bulk input (paste, ...) should be pushed every time
      return true;
    }
  }

  pushState(model
  /*: EditorModel*/
  , caret
  /*: Caret*/
  ) {
    // remove all steps after current step
    while (this.currentIndex < this.stack.length - 1) {
      this.stack.pop();
    }

    const parts = model.serializeParts();
    this.stack.push({
      parts,
      caret
    });
    this.currentIndex = this.stack.length - 1;
    this.lastCaret = null;
    this.changedSinceLastPush = false;
    this.newlyTypedCharCount = 0;
    this.nonWordBoundarySinceLastPush = false;
    this.addedSinceLastPush = false;
    this.removedSinceLastPush = false;
  } // needs to persist parts and caret position


  tryPush(model
  /*: EditorModel*/
  , caret
  /*: Caret*/
  , inputType
  /*: string*/
  , diff
  /*: IDiff*/
  ) {
    // ignore state restoration echos.
    // these respect the inputType values of the input event,
    // but are actually passed in from MessageEditor calling model.reset()
    // in the keydown event handler.
    if (inputType === "historyUndo" || inputType === "historyRedo") {
      return false;
    }

    const shouldPush = this.shouldPush(inputType, diff);

    if (shouldPush) {
      this.pushState(model, caret);
    } else {
      this.lastCaret = caret;
      this.changedSinceLastPush = true;
    }

    return shouldPush;
  }

  ensureLastChangesPushed(model
  /*: EditorModel*/
  ) {
    if (this.changedSinceLastPush) {
      this.pushState(model, this.lastCaret);
    }
  }

  canUndo() {
    return this.currentIndex >= 1 || this.changedSinceLastPush;
  }

  canRedo() {
    return this.currentIndex < this.stack.length - 1;
  } // returns state that should be applied to model


  undo(model
  /*: EditorModel*/
  ) {
    if (this.canUndo()) {
      this.ensureLastChangesPushed(model);
      this.currentIndex -= 1;
      return this.stack[this.currentIndex];
    }
  } // returns state that should be applied to model


  redo() {
    if (this.canRedo()) {
      this.changedSinceLastPush = false;
      this.currentIndex += 1;
      return this.stack[this.currentIndex];
    }
  }

}

exports.default = HistoryManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvaGlzdG9yeS50cyJdLCJuYW1lcyI6WyJNQVhfU1RFUF9MRU5HVEgiLCJIaXN0b3J5TWFuYWdlciIsImNsZWFyIiwic3RhY2siLCJuZXdseVR5cGVkQ2hhckNvdW50IiwiY3VycmVudEluZGV4IiwiY2hhbmdlZFNpbmNlTGFzdFB1c2giLCJsYXN0Q2FyZXQiLCJub25Xb3JkQm91bmRhcnlTaW5jZUxhc3RQdXNoIiwiYWRkZWRTaW5jZUxhc3RQdXNoIiwicmVtb3ZlZFNpbmNlTGFzdFB1c2giLCJzaG91bGRQdXNoIiwiaW5wdXRUeXBlIiwiZGlmZiIsImlzTm9uQnVsa0lucHV0IiwiYWRkZWQiLCJyZW1vdmVkIiwic3RyIiwiaXNXb3JkQm91bmRhcnkiLCJsZW5ndGgiLCJwdXNoU3RhdGUiLCJtb2RlbCIsImNhcmV0IiwicG9wIiwicGFydHMiLCJzZXJpYWxpemVQYXJ0cyIsInB1c2giLCJ0cnlQdXNoIiwiZW5zdXJlTGFzdENoYW5nZXNQdXNoZWQiLCJjYW5VbmRvIiwiY2FuUmVkbyIsInVuZG8iLCJyZWRvIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVlPLE1BQU1BLGVBQWUsR0FBRyxFQUF4Qjs7O0FBRVEsTUFBTUMsY0FBTixDQUFxQjtBQUFBO0FBQUEsaURBQ0osRUFESTtBQUFBLCtEQUVGLENBRkU7QUFBQSx3REFHVCxDQUFDLENBSFE7QUFBQSxnRUFJRCxLQUpDO0FBQUEscURBS0wsSUFMSztBQUFBLHdFQU1PLEtBTlA7QUFBQSw4REFPSCxLQVBHO0FBQUEsZ0VBUUQsS0FSQztBQUFBOztBQVVoQ0MsRUFBQUEsS0FBSyxHQUFHO0FBQ0osU0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxTQUFLQyxtQkFBTCxHQUEyQixDQUEzQjtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsQ0FBQyxDQUFy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aGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xuaW1wb3J0IHtJRGlmZn0gZnJvbSBcIi4vZGlmZlwiO1xuaW1wb3J0IHtTZXJpYWxpemVkUGFydH0gZnJvbSBcIi4vcGFydHNcIjtcbmltcG9ydCB7Q2FyZXR9IGZyb20gXCIuL2NhcmV0XCI7XG5cbmludGVyZmFjZSBJSGlzdG9yeSB7XG4gICAgcGFydHM6IFNlcmlhbGl6ZWRQYXJ0W107XG4gICAgY2FyZXQ6IENhcmV0O1xufVxuXG5leHBvcnQgY29uc3QgTUFYX1NURVBfTEVOR1RIID0gMTA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpc3RvcnlNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YWNrOiBJSGlzdG9yeVtdID0gW107XG4gICAgcHJpdmF0ZSBuZXdseVR5cGVkQ2hhckNvdW50ID0gMDtcbiAgICBwcml2YXRlIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgIHByaXZhdGUgY2hhbmdlZFNpbmNlTGFzdFB1c2ggPSBmYWxzZTtcbiAgICBwcml2YXRlIGxhc3RDYXJldDogQ2FyZXQgPSBudWxsO1xuICAgIHByaXZhdGUgbm9uV29yZEJvdW5kYXJ5U2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuICAgIHByaXZhdGUgYWRkZWRTaW5jZUxhc3RQdXNoID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByZW1vdmVkU2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5uZXdseVR5cGVkQ2hhckNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkU2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxhc3RDYXJldCA9IG51bGw7XG4gICAgICAgIHRoaXMubm9uV29yZEJvdW5kYXJ5U2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFkZGVkU2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbW92ZWRTaW5jZUxhc3RQdXNoID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG91bGRQdXNoKGlucHV0VHlwZSwgZGlmZikge1xuICAgICAgICAvLyByaWdodCBub3cgd2UgY2FuIG9ubHkgcHVzaCBhIHN0ZXAgYWZ0ZXJcbiAgICAgICAgLy8gdGhlIGlucHV0IGhhcyBiZWVuIGFwcGxpZWQgdG8gdGhlIG1vZGVsLFxuICAgICAgICAvLyBzbyB3ZSBjYW4ndCBwdXNoIHRoZSBzdGF0ZSBiZWZvcmUgc29tZXRoaW5nIGhhcHBlbmVkLlxuICAgICAgICAvLyBub3QgaWRlYWwgYnV0IGNoYW5naW5nIHRoaXMgd291bGQgYmUgaGFyZGVyIHRvIGZpdCBjbGVhbmx5IGludG9cbiAgICAgICAgLy8gdGhlIGVkaXRvciBtb2RlbC5cbiAgICAgICAgY29uc3QgaXNOb25CdWxrSW5wdXQgPSBpbnB1dFR5cGUgPT09IFwiaW5zZXJ0VGV4dFwiIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRUeXBlID09PSBcImRlbGV0ZUNvbnRlbnRGb3J3YXJkXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dFR5cGUgPT09IFwiZGVsZXRlQ29udGVudEJhY2t3YXJkXCI7XG4gICAgICAgIGlmIChkaWZmICYmIGlzTm9uQnVsa0lucHV0KSB7XG4gICAgICAgICAgICBpZiAoZGlmZi5hZGRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkZWRTaW5jZUxhc3RQdXNoID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkaWZmLnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZWRTaW5jZUxhc3RQdXNoID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFzIGxvbmcgYXMgeW91J3ZlIG9ubHkgYmVlbiBhZGRpbmcgb3IgcmVtb3Zpbmcgc2luY2UgdGhlIGxhc3QgcHVzaFxuICAgICAgICAgICAgaWYgKHRoaXMuYWRkZWRTaW5jZUxhc3RQdXNoICE9PSB0aGlzLnJlbW92ZWRTaW5jZUxhc3RQdXNoKSB7XG4gICAgICAgICAgICAgICAgLy8gYWRkIHN0ZXBzIGJ5IHdvcmQgYm91bmRhcnksIHVwIHRvIE1BWF9TVEVQX0xFTkdUSCBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyID0gZGlmZi5hZGRlZCA/IGRpZmYuYWRkZWQgOiBkaWZmLnJlbW92ZWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNXb3JkQm91bmRhcnkgPSBzdHIgPT09IFwiIFwiIHx8IHN0ciA9PT0gXCJcXHRcIiB8fCBzdHIgPT09IFwiXFxuXCI7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubm9uV29yZEJvdW5kYXJ5U2luY2VMYXN0UHVzaCAmJiBpc1dvcmRCb3VuZGFyeSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFpc1dvcmRCb3VuZGFyeSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vbldvcmRCb3VuZGFyeVNpbmNlTGFzdFB1c2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm5ld2x5VHlwZWRDaGFyQ291bnQgKz0gc3RyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZXdseVR5cGVkQ2hhckNvdW50ID4gTUFYX1NURVBfTEVOR1RIO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBzdGFydGluZyB0byByZW1vdmUgd2hpbGUgYWRkaW5nIGJlZm9yZSwgb3IgdGhlIG9wcG9zaXRlLCBwdXNoXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBidWxrIGlucHV0IChwYXN0ZSwgLi4uKSBzaG91bGQgYmUgcHVzaGVkIGV2ZXJ5IHRpbWVcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwdXNoU3RhdGUobW9kZWw6IEVkaXRvck1vZGVsLCBjYXJldDogQ2FyZXQpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBzdGVwcyBhZnRlciBjdXJyZW50IHN0ZXBcbiAgICAgICAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgKHRoaXMuc3RhY2subGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydHMgPSBtb2RlbC5zZXJpYWxpemVQYXJ0cygpO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2goe3BhcnRzLCBjYXJldH0pO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IHRoaXMuc3RhY2subGVuZ3RoIC0gMTtcbiAgICAgICAgdGhpcy5sYXN0Q2FyZXQgPSBudWxsO1xuICAgICAgICB0aGlzLmNoYW5nZWRTaW5jZUxhc3RQdXNoID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmV3bHlUeXBlZENoYXJDb3VudCA9IDA7XG4gICAgICAgIHRoaXMubm9uV29yZEJvdW5kYXJ5U2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFkZGVkU2luY2VMYXN0UHVzaCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbW92ZWRTaW5jZUxhc3RQdXNoID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gbmVlZHMgdG8gcGVyc2lzdCBwYXJ0cyBhbmQgY2FyZXQgcG9zaXRpb25cbiAgICB0cnlQdXNoKG1vZGVsOiBFZGl0b3JNb2RlbCwgY2FyZXQ6IENhcmV0LCBpbnB1dFR5cGU6IHN0cmluZywgZGlmZjogSURpZmYpIHtcbiAgICAgICAgLy8gaWdub3JlIHN0YXRlIHJlc3RvcmF0aW9uIGVjaG9zLlxuICAgICAgICAvLyB0aGVzZSByZXNwZWN0IHRoZSBpbnB1dFR5cGUgdmFsdWVzIG9mIHRoZSBpbnB1dCBldmVudCxcbiAgICAgICAgLy8gYnV0IGFyZSBhY3R1YWxseSBwYXNzZWQgaW4gZnJvbSBNZXNzYWdlRWRpdG9yIGNhbGxpbmcgbW9kZWwucmVzZXQoKVxuICAgICAgICAvLyBpbiB0aGUga2V5ZG93biBldmVudCBoYW5kbGVyLlxuICAgICAgICBpZiAoaW5wdXRUeXBlID09PSBcImhpc3RvcnlVbmRvXCIgfHwgaW5wdXRUeXBlID09PSBcImhpc3RvcnlSZWRvXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaG91bGRQdXNoID0gdGhpcy5zaG91bGRQdXNoKGlucHV0VHlwZSwgZGlmZik7XG4gICAgICAgIGlmIChzaG91bGRQdXNoKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShtb2RlbCwgY2FyZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sYXN0Q2FyZXQgPSBjYXJldDtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZFNpbmNlTGFzdFB1c2ggPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaG91bGRQdXNoO1xuICAgIH1cblxuICAgIGVuc3VyZUxhc3RDaGFuZ2VzUHVzaGVkKG1vZGVsOiBFZGl0b3JNb2RlbCkge1xuICAgICAgICBpZiAodGhpcy5jaGFuZ2VkU2luY2VMYXN0UHVzaCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUobW9kZWwsIHRoaXMubGFzdENhcmV0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhblVuZG8oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbmRleCA+PSAxIHx8IHRoaXMuY2hhbmdlZFNpbmNlTGFzdFB1c2g7XG4gICAgfVxuXG4gICAgY2FuUmVkbygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudEluZGV4IDwgKHRoaXMuc3RhY2subGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBzdGF0ZSB0aGF0IHNob3VsZCBiZSBhcHBsaWVkIHRvIG1vZGVsXG4gICAgdW5kbyhtb2RlbDogRWRpdG9yTW9kZWwpIHtcbiAgICAgICAgaWYgKHRoaXMuY2FuVW5kbygpKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZUxhc3RDaGFuZ2VzUHVzaGVkKG1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4IC09IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIHN0YXRlIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgdG8gbW9kZWxcbiAgICByZWRvKCkge1xuICAgICAgICBpZiAodGhpcy5jYW5SZWRvKCkpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZFNpbmNlTGFzdFB1c2ggPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=