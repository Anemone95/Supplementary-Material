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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvbW9kZWwudHMiXSwibmFtZXMiOlsiRWRpdG9yTW9kZWwiLCJjb25zdHJ1Y3RvciIsInBhcnRzIiwicGFydENyZWF0b3IiLCJ1cGRhdGVDYWxsYmFjayIsInJlcGxhY2VQYXJ0cyIsImNsb3NlIiwicG9zIiwiX3BhcnRzIiwic3BsaWNlIiwiYXV0b0NvbXBsZXRlUGFydElkeCIsImF1dG9Db21wbGV0ZVBhcnRDb3VudCIsImxlbmd0aCIsImxhc3RQYXJ0IiwibGFzdFBhcnRJbmRleCIsIkRvY3VtZW50UG9zaXRpb24iLCJ0ZXh0IiwiX2F1dG9Db21wbGV0ZSIsIl9wYXJ0Q3JlYXRvciIsInRyYW5zZm9ybUNhbGxiYWNrIiwic2V0VHJhbnNmb3JtQ2FsbGJhY2siLCJzZXRVcGRhdGVDYWxsYmFjayIsImlzRW1wdHkiLCJyZWR1Y2UiLCJsZW4iLCJwYXJ0IiwiY2xvbmUiLCJpbnNlcnRQYXJ0IiwiaW5kZXgiLCJhY3RpdmVQYXJ0SWR4IiwicmVtb3ZlUGFydCIsInJlcGxhY2VQYXJ0IiwiYXV0b0NvbXBsZXRlIiwiZ2V0UG9zaXRpb25BdEVuZCIsInNlcmlhbGl6ZVBhcnRzIiwibWFwIiwicCIsInNlcmlhbGl6ZSIsImRpZmYiLCJuZXdWYWx1ZSIsImlucHV0VHlwZSIsImNhcmV0IiwicHJldmlvdXNWYWx1ZSIsIm9mZnNldCIsInJlc2V0Iiwic2VyaWFsaXplZFBhcnRzIiwiZGVzZXJpYWxpemVQYXJ0IiwiaW5zZXJ0IiwicG9zaXRpb24iLCJpbnNlcnRJbmRleCIsInNwbGl0QXQiLCJuZXdUZXh0TGVuZ3RoIiwiaSIsInVwZGF0ZSIsInBvc2l0aW9uRm9yT2Zmc2V0IiwiYXQiLCJhdE5vZGVFbmQiLCJyZW1vdmVkT2Zmc2V0RGVjcmVhc2UiLCJyZW1vdmVkIiwicmVtb3ZlVGV4dCIsImFkZGVkTGVuIiwiYWRkZWQiLCJhZGRUZXh0IiwibWVyZ2VBZGphY2VudFBhcnRzIiwiY2FyZXRPZmZzZXQiLCJuZXdQb3NpdGlvbiIsImNhbk9wZW5BdXRvQ29tcGxldGUiLCJhY1Byb21pc2UiLCJzZXRBY3RpdmVQYXJ0IiwidHJhbnNmb3JtQWRkZWRMZW4iLCJnZXRUcmFuc2Zvcm1BZGRlZExlbiIsInJlc3VsdCIsIk51bWJlciIsImlzRmluaXRlIiwiYWMiLCJjcmVhdGVBdXRvQ29tcGxldGUiLCJvbkF1dG9Db21wbGV0ZSIsIm9uUGFydFVwZGF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJldlBhcnQiLCJpc01lcmdlZCIsIm1lcmdlIiwiYW1vdW50IiwiTWF0aCIsIm1pbiIsImNhbkVkaXQiLCJyZXBsYWNlV2l0aCIsInJlbW92ZSIsImNyZWF0ZURlZmF1bHRQYXJ0Iiwic2Vjb25kUGFydCIsInNwbGl0Iiwic3RyIiwiYWRkTGVuIiwidmFsaWRhdGVBbmRJbnNlcnQiLCJzcGxpdFBhcnQiLCJuZXdQYXJ0IiwiY3JlYXRlUGFydEZvcklucHV0IiwiYXBwZW5kVW50aWxSZWplY3RlZCIsInRvdGFsT2Zmc2V0IiwiYXRQYXJ0RW5kIiwiY3VycmVudE9mZnNldCIsImZpbmRJbmRleCIsInBhcnRMZW4iLCJzdGFydFJhbmdlIiwicG9zaXRpb25BIiwicG9zaXRpb25CIiwiUmFuZ2UiLCJyZXBsYWNlUmFuZ2UiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJlbmRPZmZzZXQiLCJhc09mZnNldCIsIm5ld1N0YXJ0UGFydEluZGV4IiwiYXNQb3NpdGlvbiIsIm5ld0VuZFBhcnRJbmRleCIsImluc2VydElkeCIsInRyYW5zZm9ybSIsImNhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQ2UsTUFBTUEsV0FBTixDQUFrQjtBQVM3QkMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0JDO0FBQWhCO0FBQUEsSUFBa0RDO0FBQThCO0FB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LFdBQUt5QixVQUFMLENBQWdCeUYsU0FBaEIsRUFBMkIzRixJQUEzQjtBQUNBMkYsTUFBQUEsU0FBUyxJQUFJLENBQWI7QUFDSDs7QUFDRCxTQUFLckQsa0JBQUw7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0lzRCxFQUFBQSxTQUFTLENBQUNDO0FBQUQ7QUFBQSxJQUFvQztBQUN6QyxVQUFNL0csR0FBRyxHQUFHK0csUUFBUSxFQUFwQjtBQUNBLFFBQUluRCxTQUFTLEdBQUcsSUFBaEI7O0FBQ0EsUUFBSSxFQUFFNUQsR0FBRyxZQUFZb0csY0FBakIsQ0FBSixFQUE2QjtBQUN6QnhDLE1BQUFBLFNBQVMsR0FBRyxLQUFLQyxhQUFMLENBQW1CN0QsR0FBbkIsRUFBd0IsSUFBeEIsQ0FBWjtBQUNILEtBRkQsTUFFTztBQUNINEQsTUFBQUEsU0FBUyxHQUFHVyxPQUFPLENBQUNDLE9BQVIsRUFBWjtBQUNIOztBQUNELFNBQUszRSxjQUFMLENBQW9CRyxHQUFwQjtBQUNBLFdBQU80RCxTQUFQO0FBQ0g7O0FBdlo0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge2RpZmZBdENhcmV0LCBkaWZmRGVsZXRpb24sIElEaWZmfSBmcm9tIFwiLi9kaWZmXCI7XG5pbXBvcnQgRG9jdW1lbnRQb3NpdGlvbiwge0lQb3NpdGlvbn0gZnJvbSBcIi4vcG9zaXRpb25cIjtcbmltcG9ydCBSYW5nZSBmcm9tIFwiLi9yYW5nZVwiO1xuaW1wb3J0IHtTZXJpYWxpemVkUGFydCwgUGFydCwgUGFydENyZWF0b3J9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsLCB7SUNhbGxiYWNrfSBmcm9tIFwiLi9hdXRvY29tcGxldGVcIjtcbmltcG9ydCBEb2N1bWVudE9mZnNldCBmcm9tIFwiLi9vZmZzZXRcIjtcbmltcG9ydCB7Q2FyZXR9IGZyb20gXCIuL2NhcmV0XCI7XG5cbi8qKlxuICogQGNhbGxiYWNrIE1vZGVsQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RG9jdW1lbnRQb3NpdGlvbj99IGNhcmV0UG9zaXRpb24gdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBjYXJldCBzaG91bGQgYmUgcG9zaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gaW5wdXRUeXBlIHRoZSBpbnB1dFR5cGUgb2YgdGhlIERPTSBpbnB1dCBldmVudFxuICogQHBhcmFtIHtvYmplY3Q/fSBkaWZmIGFuIG9iamVjdCB3aXRoIGByZW1vdmVkYCBhbmQgYGFkZGVkYCBzdHJpbmdzXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgVHJhbnNmb3JtQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RG9jdW1lbnRQb3NpdGlvbj99IGNhcmV0UG9zaXRpb24gdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBjYXJldCBzaG91bGQgYmUgcG9zaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gaW5wdXRUeXBlIHRoZSBpbnB1dFR5cGUgb2YgdGhlIERPTSBpbnB1dCBldmVudFxuICogQHBhcmFtIHtvYmplY3Q/fSBkaWZmIGFuIG9iamVjdCB3aXRoIGByZW1vdmVkYCBhbmQgYGFkZGVkYCBzdHJpbmdzXG4gKiBAcmV0dXJuIHtOdW1iZXI/fSBhZGRlZExlbiBob3cgbWFueSBjaGFyYWN0ZXJzIHdlcmUgYWRkZWQvcmVtb3ZlZCAoLSkgYmVmb3JlIHRoZSBjYXJldCBkdXJpbmcgdGhlIHRyYW5zZm9ybWF0aW9uIHN0ZXAuXG4gKiAgICBUaGlzIGlzIHVzZWQgdG8gYWRqdXN0IHRoZSBjYXJldCBwb3NpdGlvbi5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBNYW51YWxUcmFuc2Zvcm1DYWxsYmFja1xuICogQHJldHVybiB0aGUgY2FyZXQgcG9zaXRpb25cbiAqL1xuXG50eXBlIFRyYW5zZm9ybUNhbGxiYWNrID0gKGNhcmV0UG9zaXRpb246IERvY3VtZW50UG9zaXRpb24sIGlucHV0VHlwZTogc3RyaW5nLCBkaWZmOiBJRGlmZikgPT4gbnVtYmVyIHwgdm9pZDtcbnR5cGUgVXBkYXRlQ2FsbGJhY2sgPSAoY2FyZXQ6IENhcmV0LCBpbnB1dFR5cGU/OiBzdHJpbmcsIGRpZmY/OiBJRGlmZikgPT4gdm9pZDtcbnR5cGUgTWFudWFsVHJhbnNmb3JtQ2FsbGJhY2sgPSAoKSA9PiBDYXJldDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yTW9kZWwge1xuICAgIHByaXZhdGUgX3BhcnRzOiBQYXJ0W107XG4gICAgcHJpdmF0ZSByZWFkb25seSBfcGFydENyZWF0b3I6IFBhcnRDcmVhdG9yO1xuICAgIHByaXZhdGUgYWN0aXZlUGFydElkeDogbnVtYmVyID0gbnVsbDtcbiAgICBwcml2YXRlIF9hdXRvQ29tcGxldGU6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBhdXRvQ29tcGxldGVQYXJ0SWR4OiBudW1iZXIgPSBudWxsO1xuICAgIHByaXZhdGUgYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMDtcbiAgICBwcml2YXRlIHRyYW5zZm9ybUNhbGxiYWNrOiBUcmFuc2Zvcm1DYWxsYmFjayA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihwYXJ0czogUGFydFtdLCBwYXJ0Q3JlYXRvcjogUGFydENyZWF0b3IsIHByaXZhdGUgdXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrID0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IHBhcnRzO1xuICAgICAgICB0aGlzLl9wYXJ0Q3JlYXRvciA9IHBhcnRDcmVhdG9yO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUNhbGxiYWNrID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBjYWxsYmFjayBmb3IgdGhlIHRyYW5zZm9ybWF0aW9uIHN0ZXAuXG4gICAgICogV2hpbGUgcHJvY2Vzc2luZyBhbiB1cGRhdGUsIHJpZ2h0IGJlZm9yZSBjYWxsaW5nIHRoZSB1cGRhdGUgY2FsbGJhY2ssXG4gICAgICogYSB0cmFuc2Zvcm0gY2FsbGJhY2sgY2FuIGJlIGNhbGxlZCwgd2hpY2ggc2VydmVzIHRvIGRvIG1vZGlmaWNhdGlvbnNcbiAgICAgKiBvbiB0aGUgbW9kZWwgdGhhdCBjYW4gc3BhbiBtdWx0aXBsZSBwYXJ0cy4gQWxzbyBzZWUgYHN0YXJ0UmFuZ2UoKWAuXG4gICAgICogQHBhcmFtIHtUcmFuc2Zvcm1DYWxsYmFja30gdHJhbnNmb3JtQ2FsbGJhY2tcbiAgICAgKi9cbiAgICBzZXRUcmFuc2Zvcm1DYWxsYmFjayh0cmFuc2Zvcm1DYWxsYmFjazogVHJhbnNmb3JtQ2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1DYWxsYmFjayA9IHRyYW5zZm9ybUNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGNhbGxiYWNrIGZvciByZXJlbmRlcmluZyB0aGUgbW9kZWwgYWZ0ZXIgaXQgaGFzIGJlZW4gdXBkYXRlZC5cbiAgICAgKiBAcGFyYW0ge01vZGVsQ2FsbGJhY2t9IHVwZGF0ZUNhbGxiYWNrXG4gICAgICovXG4gICAgc2V0VXBkYXRlQ2FsbGJhY2sodXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2sgPSB1cGRhdGVDYWxsYmFjaztcbiAgICB9XG5cbiAgICBnZXQgcGFydENyZWF0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0Q3JlYXRvcjtcbiAgICB9XG5cbiAgICBnZXQgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLnJlZHVjZSgobGVuLCBwYXJ0KSA9PiBsZW4gKyBwYXJ0LnRleHQubGVuZ3RoLCAwKSA9PT0gMDtcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFZGl0b3JNb2RlbCh0aGlzLl9wYXJ0cywgdGhpcy5fcGFydENyZWF0b3IsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5zZXJ0UGFydChpbmRleDogbnVtYmVyLCBwYXJ0OiBQYXJ0KSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnNwbGljZShpbmRleCwgMCwgcGFydCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhcnRJZHggPj0gaW5kZXgpIHtcbiAgICAgICAgICAgICsrdGhpcy5hY3RpdmVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPj0gaW5kZXgpIHtcbiAgICAgICAgICAgICsrdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVQYXJ0KGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSB0aGlzLmFjdGl2ZVBhcnRJZHgpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFydElkeCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3RpdmVQYXJ0SWR4ID4gaW5kZXgpIHtcbiAgICAgICAgICAgIC0tdGhpcy5hY3RpdmVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4KSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCA+IGluZGV4KSB7XG4gICAgICAgICAgICAtLXRoaXMuYXV0b0NvbXBsZXRlUGFydElkeDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVwbGFjZVBhcnQoaW5kZXg6IG51bWJlciwgcGFydDogUGFydCkge1xuICAgICAgICB0aGlzLl9wYXJ0cy5zcGxpY2UoaW5kZXgsIDEsIHBhcnQpO1xuICAgIH1cblxuICAgIGdldCBwYXJ0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzO1xuICAgIH1cblxuICAgIGdldCBhdXRvQ29tcGxldGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhcnRJZHggPT09IHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9Db21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbkF0RW5kKCkge1xuICAgICAgICBpZiAodGhpcy5fcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX3BhcnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEb2N1bWVudFBvc2l0aW9uKGluZGV4LCBwYXJ0LnRleHQubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHBhcnQgaW5kZXggLTEsIGFzIHRoZXJlIGFyZSBubyBwYXJ0cyB0byBwb2ludCBhdFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEb2N1bWVudFBvc2l0aW9uKC0xLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlcmlhbGl6ZVBhcnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHMubWFwKHAgPT4gcC5zZXJpYWxpemUoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaWZmKG5ld1ZhbHVlOiBzdHJpbmcsIGlucHV0VHlwZTogc3RyaW5nLCBjYXJldDogRG9jdW1lbnRPZmZzZXQpIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMucGFydHMucmVkdWNlKCh0ZXh0LCBwKSA9PiB0ZXh0ICsgcC50ZXh0LCBcIlwiKTtcbiAgICAgICAgLy8gY2FuJ3QgdXNlIGNhcmV0IHBvc2l0aW9uIHdpdGggZHJhZyBhbmQgZHJvcFxuICAgICAgICBpZiAoaW5wdXRUeXBlID09PSBcImRlbGV0ZUJ5RHJhZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gZGlmZkRlbGV0aW9uKHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkaWZmQXRDYXJldChwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSwgY2FyZXQub2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0KHNlcmlhbGl6ZWRQYXJ0czogU2VyaWFsaXplZFBhcnRbXSwgY2FyZXQ/OiBDYXJldCwgaW5wdXRUeXBlPzogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzID0gc2VyaWFsaXplZFBhcnRzLm1hcChwID0+IHRoaXMuX3BhcnRDcmVhdG9yLmRlc2VyaWFsaXplUGFydChwKSk7XG4gICAgICAgIGlmICghY2FyZXQpIHtcbiAgICAgICAgICAgIGNhcmV0ID0gdGhpcy5nZXRQb3NpdGlvbkF0RW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xvc2UgYXV0byBjb21wbGV0ZSBpZiBvcGVuXG4gICAgICAgIC8vIHRoaXMgd291bGQgaGFwcGVuIHdoZW4gY2xlYXJpbmcgdGhlIGNvbXBvc2VyIGFmdGVyIHNlbmRpbmdcbiAgICAgICAgLy8gYSBtZXNzYWdlIHdpdGggdGhlIGF1dG9jb21wbGV0ZSBzdGlsbCBvcGVuXG4gICAgICAgIGlmICh0aGlzLl9hdXRvQ29tcGxldGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2F1dG9Db21wbGV0ZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soY2FyZXQsIGlucHV0VHlwZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgZ2l2ZW4gcGFydHMgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLlxuICAgICAqIFNob3VsZCBiZSBydW4gaW5zaWRlIGEgYG1vZGVsLnRyYW5zZm9ybSgpYCBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge1BhcnRbXX0gcGFydHMgdGhlIHBhcnRzIHRvIHJlcGxhY2UgdGhlIHJhbmdlIHdpdGhcbiAgICAgKiBAcGFyYW0ge0RvY3VtZW50UG9zaXRpb259IHBvc2l0aW9uIHRoZSBwb3NpdGlvbiB0byBzdGFydCBpbnNlcnRpbmcgYXRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBhbW91bnQgb2YgY2hhcmFjdGVycyBhZGRlZFxuICAgICAqL1xuICAgIGluc2VydChwYXJ0czogUGFydFtdLCBwb3NpdGlvbjogSVBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGluc2VydEluZGV4ID0gdGhpcy5zcGxpdEF0KHBvc2l0aW9uKTtcbiAgICAgICAgbGV0IG5ld1RleHRMZW5ndGggPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgICAgICBuZXdUZXh0TGVuZ3RoICs9IHBhcnQudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmluc2VydFBhcnQoaW5zZXJ0SW5kZXggKyBpLCBwYXJ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3VGV4dExlbmd0aDtcbiAgICB9XG5cbiAgICB1cGRhdGUobmV3VmFsdWU6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcsIGNhcmV0OiBEb2N1bWVudE9mZnNldCkge1xuICAgICAgICBjb25zdCBkaWZmID0gdGhpcy5kaWZmKG5ld1ZhbHVlLCBpbnB1dFR5cGUsIGNhcmV0KTtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uRm9yT2Zmc2V0KGRpZmYuYXQsIGNhcmV0LmF0Tm9kZUVuZCk7XG4gICAgICAgIGxldCByZW1vdmVkT2Zmc2V0RGVjcmVhc2UgPSAwO1xuICAgICAgICBpZiAoZGlmZi5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZW1vdmVkT2Zmc2V0RGVjcmVhc2UgPSB0aGlzLnJlbW92ZVRleHQocG9zaXRpb24sIGRpZmYucmVtb3ZlZC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBhZGRlZExlbiA9IDA7XG4gICAgICAgIGlmIChkaWZmLmFkZGVkKSB7XG4gICAgICAgICAgICBhZGRlZExlbiA9IHRoaXMuYWRkVGV4dChwb3NpdGlvbiwgZGlmZi5hZGRlZCwgaW5wdXRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lcmdlQWRqYWNlbnRQYXJ0cygpO1xuICAgICAgICBjb25zdCBjYXJldE9mZnNldCA9IGRpZmYuYXQgLSByZW1vdmVkT2Zmc2V0RGVjcmVhc2UgKyBhZGRlZExlbjtcbiAgICAgICAgbGV0IG5ld1Bvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkZvck9mZnNldChjYXJldE9mZnNldCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGNhbk9wZW5BdXRvQ29tcGxldGUgPSBpbnB1dFR5cGUgIT09IFwiaW5zZXJ0RnJvbVBhc3RlXCIgJiYgaW5wdXRUeXBlICE9PSBcImluc2VydEZyb21Ecm9wXCI7XG4gICAgICAgIGNvbnN0IGFjUHJvbWlzZSA9IHRoaXMuc2V0QWN0aXZlUGFydChuZXdQb3NpdGlvbiwgY2FuT3BlbkF1dG9Db21wbGV0ZSk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zZm9ybUNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1BZGRlZExlbiA9IHRoaXMuZ2V0VHJhbnNmb3JtQWRkZWRMZW4obmV3UG9zaXRpb24sIGlucHV0VHlwZSwgZGlmZik7XG4gICAgICAgICAgICBuZXdQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXRPZmZzZXQgKyB0cmFuc2Zvcm1BZGRlZExlbiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayhuZXdQb3NpdGlvbiwgaW5wdXRUeXBlLCBkaWZmKTtcbiAgICAgICAgcmV0dXJuIGFjUHJvbWlzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFRyYW5zZm9ybUFkZGVkTGVuKG5ld1Bvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uLCBpbnB1dFR5cGU6IHN0cmluZywgZGlmZjogSURpZmYpOiBudW1iZXIge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnRyYW5zZm9ybUNhbGxiYWNrKG5ld1Bvc2l0aW9uLCBpbnB1dFR5cGUsIGRpZmYpO1xuICAgICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgYXMgbnVtYmVyIDogMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEFjdGl2ZVBhcnQocG9zOiBEb2N1bWVudFBvc2l0aW9uLCBjYW5PcGVuQXV0b0NvbXBsZXRlOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHtpbmRleH0gPSBwb3M7XG4gICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLl9wYXJ0c1tpbmRleF07XG4gICAgICAgIGlmIChwYXJ0KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IHRoaXMuYWN0aXZlUGFydElkeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFydElkeCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIGlmIChjYW5PcGVuQXV0b0NvbXBsZXRlICYmIHRoaXMuYWN0aXZlUGFydElkeCAhPT0gdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgdHJ5IHRvIGNyZWF0ZSBvbmVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWMgPSBwYXJ0LmNyZWF0ZUF1dG9Db21wbGV0ZSh0aGlzLm9uQXV0b0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCByZWFjdCBwaWNrcyB1cCB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGJvdGggYWNzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRvQ29tcGxldGUgPSBhYztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0Q291bnQgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gbm90IF9hdXRvQ29tcGxldGUsIG9ubHkgdGhlcmUgaWYgYWN0aXZlIHBhcnQgaXMgYXV0b2NvbXBsZXRlIHBhcnRcbiAgICAgICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF1dG9Db21wbGV0ZS5vblBhcnRVcGRhdGUocGFydCwgcG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFydElkeCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9hdXRvQ29tcGxldGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkF1dG9Db21wbGV0ZSA9ICh7cmVwbGFjZVBhcnRzLCBjbG9zZX06IElDYWxsYmFjaykgPT4ge1xuICAgICAgICBsZXQgcG9zO1xuICAgICAgICBpZiAocmVwbGFjZVBhcnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJ0cy5zcGxpY2UodGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4LCB0aGlzLmF1dG9Db21wbGV0ZVBhcnRDb3VudCwgLi4ucmVwbGFjZVBhcnRzKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50ID0gcmVwbGFjZVBhcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RQYXJ0ID0gcmVwbGFjZVBhcnRzW3JlcGxhY2VQYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RQYXJ0SW5kZXggPSB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggKyByZXBsYWNlUGFydHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHBvcyA9IG5ldyBEb2N1bWVudFBvc2l0aW9uKGxhc3RQYXJ0SW5kZXgsIGxhc3RQYXJ0LnRleHQubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2F1dG9Db21wbGV0ZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0Q291bnQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlcmVuZGVyIGV2ZW4gaWYgZWRpdG9yIGNvbnRlbnRzIGRpZG4ndCBjaGFuZ2VcbiAgICAgICAgLy8gdG8gbWFrZSBzdXJlIHRoZSBNZXNzYWdlRWRpdG9yIGNoZWNrc1xuICAgICAgICAvLyBtb2RlbC5hdXRvQ29tcGxldGUgYmVpbmcgZW1wdHkgYW5kIGNsb3NlcyBpdFxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHBvcyk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgbWVyZ2VBZGphY2VudFBhcnRzKCkge1xuICAgICAgICBsZXQgcHJldlBhcnQ7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fcGFydHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBwYXJ0ID0gdGhpcy5fcGFydHNbaV07XG4gICAgICAgICAgICBjb25zdCBpc0VtcHR5ID0gIXBhcnQudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBpc01lcmdlZCA9ICFpc0VtcHR5ICYmIHByZXZQYXJ0ICYmIHByZXZQYXJ0Lm1lcmdlKHBhcnQpO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHkgfHwgaXNNZXJnZWQpIHtcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgZW1wdHkgb3IgbWVyZ2VkIHBhcnRcbiAgICAgICAgICAgICAgICBwYXJ0ID0gcHJldlBhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0KGkpO1xuICAgICAgICAgICAgICAgIC8vcmVwZWF0IHRoaXMgaW5kZXgsIGFzIGl0J3MgcmVtb3ZlZCBub3dcbiAgICAgICAgICAgICAgICAtLWk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2UGFydCA9IHBhcnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZW1vdmVzIGBsZW5gIGFtb3VudCBvZiBjaGFyYWN0ZXJzIGF0IGBwb3NgLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb3NcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBjaGFyYWN0ZXJzIGJlZm9yZSBwb3Mgd2VyZSBhbHNvIHJlbW92ZWQsXG4gICAgICogdXN1YWxseSBiZWNhdXNlIG9mIG5vbi1lZGl0YWJsZSBwYXJ0cyB0aGF0IGNhbiBvbmx5IGJlIHJlbW92ZWQgaW4gdGhlaXIgZW50aXJldHkuXG4gICAgICovXG4gICAgcmVtb3ZlVGV4dChwb3M6IElQb3NpdGlvbiwgbGVuOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IHtpbmRleCwgb2Zmc2V0fSA9IHBvcztcbiAgICAgICAgbGV0IHJlbW92ZWRPZmZzZXREZWNyZWFzZSA9IDA7XG4gICAgICAgIHdoaWxlIChsZW4gPiAwKSB7XG4gICAgICAgICAgICAvLyBwYXJ0IG1pZ2h0IGJlIHVuZGVmaW5lZCBoZXJlXG4gICAgICAgICAgICBsZXQgcGFydCA9IHRoaXMuX3BhcnRzW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGFtb3VudCA9IE1hdGgubWluKGxlbiwgcGFydC50ZXh0Lmxlbmd0aCAtIG9mZnNldCk7XG4gICAgICAgICAgICAvLyBkb24ndCBhbGxvdyAwIGFtb3VudCBkZWxldGlvbnNcbiAgICAgICAgICAgIGlmIChhbW91bnQpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFydC5jYW5FZGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VXaXRoID0gcGFydC5yZW1vdmUob2Zmc2V0LCBhbW91bnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VXaXRoID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2VQYXJ0KGluZGV4LCB0aGlzLl9wYXJ0Q3JlYXRvci5jcmVhdGVEZWZhdWx0UGFydChyZXBsYWNlV2l0aCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSB0aGlzLl9wYXJ0c1tpbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBlbXB0eSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFydC50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0KGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVkT2Zmc2V0RGVjcmVhc2UgKz0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnQoaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxlbiAtPSBhbW91bnQ7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZW1vdmVkT2Zmc2V0RGVjcmVhc2U7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIHBhcnQgaW5kZXggd2hlcmUgaW5zZXJ0aW9uIHdpbGwgaW5zZXJ0IGJldHdlZW4gYXQgb2Zmc2V0XG4gICAgcHJpdmF0ZSBzcGxpdEF0KHBvczogSVBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChwb3MuaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zLm9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBvcy5pbmRleDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbcG9zLmluZGV4XTtcbiAgICAgICAgaWYgKHBvcy5vZmZzZXQgPj0gcGFydC50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBvcy5pbmRleCArIDE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWNvbmRQYXJ0ID0gcGFydC5zcGxpdChwb3Mub2Zmc2V0KTtcbiAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KHBvcy5pbmRleCArIDEsIHNlY29uZFBhcnQpO1xuICAgICAgICByZXR1cm4gcG9zLmluZGV4ICsgMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbnNlcnRzIGBzdHJgIGludG8gdGhlIG1vZGVsIGF0IGBwb3NgLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0VHlwZSB0aGUgc291cmNlIG9mIHRoZSBpbnB1dCwgc2VlIGh0bWwgSW5wdXRFdmVudC5pbnB1dFR5cGVcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IG9wdGlvbnMudmFsaWRhdGUgV2hldGhlciBjaGFyYWN0ZXJzIHdpbGwgYmUgdmFsaWRhdGVkIGJ5IHRoZSBwYXJ0LlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWYWxpZGF0aW5nIGFsbG93cyB0aGUgaW5zZXJ0ZWQgdGV4dCB0byBiZSBwYXJzZWQgYWNjb3JkaW5nIHRvIHRoZSBwYXJ0IHJ1bGVzLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IGZhciBmcm9tIHBvc2l0aW9uIChpbiBjaGFyYWN0ZXJzKSB0aGUgaW5zZXJ0aW9uIGVuZGVkLlxuICAgICAqIFRoaXMgY2FuIGJlIG1vcmUgdGhhbiB0aGUgbGVuZ3RoIG9mIGBzdHJgIHdoZW4gY3Jvc3Npbmcgbm9uLWVkaXRhYmxlIHBhcnRzLCB3aGljaCBhcmUgc2tpcHBlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZFRleHQocG9zOiBJUG9zaXRpb24sIHN0cjogc3RyaW5nLCBpbnB1dFR5cGU6IHN0cmluZykge1xuICAgICAgICBsZXQge2luZGV4fSA9IHBvcztcbiAgICAgICAgY29uc3Qge29mZnNldH0gPSBwb3M7XG4gICAgICAgIGxldCBhZGRMZW4gPSBzdHIubGVuZ3RoO1xuICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICBpZiAocGFydCkge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2FuRWRpdCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0LnZhbGlkYXRlQW5kSW5zZXJ0KG9mZnNldCwgc3RyLCBpbnB1dFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BsaXRQYXJ0ID0gcGFydC5zcGxpdChvZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydFBhcnQoaW5kZXgsIHNwbGl0UGFydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBub3QtZWRpdGFibGUgcGFydCwgY2FyZXQgaXMgbm90IGF0IHN0YXJ0LFxuICAgICAgICAgICAgICAgIC8vIHNvIGluc2VydCBzdHIgYWZ0ZXIgdGhpcyBwYXJ0XG4gICAgICAgICAgICAgICAgYWRkTGVuICs9IHBhcnQudGV4dC5sZW5ndGggLSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgICAgIC8vIGlmIHBvc2l0aW9uIHdhcyBub3QgZm91bmQgKGluZGV4OiAtMSwgYXMgaGFwcGVucyBmb3IgZW1wdHkgZWRpdG9yKVxuICAgICAgICAgICAgLy8gcmVzZXQgaXQgdG8gaW5zZXJ0IGFzIGZpcnN0IHBhcnRcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoc3RyKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdQYXJ0ID0gdGhpcy5fcGFydENyZWF0b3IuY3JlYXRlUGFydEZvcklucHV0KHN0ciwgaW5kZXgsIGlucHV0VHlwZSk7XG4gICAgICAgICAgICBzdHIgPSBuZXdQYXJ0LmFwcGVuZFVudGlsUmVqZWN0ZWQoc3RyLCBpbnB1dFR5cGUpO1xuICAgICAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KGluZGV4LCBuZXdQYXJ0KTtcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkZExlbjtcbiAgICB9XG5cbiAgICBwb3NpdGlvbkZvck9mZnNldCh0b3RhbE9mZnNldDogbnVtYmVyLCBhdFBhcnRFbmQ6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IGN1cnJlbnRPZmZzZXQgPSAwO1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX3BhcnRzLmZpbmRJbmRleChwYXJ0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRMZW4gPSBwYXJ0LnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIChhdFBhcnRFbmQgJiYgKGN1cnJlbnRPZmZzZXQgKyBwYXJ0TGVuKSA+PSB0b3RhbE9mZnNldCkgfHxcbiAgICAgICAgICAgICAgICAoIWF0UGFydEVuZCAmJiAoY3VycmVudE9mZnNldCArIHBhcnRMZW4pID4gdG90YWxPZmZzZXQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnRPZmZzZXQgKz0gcGFydExlbjtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFBvc2l0aW9uQXRFbmQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnRQb3NpdGlvbihpbmRleCwgdG90YWxPZmZzZXQgLSBjdXJyZW50T2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIHJhbmdlLCB3aGljaCBjYW4gc3BhbiBhY3Jvc3MgbXVsdGlwbGUgcGFydHMsIHRvIGZpbmQgYW5kIHJlcGxhY2UgdGV4dC5cbiAgICAgKiBAcGFyYW0ge0RvY3VtZW50UG9zaXRpb259IHBvc2l0aW9uQSBhIGJvdW5kYXJ5IG9mIHRoZSByYW5nZVxuICAgICAqIEBwYXJhbSB7RG9jdW1lbnRQb3NpdGlvbj99IHBvc2l0aW9uQiB0aGUgb3RoZXIgYm91bmRhcnkgb2YgdGhlIHJhbmdlLCBvcHRpb25hbFxuICAgICAqIEByZXR1cm4ge1JhbmdlfVxuICAgICAqL1xuICAgIHN0YXJ0UmFuZ2UocG9zaXRpb25BOiBEb2N1bWVudFBvc2l0aW9uLCBwb3NpdGlvbkIgPSBwb3NpdGlvbkEpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZSh0aGlzLCBwb3NpdGlvbkEsIHBvc2l0aW9uQik7XG4gICAgfVxuXG4gICAgcmVwbGFjZVJhbmdlKHN0YXJ0UG9zaXRpb246IERvY3VtZW50UG9zaXRpb24sIGVuZFBvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uLCBwYXJ0czogUGFydFtdKSB7XG4gICAgICAgIC8vIGNvbnZlcnQgZW5kIHBvc2l0aW9uIHRvIG9mZnNldCwgc28gaXQgaXMgaW5kZXBlbmRlbnQgb2YgaG93IHRoZSBkb2N1bWVudCBpcyBzcGxpdCBpbnRvIHBhcnRzXG4gICAgICAgIC8vIHdoaWNoIHdlJ2xsIGNoYW5nZSB3aGVuIHNwbGl0dGluZyB1cCBhdCB0aGUgc3RhcnQgcG9zaXRpb25cbiAgICAgICAgY29uc3QgZW5kT2Zmc2V0ID0gZW5kUG9zaXRpb24uYXNPZmZzZXQodGhpcyk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXJ0UGFydEluZGV4ID0gdGhpcy5zcGxpdEF0KHN0YXJ0UG9zaXRpb24pO1xuICAgICAgICAvLyBjb252ZXJ0IGl0IGJhY2sgdG8gcG9zaXRpb24gb25jZSBzcGxpdCBhdCBzdGFydFxuICAgICAgICBlbmRQb3NpdGlvbiA9IGVuZE9mZnNldC5hc1Bvc2l0aW9uKHRoaXMpO1xuICAgICAgICBjb25zdCBuZXdFbmRQYXJ0SW5kZXggPSB0aGlzLnNwbGl0QXQoZW5kUG9zaXRpb24pO1xuICAgICAgICBmb3IgKGxldCBpID0gbmV3RW5kUGFydEluZGV4IC0gMTsgaSA+PSBuZXdTdGFydFBhcnRJbmRleDsgLS1pKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluc2VydElkeCA9IG5ld1N0YXJ0UGFydEluZGV4O1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFydChpbnNlcnRJZHgsIHBhcnQpO1xuICAgICAgICAgICAgaW5zZXJ0SWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZXJnZUFkamFjZW50UGFydHMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhIHRyYW5zZm9ybWF0aW9uIG5vdCBwYXJ0IG9mIGFuIHVwZGF0ZSBjeWNsZS5cbiAgICAgKiBNb2RpZnlpbmcgdGhlIG1vZGVsIHNob3VsZCBvbmx5IGhhcHBlbiBpbnNpZGUgYSB0cmFuc2Zvcm0gY2FsbCBpZiBub3QgcGFydCBvZiBhbiB1cGRhdGUgY2FsbC5cbiAgICAgKiBAcGFyYW0ge01hbnVhbFRyYW5zZm9ybUNhbGxiYWNrfSBjYWxsYmFjayB0byBydW4gdGhlIHRyYW5zZm9ybWF0aW9ucyBpblxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB3aGVuIGF1dG8tY29tcGxldGUgKGlmIGFwcGxpY2FibGUpIGlzIGRvbmUgdXBkYXRpbmdcbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0oY2FsbGJhY2s6IE1hbnVhbFRyYW5zZm9ybUNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IGNhbGxiYWNrKCk7XG4gICAgICAgIGxldCBhY1Byb21pc2UgPSBudWxsO1xuICAgICAgICBpZiAoIShwb3MgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICAgICAgICAgIGFjUHJvbWlzZSA9IHRoaXMuc2V0QWN0aXZlUGFydChwb3MsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWNQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayhwb3MpO1xuICAgICAgICByZXR1cm4gYWNQcm9taXNlO1xuICAgIH1cbn1cbiJdfQ==