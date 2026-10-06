"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _diff = require("./diff");

var _position = _interopRequireDefault(require("./position"));

var _range = _interopRequireDefault(require("./range"));

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
class EditorModel {
  constructor(parts
  /*: Part[]*/
  , partCreator
  /*: PartCreator*/
  , updateCallback
  /*: UpdateCallback*/
  = null) {
    this.updateCallback
    /*:: */
    = updateCallback
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "_parts", void 0);
    (0, _defineProperty2.default)(this, "_partCreator", void 0);
    (0, _defineProperty2.default)(this, "activePartIdx", null);
    (0, _defineProperty2.default)(this, "_autoComplete", null);
    (0, _defineProperty2.default)(this, "autoCompletePartIdx", null);
    (0, _defineProperty2.default)(this, "autoCompletePartCount", 0);
    (0, _defineProperty2.default)(this, "transformCallback", null);
    (0, _defineProperty2.default)(this, "onAutoComplete", ({
      replaceParts,
      close
    }
    /*: ICallback*/
    ) => {
      let pos;

      if (replaceParts) {
        this._parts.splice(this.autoCompletePartIdx, this.autoCompletePartCount, ...replaceParts);

        this.autoCompletePartCount = replaceParts.length;
        const lastPart = replaceParts[replaceParts.length - 1];
        const lastPartIndex = this.autoCompletePartIdx + replaceParts.length - 1;
        pos = new _position.default(lastPartIndex, lastPart.text.length);
      }

      if (close) {
        this._autoComplete = null;
        this.autoCompletePartIdx = null;
        this.autoCompletePartCount = 0;
      } // rerender even if editor contents didn't change
      // to make sure the MessageEditor checks
      // model.autoComplete being empty and closes it


      this.updateCallback(pos);
    });
    this._parts = parts;
    this._partCreator = partCreator;
    this.transformCallback = null;
  }
  /**
   * Set a callback for the transformation step.
   * While processing an update, right before calling the update callback,
   * a transform callback can be called, which serves to do modifications
   * on the model that can span multiple parts. Also see `startRange()`.
   * @param {TransformCallback} transformCallback
   */


  setTransformCallback(transformCallback
  /*: TransformCallback*/
  ) {
    this.transformCallback = transformCallback;
  }
  /**
   * Set a callback for rerendering the model after it has been updated.
   * @param {ModelCallback} updateCallback
   */


  setUpdateCallback(updateCallback
  /*: UpdateCallback*/
  ) {
    this.updateCallback = updateCallback;
  }

  get partCreator() {
    return this._partCreator;
  }

  get isEmpty() {
    return this._parts.reduce((len, part) => len + part.text.length, 0) === 0;
  }

  clone() {
    return new EditorModel(this._parts, this._partCreator, this.updateCallback);
  }

  insertPart(index
  /*: number*/
  , part
  /*: Part*/
  ) {
    this._parts.splice(index, 0, part);

    if (this.activePartIdx >= index) {
      ++this.activePartIdx;
    }

    if (this.autoCompletePartIdx >= index) {
      ++this.autoCompletePartIdx;
    }
  }

  removePart(index
  /*: number*/
  ) {
    this._parts.splice(index, 1);

    if (index === this.activePartIdx) {
      this.activePartIdx = null;
    } else if (this.activePartIdx > index) {
      --this.activePartIdx;
    }

    if (index === this.autoCompletePartIdx) {
      this.autoCompletePartIdx = null;
    } else if (this.autoCompletePartIdx > index) {
      --this.autoCompletePartIdx;
    }
  }

  replacePart(index
  /*: number*/
  , part
  /*: Part*/
  ) {
    this._parts.splice(index, 1, part);
  }

  get parts() {
    return this._parts;
  }

  get autoComplete() {
    if (this.activePartIdx === this.autoCompletePartIdx) {
      return this._autoComplete;
    }

    return null;
  }

  getPositionAtEnd() {
    if (this._parts.length) {
      const index = this._parts.length - 1;
      const part = this._parts[index];
      return new _position.default(index, part.text.length);
    } else {
      // part index -1, as there are no parts to point at
      return new _position.default(-1, 0);
    }
  }

  serializeParts() {
    return this._parts.map(p => p.serialize());
  }

  diff(newValue
  /*: string*/
  , inputType
  /*: string*/
  , caret
  /*: DocumentOffset*/
  ) {
    const previousValue = this.parts.reduce((text, p) => text + p.text, ""); // can't use caret position with drag and drop

    if (inputType === "deleteByDrag") {
      return (0, _diff.diffDeletion)(previousValue, newValue);
    } else {
      return (0, _diff.diffAtCaret)(previousValue, newValue, caret.offset);
    }
  }

  reset(serializedParts
  /*: SerializedPart[]*/
  , caret
  /*: Caret*/
  , inputType
  /*: string*/
  ) {
    this._parts = serializedParts.map(p => this._partCreator.deserializePart(p));

    if (!caret) {
      caret = this.getPositionAtEnd();
    } // close auto complete if open
    // this would happen when clearing the composer after sending
    // a message with the autocomplete still open


    if (this._autoComplete) {
      this._autoComplete = null;
      this.autoCompletePartIdx = null;
    }

    this.updateCallback(caret, inputType);
  }
  /**
   * Inserts the given parts at the given position.
   * Should be run inside a `model.transform()` callback.
   * @param {Part[]} parts the parts to replace the range with
   * @param {DocumentPosition} position the position to start inserting at
   * @return {Number} the amount of characters added
   */


  insert(parts
  /*: Part[]*/
  , position
  /*: IPosition*/
  ) {
    const insertIndex = this.splitAt(position);
    let newTextLength = 0;

    for (let i = 0; i < parts.length; ++i) {
      const part = parts[i];
      newTextLength += part.text.length;
      this.insertPart(insertIndex + i, part);
    }

    return newTextLength;
  }

  update(newValue
  /*: string*/
  , inputType
  /*: string*/
  , caret
  /*: DocumentOffset*/
  ) {
    const diff = this.diff(newValue, inputType, caret);
    const position = this.positionForOffset(diff.at, caret.atNodeEnd);
    let removedOffsetDecrease = 0;

    if (diff.removed) {
      removedOffsetDecrease = this.removeText(position, diff.removed.length);
    }

    let addedLen = 0;

    if (diff.added) {
      addedLen = this.addText(position, diff.added, inputType);
    }

    this.mergeAdjacentParts();
    const caretOffset = diff.at - removedOffsetDecrease + addedLen;
    let newPosition = this.positionForOffset(caretOffset, true);
    const canOpenAutoComplete = inputType !== "insertFromPaste" && inputType !== "insertFromDrop";
    const acPromise = this.setActivePart(newPosition, canOpenAutoComplete);

    if (this.transformCallback) {
      const transformAddedLen = this.getTransformAddedLen(newPosition, inputType, diff);
      newPosition = this.positionForOffset(caretOffset + transformAddedLen, true);
    }

    this.updateCallback(newPosition, inputType, diff);
    return acPromise;
  }

  getTransformAddedLen(newPosition
  /*: DocumentPosition*/
  , inputType
  /*: string*/
  , diff
  /*: IDiff*/
  )
  /*: number*/
  {
    const result = this.transformCallback(newPosition, inputType, diff);
    return Number.isFinite(result) ? result : 0;
  }

  setActivePart(pos
  /*: DocumentPosition*/
  , canOpenAutoComplete
  /*: boolean*/
  ) {
    const {
      index
    } = pos;
    const part = this._parts[index];

    if (part) {
      if (index !== this.activePartIdx) {
        this.activePartIdx = index;

        if (canOpenAutoComplete && this.activePartIdx !== this.autoCompletePartIdx) {
          // else try to create one
          const ac = part.createAutoComplete(this.onAutoComplete);

          if (ac) {
            // make sure that react picks up the difference between both acs
            this._autoComplete = ac;
            this.autoCompletePartIdx = index;
            this.autoCompletePartCount = 1;
          }
        }
      } // not _autoComplete, only there if active part is autocomplete part


      if (this.autoComplete) {
        return this.autoComplete.onPartUpdate(part, pos);
      }
    } else {
      this.activePartIdx = null;
      this._autoComplete = null;
      this.autoCompletePartIdx = null;
      this.autoCompletePartCount = 0;
    }

    return Promise.resolve();
  }

  mergeAdjacentParts() {
    let prevPart;

    for (let i = 0; i < this._parts.length; ++i) {
      let part = this._parts[i];
      const isEmpty = !part.text.length;
      const isMerged = !isEmpty && prevPart && prevPart.merge(part);

      if (isEmpty || isMerged) {
        // remove empty or merged part
        part = prevPart;
        this.removePart(i); //repeat this index, as it's removed now

        --i;
      }

      prevPart = part;
    }
  }
  /**
   * removes `len` amount of characters at `pos`.
   * @param {Object} pos
   * @param {Number} len
   * @return {Number} how many characters before pos were also removed,
   * usually because of non-editable parts that can only be removed in their entirety.
   */


  removeText(pos
  /*: IPosition*/
  , len
  /*: number*/
  ) {
    let {
      index,
      offset
    } = pos;
    let removedOffsetDecrease = 0;

    while (len > 0) {
      // part might be undefined here
      let part = this._parts[index];
      const amount = Math.min(len, part.text.length - offset); // don't allow 0 amount deletions

      if (amount) {
        if (part.canEdit) {
          const replaceWith = part.remove(offset, amount);

          if (typeof replaceWith === "string") {
            this.replacePart(index, this._partCreator.createDefaultPart(replaceWith));
          }

          part = this._parts[index]; // remove empty part

          if (!part.text.length) {
            this.removePart(index);
          } else {
            index += 1;
          }
        } else {
          removedOffsetDecrease += offset;
          this.removePart(index);
        }
      } else {
        index += 1;
      }

      len -= amount;
      offset = 0;
    }

    return removedOffsetDecrease;
  } // return part index where insertion will insert between at offset


  splitAt(pos
  /*: IPosition*/
  ) {
    if (pos.index === -1) {
      return 0;
    }

    if (pos.offset === 0) {
      return pos.index;
    }

    const part = this._parts[pos.index];

    if (pos.offset >= part.text.length) {
      return pos.index + 1;
    }

    const secondPart = part.split(pos.offset);
    this.insertPart(pos.index + 1, secondPart);
    return pos.index + 1;
  }
  /**
   * inserts `str` into the model at `pos`.
   * @param {Object} pos
   * @param {string} str
   * @param {string} inputType the source of the input, see html InputEvent.inputType
   * @param {bool} options.validate Whether characters will be validated by the part.
   *                                Validating allows the inserted text to be parsed according to the part rules.
   * @return {Number} how far from position (in characters) the insertion ended.
   * This can be more than the length of `str` when crossing non-editable parts, which are skipped.
   */


  addText(pos
  /*: IPosition*/
  , str
  /*: string*/
  , inputType
  /*: string*/
  ) {
    let {
      index
    } = pos;
    const {
      offset
    } = pos;
    let addLen = str.length;
    const part = this._parts[index];

    if (part) {
      if (part.canEdit) {
        if (part.validateAndInsert(offset, str, inputType)) {
          str = null;
        } else {
          const splitPart = part.split(offset);
          index += 1;
          this.insertPart(index, splitPart);
        }
      } else if (offset !== 0) {
        // not-editable part, caret is not at start,
        // so insert str after this part
        addLen += part.text.length - offset;
        index += 1;
      }
    } else if (index < 0) {
      // if position was not found (index: -1, as happens for empty editor)
      // reset it to insert as first part
      index = 0;
    }

    while (str) {
      const newPart = this._partCreator.createPartForInput(str, index, inputType);

      str = newPart.appendUntilRejected(str, inputType);
      this.insertPart(index, newPart);
      index += 1;
    }

    return addLen;
  }

  positionForOffset(totalOffset
  /*: number*/
  , atPartEnd
  /*: boolean*/
  ) {
    let currentOffset = 0;

    const index = this._parts.findIndex(part => {
      const partLen = part.text.length;

      if (atPartEnd && currentOffset + partLen >= totalOffset || !atPartEnd && currentOffset + partLen > totalOffset) {
        return true;
      }

      currentOffset += partLen;
      return false;
    });

    if (index === -1) {
      return this.getPositionAtEnd();
    } else {
      return new _position.default(index, totalOffset - currentOffset);
    }
  }
  /**
   * Starts a range, which can span across multiple parts, to find and replace text.
   * @param {DocumentPosition} positionA a boundary of the range
   * @param {DocumentPosition?} positionB the other boundary of the range, optional
   * @return {Range}
   */


  startRange(positionA
  /*: DocumentPosition*/
  , positionB = positionA) {
    return new _range.default(this, positionA, positionB);
  }

  replaceRange(startPosition
  /*: DocumentPosition*/
  , endPosition
  /*: DocumentPosition*/
  , parts
  /*: Part[]*/
  ) {
    // convert end position to offset, so it is independent of how the document is split into parts
    // which we'll change when splitting up at the start position
    const endOffset = endPosition.asOffset(this);
    const newStartPartIndex = this.splitAt(startPosition); // convert it back to position once split at start

    endPosition = endOffset.asPosition(this);
    const newEndPartIndex = this.splitAt(endPosition);

    for (let i = newEndPartIndex - 1; i >= newStartPartIndex; --i) {
      this.removePart(i);
    }

    let insertIdx = newStartPartIndex;

    for (const part of parts) {
      this.insertPart(insertIdx, part);
      insertIdx += 1;
    }

    this.mergeAdjacentParts();
  }
  /**
   * Performs a transformation not part of an update cycle.
   * Modifying the model should only happen inside a transform call if not part of an update call.
   * @param {ManualTransformCallback} callback to run the transformations in
   * @return {Promise} a promise when auto-complete (if applicable) is done updating
   */


  transform(callback
  /*: ManualTransformCallback*/
  ) {
    const pos = callback();
    let acPromise = null;

    if (!(pos instanceof _range.default)) {
      acPromise = this.setActivePart(pos, true);
    } else {
      acPromise = Promise.resolve();
    }

    this.updateCallback(pos);
    return acPromise;
  }

}

exports.default = EditorModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvbW9kZWwudHMiXSwibmFtZXMiOlsiRWRpdG9yTW9kZWwiLCJjb25zdHJ1Y3RvciIsInBhcnRzIiwicGFydENyZWF0b3IiLCJ1cGRhdGVDYWxsYmFjayIsInJlcGxhY2VQYXJ0cyIsImNsb3NlIiwicG9zIiwiX3BhcnRzIiwic3BsaWNlIiwiYXV0b0NvbXBsZXRlUGFydElkeCIsImF1dG9Db21wbGV0ZVBhcnRDb3VudCIsImxlbmd0aCIsImxhc3RQYXJ0IiwibGFzdFBhcnRJbmRleCIsIkRvY3VtZW50UG9zaXRpb24iLCJ0ZXh0IiwiX2F1dG9Db21wbGV0ZSIsIl9wYXJ0Q3JlYXRvciIsInRyYW5zZm9ybUNhbGxiYWNrIiwic2V0VHJhbnNmb3JtQ2FsbGJhY2siLCJzZXRVcGRhdGVDYWxsYmFjayIsImlzRW1wdHkiLCJyZWR1Y2UiLCJsZW4iLCJwYXJ0IiwiY2xvbmUiLCJpbnNlcnRQYXJ0IiwiaW5kZXgiLCJhY3RpdmVQYXJ0SWR4IiwicmVtb3ZlUGFydCIsInJlcGxhY2VQYXJ0IiwiYXV0b0NvbXBsZXRlIiwiZ2V0UG9zaXRpb25BdEVuZCIsInNlcmlhbGl6ZVBhcnRzIiwibWFwIiwicCIsInNlcmlhbGl6ZSIsImRpZmYiLCJuZXdWYWx1ZSIsImlucHV0VHlwZSIsImNhcmV0IiwicHJldmlvdXNWYWx1ZSIsIm9mZnNldCIsInJlc2V0Iiwic2VyaWFsaXplZFBhcnRzIiwiZGVzZXJpYWxpemVQYXJ0IiwiaW5zZXJ0IiwicG9zaXRpb24iLCJpbnNlcnRJbmRleCIsInNwbGl0QXQiLCJuZXdUZXh0TGVuZ3RoIiwiaSIsInVwZGF0ZSIsInBvc2l0aW9uRm9yT2Zmc2V0IiwiYXQiLCJhdE5vZGVFbmQiLCJyZW1vdmVkT2Zmc2V0RGVjcmVhc2UiLCJyZW1vdmVkIiwicmVtb3ZlVGV4dCIsImFkZGVkTGVuIiwiYWRkZWQiLCJhZGRUZXh0IiwibWVyZ2VBZGphY2VudFBhcnRzIiwiY2FyZXRPZmZzZXQiLCJuZXdQb3NpdGlvbiIsImNhbk9wZW5BdXRvQ29tcGxldGUiLCJhY1Byb21pc2UiLCJzZXRBY3RpdmVQYXJ0IiwidHJhbnNmb3JtQWRkZWRMZW4iLCJnZXRUcmFuc2Zvcm1BZGRlZExlbiIsInJlc3VsdCIsIk51bWJlciIsImlzRmluaXRlIiwiYWMiLCJjcmVhdGVBdXRvQ29tcGxldGUiLCJvbkF1dG9Db21wbGV0ZSIsIm9uUGFydFVwZGF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJldlBhcnQiLCJpc01lcmdlZCIsIm1lcmdlIiwiYW1vdW50IiwiTWF0aCIsIm1pbiIsImNhbkVkaXQiLCJyZXBsYWNlV2l0aCIsInJlbW92ZSIsImNyZWF0ZURlZmF1bHRQYXJ0Iiwic2Vjb25kUGFydCIsInNwbGl0Iiwic3RyIiwiYWRkTGVuIiwidmFsaWRhdGVBbmRJbnNlcnQiLCJzcGxpdFBhcnQiLCJuZXdQYXJ0IiwiY3JlYXRlUGFydEZvcklucHV0IiwiYXBwZW5kVW50aWxSZWplY3RlZCIsInRvdGFsT2Zmc2V0IiwiYXRQYXJ0RW5kIiwiY3VycmVudE9mZnNldCIsImZpbmRJbmRleCIsInBhcnRMZW4iLCJzdGFydFJhbmdlIiwicG9zaXRpb25BIiwicG9zaXRpb25CIiwiUmFuZ2UiLCJyZXBsYWNlUmFuZ2UiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJlbmRPZmZzZXQiLCJhc09mZnNldCIsIm5ld1N0YXJ0UGFydEluZGV4IiwiYXNQb3NpdGlvbiIsIm5ld0VuZFBhcnRJbmRleCIsImluc2VydElkeCIsInRyYW5zZm9ybSIsImNhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQ2UsTUFBTUEsV0FBTixDQUFrQjtBQVM3QkMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0JDO0FBQWhCO0FBQUEsSUFBa0RDO0FBQThCO0FB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LFdBQUt5QixVQUFMLENBQWdCeUYsU0FBaEIsRUFBMkIzRixJQUEzQjtBQUNBMkYsTUFBQUEsU0FBUyxJQUFJLENBQWI7QUFDSDs7QUFDRCxTQUFLckQsa0JBQUw7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0lzRCxFQUFBQSxTQUFTLENBQUNDO0FBQUQ7QUFBQSxJQUFvQztBQUN6QyxVQUFNL0csR0FBRyxHQUFHK0csUUFBUSxFQUFwQjtBQUNBLFFBQUluRCxTQUFTLEdBQUcsSUFBaEI7O0FBQ0EsUUFBSSxFQUFFNUQsR0FBRyxZQUFZb0csY0FBakIsQ0FBSixFQUE2QjtBQUN6QnhDLE1BQUFBLFNBQVMsR0FBRyxLQUFLQyxhQUFMLENBQW1CN0QsR0FBbkIsRUFBd0IsSUFBeEIsQ0FBWjtBQUNILEtBRkQsTUFFTztBQUNINEQsTUFBQUEsU0FBUyxHQUFHVyxPQUFPLENBQUNDLE9BQVIsRUFBWjtBQUNIOztBQUNELFNBQUszRSxjQUFMLENBQW9CRyxHQUFwQjtBQUNBLFdBQU80RCxTQUFQO0FBQ0g7O0FBdlo0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge2RpZmZBdENhcmV0LCBkaWZmRGVsZXRpb24sIElEaWZmfSBmcm9tIFwiLi9kaWZmXCI7XG5pbXBvcnQgRG9jdW1lbnRQb3NpdGlvbiwge0lQb3NpdGlvbn0gZnJvbSBcIi4vcG9zaXRpb25cIjtcbmltcG9ydCBSYW5nZSBmcm9tIFwiLi9yYW5nZVwiO1xuaW1wb3J0IHtTZXJpYWxpemVkUGFydCwgUGFydCwgUGFydENyZWF0b3J9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsLCB7SUNhbGxiYWNrfSBmcm9tIFwiLi9hdXRvY29tcGxldGVcIjtcbmltcG9ydCBEb2N1bWVudE9mZnNldCBmcm9tIFwiLi9vZmZzZXRcIjtcbmltcG9ydCB7Q2FyZXR9IGZyb20gXCIuL2NhcmV0XCI7XG5cbi8qKlxuICogQGNhbGxiYWNrIE1vZGVsQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RG9jdW1lbnRQb3NpdGlvbj99IGNhcmV0UG9zaXRpb24gdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBjYXJldCBzaG91bGQgYmUgcG9zaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gaW5wdXRUeXBlIHRoZSBpbnB1dFR5cGUgb2YgdGhlIERPTSBpbnB1dCBldmVudFxuICogQHBhcmFtIHtvYmplY3Q/fSBkaWZmIGFuIG9iamVjdCB3aXRoIGByZW1vdmVkYCBhbmQgYGFkZGVkYCBzdHJpbmdzXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgVHJhbnNmb3JtQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RG9jdW1lbnRQb3NpdGlvbj99IGNhcmV0UG9zaXRpb24gdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBjYXJldCBzaG91bGQgYmUgcG9zaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gaW5wdXRUeXBlIHRoZSBpbnB1dFR5cGUgb2YgdGhlIERPTSBpbnB1dCBldmVudFxuICogQHBhcmFtIHtvYmplY3Q/fSBkaWZmIGFuIG9iamVjdCB3aXRoIGByZW1vdmVkYCBhbmQgYGFkZGVkYCBzdHJpbmdzXG4gKiBAcmV0dXJuIHtOdW1iZXI/fSBhZGRlZExlbiBob3cgbWFueSBjaGFyYWN0ZXJzIHdlcmUgYWRkZWQvcmVtb3ZlZCAoLSkgYmVmb3JlIHRoZSBjYXJldCBkdXJpbmcgdGhlIHRyYW5zZm9ybWF0aW9uIHN0ZXAuXG4gKiAgICBUaGlzIGlzIHVzZWQgdG8gYWRqdXN0IHRoZSBjYXJldCBwb3NpdGlvbi5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBNYW51YWxUcmFuc2Zvcm1DYWxsYmFja1xuICogQHJldHVybiB0aGUgY2FyZXQgcG9zaXRpb25cbiAqL1xuXG50eXBlIFRyYW5zZm9ybUNhbGxiYWNrID0gKGNhcmV0UG9zaXRpb246IERvY3VtZW50UG9zaXRpb24sIGlucHV0VHlwZTogc3RyaW5nLCBkaWZmOiBJRGlmZikgPT4gbnVtYmVyIHwgdm9pZDtcbnR5cGUgVXBkYXRlQ2FsbGJhY2sgPSAoY2FyZXQ6IENhcmV0LCBpbnB1dFR5cGU/OiBzdHJpbmcsIGRpZmY/OiBJRGlmZikgPT4gdm9pZDtcbnR5cGUgTWFudWFsVHJhbnNmb3JtQ2FsbGJhY2sgPSAoKSA9PiBDYXJldDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yTW9kZWwge1xuICAgIHByaXZhdGUgX3BhcnRzOiBQYXJ0W107XG4gICAgcHJpdmF0ZSByZWFkb25seSBfcGFydENyZWF0b3I6IFBhcnRDcmVhdG9yO1xuICAgIHByaXZhdGUgYWN0aXZlUGFydElkeDogbnVtYmVyID0gbnVsbDtcbiAgICBwcml2YXRlIF9hdXRvQ29tcGxldGU6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBhdXRvQ29tcGxldGVQYXJ0SWR4OiBudW1iZXIgPSBudWxsO1xuICAgIHByaXZhdGUgYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMDtcbiAgICBwcml2YXRlIHRyYW5zZm9ybUNhbGxiYWNrOiBUcmFuc2Zvcm1DYWxsYmFjayA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihwYXJ0czogUGFydFtdLCBwYXJ0Q3JlYXRvcjogUGFydENyZWF0b3IsIHByaXZhdGUgdXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrID0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IHBhcnRzO1xuICAgICAgICB0aGlzLl9wYXJ0Q3JlYXRvciA9IHBhcnRDcmVhdG9yO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUNhbGxiYWNrID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBjYWxsYmFjayBmb3IgdGhlIHRyYW5zZm9ybWF0aW9uIHN0ZXAuXG4gICAgICogV2hpbGUgcHJvY2Vzc2luZyBhbiB1cGRhdGUsIHJpZ2h0IGJlZm9yZSBjYWxsaW5nIHRoZSB1cGRhdGUgY2FsbGJhY2ssXG4gICAgICogYSB0cmFuc2Zvcm0gY2FsbGJhY2sgY2FuIGJlIGNhbGxlZCwgd2hpY2ggc2VydmVzIHRvIGRvIG1vZGlmaWNhdGlvbnNcbiAgICAgKiBvbiB0aGUgbW9kZWwgdGhhdCBjYW4gc3BhbiBtdWx0aXBsZSBwYXJ0cy4gQWxzbyBzZWUgYHN0YXJ0UmFuZ2UoKWAuXG4gICAgICogQHBhcmFtIHtUcmFuc2Zvcm1DYWxsYmFja30gdHJhbnNmb3JtQ2FsbGJhY2tcbiAgICAgKi9cbiAgICBzZXRUcmFuc2Zvcm1DYWxsYmFjayh0cmFuc2Zvcm1DYWxsYmFjazogVHJhbnNmb3JtQ2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1DYWxsYmFjayA9IHRyYW5zZm9ybUNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGNhbGxiYWNrIGZvciByZXJlbmRlcmluZyB0aGUgbW9kZWwgYWZ0ZXIgaXQgaGFzIGJlZW4gdXBkYXRlZC5cbiAgICAgKiBAcGFyYW0ge01vZGVsQ2FsbGJhY2t9IHVwZGF0ZUNhbGxiYWNrXG4gICAgICovXG4gICAgc2V0VXBkYXRlQ2FsbGJhY2sodXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2sgPSB1cGRhdGVDYWxsYmFjaztcbiAgICB9XG5cbiAgICBnZXQgcGFydENyZWF0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0Q3JlYXRvcjtcbiAgICB9XG5cbiAgICBnZXQgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLnJlZHVjZSgobGVuLCBwYXJ0KSA9PiBsZW4gKyBwYXJ0LnRleHQubGVuZ3RoLCAwKSA9PT0gMDtcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFZGl0b3JNb2RlbCh0aGlzLl9wYXJ0cywgdGhpcy5fcGFydENyZWF0b3IsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5zZXJ0UGFydChpbmRleDogbnVtYmVyLCBwYXJ0OiBQYXJ0KSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnNwbGljZShpbmRleCwgMCwgcGFydCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhcnRJZHggPj0gaW5kZXgpIHtcbiAgICAgICAgICAgICsrdGhpcy5hY3RpdmVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPj0gaW5kZXgpIHtcbiAgICAgICAgICAgICsrdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVQYXJ0KGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSB0aGlzLmFjdGl2ZVBhcnRJZHgpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFydElkeCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3RpdmVQYXJ0SWR4ID4gaW5kZXgpIHtcbiAgICAgICAgICAgIC0tdGhpcy5hY3RpdmVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4KSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCA+IGluZGV4KSB7XG4gICAgICAgICAgICAtLXRoaXMuYXV0b0NvbXBsZXRlUGFydElkeDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVwbGFjZVBhcnQoaW5kZXg6IG51bWJlciwgcGFydDogUGFydCkge1xuICAgICAgICB0aGlzLl9wYXJ0cy5zcGxpY2UoaW5kZXgsIDEsIHBhcnQpO1xuICAgIH1cblxuICAgIGdldCBwYXJ0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzO1xuICAgIH1cblxuICAgIGdldCBhdXRvQ29tcGxldGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhcnRJZHggPT09IHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9Db21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbkF0RW5kKCkge1xuICAgICAgICBpZiAodGhpcy5fcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX3BhcnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEb2N1bWVudFBvc2l0aW9uKGluZGV4LCBwYXJ0LnRleHQubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHBhcnQgaW5kZXggLTEsIGFzIHRoZXJlIGFyZSBubyBwYXJ0cyB0byBwb2ludCBhdFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEb2N1bWVudFBvc2l0aW9uKC0xLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlcmlhbGl6ZVBhcnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHMubWFwKHAgPT4gcC5zZXJpYWxpemUoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaWZmKG5ld1ZhbHVlOiBzdHJpbmcsIGlucHV0VHlwZTogc3RyaW5nLCBjYXJldDogRG9jdW1lbnRPZmZzZXQpIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMucGFydHMucmVkdWNlKCh0ZXh0LCBwKSA9PiB0ZXh0ICsgcC50ZXh0LCBcIlwiKTtcbiAgICAgICAgLy8gY2FuJ3QgdXNlIGNhcmV0IHBvc2l0aW9uIHdpdGggZHJhZyBhbmQgZHJvcFxuICAgICAgICBpZiAoaW5wdXRUeXBlID09PSBcImRlbGV0ZUJ5RHJhZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gZGlmZkRlbGV0aW9uKHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkaWZmQXRDYXJldChwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSwgY2FyZXQub2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0KHNlcmlhbGl6ZWRQYXJ0czogU2VyaWFsaXplZFBhcnRbXSwgY2FyZXQ6IENhcmV0LCBpbnB1dFR5cGU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IHNlcmlhbGl6ZWRQYXJ0cy5tYXAocCA9PiB0aGlzLl9wYXJ0Q3JlYXRvci5kZXNlcmlhbGl6ZVBhcnQocCkpO1xuICAgICAgICBpZiAoIWNhcmV0KSB7XG4gICAgICAgICAgICBjYXJldCA9IHRoaXMuZ2V0UG9zaXRpb25BdEVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNsb3NlIGF1dG8gY29tcGxldGUgaWYgb3BlblxuICAgICAgICAvLyB0aGlzIHdvdWxkIGhhcHBlbiB3aGVuIGNsZWFyaW5nIHRoZSBjb21wb3NlciBhZnRlciBzZW5kaW5nXG4gICAgICAgIC8vIGEgbWVzc2FnZSB3aXRoIHRoZSBhdXRvY29tcGxldGUgc3RpbGwgb3BlblxuICAgICAgICBpZiAodGhpcy5fYXV0b0NvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9hdXRvQ29tcGxldGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKGNhcmV0LCBpbnB1dFR5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIGdpdmVuIHBhcnRzIGF0IHRoZSBnaXZlbiBwb3NpdGlvbi5cbiAgICAgKiBTaG91bGQgYmUgcnVuIGluc2lkZSBhIGBtb2RlbC50cmFuc2Zvcm0oKWAgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtQYXJ0W119IHBhcnRzIHRoZSBwYXJ0cyB0byByZXBsYWNlIHRoZSByYW5nZSB3aXRoXG4gICAgICogQHBhcmFtIHtEb2N1bWVudFBvc2l0aW9ufSBwb3NpdGlvbiB0aGUgcG9zaXRpb24gdG8gc3RhcnQgaW5zZXJ0aW5nIGF0XG4gICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgYW1vdW50IG9mIGNoYXJhY3RlcnMgYWRkZWRcbiAgICAgKi9cbiAgICBpbnNlcnQocGFydHM6IFBhcnRbXSwgcG9zaXRpb246IElQb3NpdGlvbikge1xuICAgICAgICBjb25zdCBpbnNlcnRJbmRleCA9IHRoaXMuc3BsaXRBdChwb3NpdGlvbik7XG4gICAgICAgIGxldCBuZXdUZXh0TGVuZ3RoID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgbmV3VGV4dExlbmd0aCArPSBwYXJ0LnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KGluc2VydEluZGV4ICsgaSwgcGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld1RleHRMZW5ndGg7XG4gICAgfVxuXG4gICAgdXBkYXRlKG5ld1ZhbHVlOiBzdHJpbmcsIGlucHV0VHlwZTogc3RyaW5nLCBjYXJldDogRG9jdW1lbnRPZmZzZXQpIHtcbiAgICAgICAgY29uc3QgZGlmZiA9IHRoaXMuZGlmZihuZXdWYWx1ZSwgaW5wdXRUeXBlLCBjYXJldCk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkZvck9mZnNldChkaWZmLmF0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICBsZXQgcmVtb3ZlZE9mZnNldERlY3JlYXNlID0gMDtcbiAgICAgICAgaWYgKGRpZmYucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmVtb3ZlZE9mZnNldERlY3JlYXNlID0gdGhpcy5yZW1vdmVUZXh0KHBvc2l0aW9uLCBkaWZmLnJlbW92ZWQubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYWRkZWRMZW4gPSAwO1xuICAgICAgICBpZiAoZGlmZi5hZGRlZCkge1xuICAgICAgICAgICAgYWRkZWRMZW4gPSB0aGlzLmFkZFRleHQocG9zaXRpb24sIGRpZmYuYWRkZWQsIGlucHV0VHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZXJnZUFkamFjZW50UGFydHMoKTtcbiAgICAgICAgY29uc3QgY2FyZXRPZmZzZXQgPSBkaWZmLmF0IC0gcmVtb3ZlZE9mZnNldERlY3JlYXNlICsgYWRkZWRMZW47XG4gICAgICAgIGxldCBuZXdQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXRPZmZzZXQsIHRydWUpO1xuICAgICAgICBjb25zdCBjYW5PcGVuQXV0b0NvbXBsZXRlID0gaW5wdXRUeXBlICE9PSBcImluc2VydEZyb21QYXN0ZVwiICYmIGlucHV0VHlwZSAhPT0gXCJpbnNlcnRGcm9tRHJvcFwiO1xuICAgICAgICBjb25zdCBhY1Byb21pc2UgPSB0aGlzLnNldEFjdGl2ZVBhcnQobmV3UG9zaXRpb24sIGNhbk9wZW5BdXRvQ29tcGxldGUpO1xuICAgICAgICBpZiAodGhpcy50cmFuc2Zvcm1DYWxsYmFjaykge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtQWRkZWRMZW4gPSB0aGlzLmdldFRyYW5zZm9ybUFkZGVkTGVuKG5ld1Bvc2l0aW9uLCBpbnB1dFR5cGUsIGRpZmYpO1xuICAgICAgICAgICAgbmV3UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0T2Zmc2V0ICsgdHJhbnNmb3JtQWRkZWRMZW4sIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2sobmV3UG9zaXRpb24sIGlucHV0VHlwZSwgZGlmZik7XG4gICAgICAgIHJldHVybiBhY1Byb21pc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2Zvcm1BZGRlZExlbihuZXdQb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbiwgaW5wdXRUeXBlOiBzdHJpbmcsIGRpZmY6IElEaWZmKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy50cmFuc2Zvcm1DYWxsYmFjayhuZXdQb3NpdGlvbiwgaW5wdXRUeXBlLCBkaWZmKTtcbiAgICAgICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IGFzIG51bWJlciA6IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRBY3RpdmVQYXJ0KHBvczogRG9jdW1lbnRQb3NpdGlvbiwgY2FuT3BlbkF1dG9Db21wbGV0ZTogYm9vbGVhbikge1xuICAgICAgICBjb25zdCB7aW5kZXh9ID0gcG9zO1xuICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICBpZiAocGFydCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSB0aGlzLmFjdGl2ZVBhcnRJZHgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVBhcnRJZHggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBpZiAoY2FuT3BlbkF1dG9Db21wbGV0ZSAmJiB0aGlzLmFjdGl2ZVBhcnRJZHggIT09IHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIHRyeSB0byBjcmVhdGUgb25lXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjID0gcGFydC5jcmVhdGVBdXRvQ29tcGxldGUodGhpcy5vbkF1dG9Db21wbGV0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgcmVhY3QgcGlja3MgdXAgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBib3RoIGFjc1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0b0NvbXBsZXRlID0gYWM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG5vdCBfYXV0b0NvbXBsZXRlLCBvbmx5IHRoZXJlIGlmIGFjdGl2ZSBwYXJ0IGlzIGF1dG9jb21wbGV0ZSBwYXJ0XG4gICAgICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdXRvQ29tcGxldGUub25QYXJ0VXBkYXRlKHBhcnQsIHBvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVBhcnRJZHggPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fYXV0b0NvbXBsZXRlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRDb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BdXRvQ29tcGxldGUgPSAoe3JlcGxhY2VQYXJ0cywgY2xvc2V9OiBJQ2FsbGJhY2spID0+IHtcbiAgICAgICAgbGV0IHBvcztcbiAgICAgICAgaWYgKHJlcGxhY2VQYXJ0cykge1xuICAgICAgICAgICAgdGhpcy5fcGFydHMuc3BsaWNlKHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCwgdGhpcy5hdXRvQ29tcGxldGVQYXJ0Q291bnQsIC4uLnJlcGxhY2VQYXJ0cyk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRDb3VudCA9IHJlcGxhY2VQYXJ0cy5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBsYXN0UGFydCA9IHJlcGxhY2VQYXJ0c1tyZXBsYWNlUGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb25zdCBsYXN0UGFydEluZGV4ID0gdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4ICsgcmVwbGFjZVBhcnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBwb3MgPSBuZXcgRG9jdW1lbnRQb3NpdGlvbihsYXN0UGFydEluZGV4LCBsYXN0UGFydC50ZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLl9hdXRvQ29tcGxldGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXJlbmRlciBldmVuIGlmIGVkaXRvciBjb250ZW50cyBkaWRuJ3QgY2hhbmdlXG4gICAgICAgIC8vIHRvIG1ha2Ugc3VyZSB0aGUgTWVzc2FnZUVkaXRvciBjaGVja3NcbiAgICAgICAgLy8gbW9kZWwuYXV0b0NvbXBsZXRlIGJlaW5nIGVtcHR5IGFuZCBjbG9zZXMgaXRcbiAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayhwb3MpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG1lcmdlQWRqYWNlbnRQYXJ0cygpIHtcbiAgICAgICAgbGV0IHByZXZQYXJ0O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3BhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBsZXQgcGFydCA9IHRoaXMuX3BhcnRzW2ldO1xuICAgICAgICAgICAgY29uc3QgaXNFbXB0eSA9ICFwYXJ0LnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgaXNNZXJnZWQgPSAhaXNFbXB0eSAmJiBwcmV2UGFydCAmJiBwcmV2UGFydC5tZXJnZShwYXJ0KTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5IHx8IGlzTWVyZ2VkKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGVtcHR5IG9yIG1lcmdlZCBwYXJ0XG4gICAgICAgICAgICAgICAgcGFydCA9IHByZXZQYXJ0O1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydChpKTtcbiAgICAgICAgICAgICAgICAvL3JlcGVhdCB0aGlzIGluZGV4LCBhcyBpdCdzIHJlbW92ZWQgbm93XG4gICAgICAgICAgICAgICAgLS1pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldlBhcnQgPSBwYXJ0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlcyBgbGVuYCBhbW91bnQgb2YgY2hhcmFjdGVycyBhdCBgcG9zYC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9zXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlblxuICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IG1hbnkgY2hhcmFjdGVycyBiZWZvcmUgcG9zIHdlcmUgYWxzbyByZW1vdmVkLFxuICAgICAqIHVzdWFsbHkgYmVjYXVzZSBvZiBub24tZWRpdGFibGUgcGFydHMgdGhhdCBjYW4gb25seSBiZSByZW1vdmVkIGluIHRoZWlyIGVudGlyZXR5LlxuICAgICAqL1xuICAgIHJlbW92ZVRleHQocG9zOiBJUG9zaXRpb24sIGxlbjogbnVtYmVyKSB7XG4gICAgICAgIGxldCB7aW5kZXgsIG9mZnNldH0gPSBwb3M7XG4gICAgICAgIGxldCByZW1vdmVkT2Zmc2V0RGVjcmVhc2UgPSAwO1xuICAgICAgICB3aGlsZSAobGVuID4gMCkge1xuICAgICAgICAgICAgLy8gcGFydCBtaWdodCBiZSB1bmRlZmluZWQgaGVyZVxuICAgICAgICAgICAgbGV0IHBhcnQgPSB0aGlzLl9wYXJ0c1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBhbW91bnQgPSBNYXRoLm1pbihsZW4sIHBhcnQudGV4dC5sZW5ndGggLSBvZmZzZXQpO1xuICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgMCBhbW91bnQgZGVsZXRpb25zXG4gICAgICAgICAgICBpZiAoYW1vdW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnQuY2FuRWRpdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlV2l0aCA9IHBhcnQucmVtb3ZlKG9mZnNldCwgYW1vdW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlV2l0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlUGFydChpbmRleCwgdGhpcy5fcGFydENyZWF0b3IuY3JlYXRlRGVmYXVsdFBhcnQocmVwbGFjZVdpdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZW1wdHkgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcnQudGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydChpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZE9mZnNldERlY3JlYXNlICs9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0KGluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZW4gLT0gYW1vdW50O1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVtb3ZlZE9mZnNldERlY3JlYXNlO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBwYXJ0IGluZGV4IHdoZXJlIGluc2VydGlvbiB3aWxsIGluc2VydCBiZXR3ZWVuIGF0IG9mZnNldFxuICAgIHByaXZhdGUgc3BsaXRBdChwb3M6IElQb3NpdGlvbikge1xuICAgICAgICBpZiAocG9zLmluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcy5vZmZzZXQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBwb3MuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydCA9IHRoaXMuX3BhcnRzW3Bvcy5pbmRleF07XG4gICAgICAgIGlmIChwb3Mub2Zmc2V0ID49IHBhcnQudGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBwb3MuaW5kZXggKyAxO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2Vjb25kUGFydCA9IHBhcnQuc3BsaXQocG9zLm9mZnNldCk7XG4gICAgICAgIHRoaXMuaW5zZXJ0UGFydChwb3MuaW5kZXggKyAxLCBzZWNvbmRQYXJ0KTtcbiAgICAgICAgcmV0dXJuIHBvcy5pbmRleCArIDE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW5zZXJ0cyBgc3RyYCBpbnRvIHRoZSBtb2RlbCBhdCBgcG9zYC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9zXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFR5cGUgdGhlIHNvdXJjZSBvZiB0aGUgaW5wdXQsIHNlZSBodG1sIElucHV0RXZlbnQuaW5wdXRUeXBlXG4gICAgICogQHBhcmFtIHtib29sfSBvcHRpb25zLnZhbGlkYXRlIFdoZXRoZXIgY2hhcmFjdGVycyB3aWxsIGJlIHZhbGlkYXRlZCBieSB0aGUgcGFydC5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmFsaWRhdGluZyBhbGxvd3MgdGhlIGluc2VydGVkIHRleHQgdG8gYmUgcGFyc2VkIGFjY29yZGluZyB0byB0aGUgcGFydCBydWxlcy5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBmYXIgZnJvbSBwb3NpdGlvbiAoaW4gY2hhcmFjdGVycykgdGhlIGluc2VydGlvbiBlbmRlZC5cbiAgICAgKiBUaGlzIGNhbiBiZSBtb3JlIHRoYW4gdGhlIGxlbmd0aCBvZiBgc3RyYCB3aGVuIGNyb3NzaW5nIG5vbi1lZGl0YWJsZSBwYXJ0cywgd2hpY2ggYXJlIHNraXBwZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRUZXh0KHBvczogSVBvc2l0aW9uLCBzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHtpbmRleH0gPSBwb3M7XG4gICAgICAgIGNvbnN0IHtvZmZzZXR9ID0gcG9zO1xuICAgICAgICBsZXQgYWRkTGVuID0gc3RyLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGFydCA9IHRoaXMuX3BhcnRzW2luZGV4XTtcbiAgICAgICAgaWYgKHBhcnQpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNhbkVkaXQpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFydC52YWxpZGF0ZUFuZEluc2VydChvZmZzZXQsIHN0ciwgaW5wdXRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBzdHIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0UGFydCA9IHBhcnQuc3BsaXQob2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KGluZGV4LCBzcGxpdFBhcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gbm90LWVkaXRhYmxlIHBhcnQsIGNhcmV0IGlzIG5vdCBhdCBzdGFydCxcbiAgICAgICAgICAgICAgICAvLyBzbyBpbnNlcnQgc3RyIGFmdGVyIHRoaXMgcGFydFxuICAgICAgICAgICAgICAgIGFkZExlbiArPSBwYXJ0LnRleHQubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgICAvLyBpZiBwb3NpdGlvbiB3YXMgbm90IGZvdW5kIChpbmRleDogLTEsIGFzIGhhcHBlbnMgZm9yIGVtcHR5IGVkaXRvcilcbiAgICAgICAgICAgIC8vIHJlc2V0IGl0IHRvIGluc2VydCBhcyBmaXJzdCBwYXJ0XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHN0cikge1xuICAgICAgICAgICAgY29uc3QgbmV3UGFydCA9IHRoaXMuX3BhcnRDcmVhdG9yLmNyZWF0ZVBhcnRGb3JJbnB1dChzdHIsIGluZGV4LCBpbnB1dFR5cGUpO1xuICAgICAgICAgICAgc3RyID0gbmV3UGFydC5hcHBlbmRVbnRpbFJlamVjdGVkKHN0ciwgaW5wdXRUeXBlKTtcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFydChpbmRleCwgbmV3UGFydCk7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhZGRMZW47XG4gICAgfVxuXG4gICAgcG9zaXRpb25Gb3JPZmZzZXQodG90YWxPZmZzZXQ6IG51bWJlciwgYXRQYXJ0RW5kOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9wYXJ0cy5maW5kSW5kZXgocGFydCA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0TGVuID0gcGFydC50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoYXRQYXJ0RW5kICYmIChjdXJyZW50T2Zmc2V0ICsgcGFydExlbikgPj0gdG90YWxPZmZzZXQpIHx8XG4gICAgICAgICAgICAgICAgKCFhdFBhcnRFbmQgJiYgKGN1cnJlbnRPZmZzZXQgKyBwYXJ0TGVuKSA+IHRvdGFsT2Zmc2V0KVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50T2Zmc2V0ICs9IHBhcnRMZW47XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQb3NpdGlvbkF0RW5kKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50UG9zaXRpb24oaW5kZXgsIHRvdGFsT2Zmc2V0IC0gY3VycmVudE9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSByYW5nZSwgd2hpY2ggY2FuIHNwYW4gYWNyb3NzIG11bHRpcGxlIHBhcnRzLCB0byBmaW5kIGFuZCByZXBsYWNlIHRleHQuXG4gICAgICogQHBhcmFtIHtEb2N1bWVudFBvc2l0aW9ufSBwb3NpdGlvbkEgYSBib3VuZGFyeSBvZiB0aGUgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge0RvY3VtZW50UG9zaXRpb24/fSBwb3NpdGlvbkIgdGhlIG90aGVyIGJvdW5kYXJ5IG9mIHRoZSByYW5nZSwgb3B0aW9uYWxcbiAgICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICAgKi9cbiAgICBzdGFydFJhbmdlKHBvc2l0aW9uQTogRG9jdW1lbnRQb3NpdGlvbiwgcG9zaXRpb25CID0gcG9zaXRpb25BKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UodGhpcywgcG9zaXRpb25BLCBwb3NpdGlvbkIpO1xuICAgIH1cblxuICAgIHJlcGxhY2VSYW5nZShzdGFydFBvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uLCBlbmRQb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbiwgcGFydHM6IFBhcnRbXSkge1xuICAgICAgICAvLyBjb252ZXJ0IGVuZCBwb3NpdGlvbiB0byBvZmZzZXQsIHNvIGl0IGlzIGluZGVwZW5kZW50IG9mIGhvdyB0aGUgZG9jdW1lbnQgaXMgc3BsaXQgaW50byBwYXJ0c1xuICAgICAgICAvLyB3aGljaCB3ZSdsbCBjaGFuZ2Ugd2hlbiBzcGxpdHRpbmcgdXAgYXQgdGhlIHN0YXJ0IHBvc2l0aW9uXG4gICAgICAgIGNvbnN0IGVuZE9mZnNldCA9IGVuZFBvc2l0aW9uLmFzT2Zmc2V0KHRoaXMpO1xuICAgICAgICBjb25zdCBuZXdTdGFydFBhcnRJbmRleCA9IHRoaXMuc3BsaXRBdChzdGFydFBvc2l0aW9uKTtcbiAgICAgICAgLy8gY29udmVydCBpdCBiYWNrIHRvIHBvc2l0aW9uIG9uY2Ugc3BsaXQgYXQgc3RhcnRcbiAgICAgICAgZW5kUG9zaXRpb24gPSBlbmRPZmZzZXQuYXNQb3NpdGlvbih0aGlzKTtcbiAgICAgICAgY29uc3QgbmV3RW5kUGFydEluZGV4ID0gdGhpcy5zcGxpdEF0KGVuZFBvc2l0aW9uKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IG5ld0VuZFBhcnRJbmRleCAtIDE7IGkgPj0gbmV3U3RhcnRQYXJ0SW5kZXg7IC0taSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0KGkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbnNlcnRJZHggPSBuZXdTdGFydFBhcnRJbmRleDtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgICAgICAgICB0aGlzLmluc2VydFBhcnQoaW5zZXJ0SWR4LCBwYXJ0KTtcbiAgICAgICAgICAgIGluc2VydElkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVyZ2VBZGphY2VudFBhcnRzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYSB0cmFuc2Zvcm1hdGlvbiBub3QgcGFydCBvZiBhbiB1cGRhdGUgY3ljbGUuXG4gICAgICogTW9kaWZ5aW5nIHRoZSBtb2RlbCBzaG91bGQgb25seSBoYXBwZW4gaW5zaWRlIGEgdHJhbnNmb3JtIGNhbGwgaWYgbm90IHBhcnQgb2YgYW4gdXBkYXRlIGNhbGwuXG4gICAgICogQHBhcmFtIHtNYW51YWxUcmFuc2Zvcm1DYWxsYmFja30gY2FsbGJhY2sgdG8gcnVuIHRoZSB0cmFuc2Zvcm1hdGlvbnMgaW5cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2Ugd2hlbiBhdXRvLWNvbXBsZXRlIChpZiBhcHBsaWNhYmxlKSBpcyBkb25lIHVwZGF0aW5nXG4gICAgICovXG4gICAgdHJhbnNmb3JtKGNhbGxiYWNrOiBNYW51YWxUcmFuc2Zvcm1DYWxsYmFjaykge1xuICAgICAgICBjb25zdCBwb3MgPSBjYWxsYmFjaygpO1xuICAgICAgICBsZXQgYWNQcm9taXNlID0gbnVsbDtcbiAgICAgICAgaWYgKCEocG9zIGluc3RhbmNlb2YgUmFuZ2UpKSB7XG4gICAgICAgICAgICBhY1Byb21pc2UgPSB0aGlzLnNldEFjdGl2ZVBhcnQocG9zLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2socG9zKTtcbiAgICAgICAgcmV0dXJuIGFjUHJvbWlzZTtcbiAgICB9XG59XG4iXX0=