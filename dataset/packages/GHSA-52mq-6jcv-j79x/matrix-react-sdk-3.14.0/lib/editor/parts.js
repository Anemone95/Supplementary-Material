"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAutoCompleteCreator = getAutoCompleteCreator;
exports.CommandPartCreator = exports.PartCreator = exports.PlainPart = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _autocomplete = _interopRequireDefault(require("./autocomplete"));

var Avatar = _interopRequireWildcard(require("../Avatar"));

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
var Type;

(function (Type) {
  Type["Plain"] = "plain";
  Type["Newline"] = "newline";
  Type["Command"] = "command";
  Type["UserPill"] = "user-pill";
  Type["RoomPill"] = "room-pill";
  Type["AtRoomPill"] = "at-room-pill";
  Type["PillCandidate"] = "pill-candidate";
})(Type || (Type = {}));
/*:: export type Part = IBasePart | IPillCandidatePart | IPillPart;*/


class BasePart {
  constructor(text = "") {
    (0, _defineProperty2.default)(this, "_text", void 0);
    this._text = text;
  }

  acceptsInsertion(chr
  /*: string*/
  , offset
  /*: number*/
  , inputType
  /*: string*/
  ) {
    return true;
  }

  acceptsRemoval(position
  /*: number*/
  , chr
  /*: string*/
  ) {
    return true;
  }

  merge(part
  /*: Part*/
  ) {
    return false;
  }

  split(offset
  /*: number*/
  ) {
    const splitText = this.text.substr(offset);
    this._text = this.text.substr(0, offset);
    return new PlainPart(splitText);
  } // removes len chars, or returns the plain text this part should be replaced with
  // if the part would become invalid if it removed everything.


  remove(offset
  /*: number*/
  , len
  /*: number*/
  ) {
    // validate
    const strWithRemoval = this.text.substr(0, offset) + this.text.substr(offset + len);

    for (let i = offset; i < len + offset; ++i) {
      const chr = this.text.charAt(i);

      if (!this.acceptsRemoval(i, chr)) {
        return strWithRemoval;
      }
    }

    this._text = strWithRemoval;
  } // append str, returns the remaining string if a character was rejected.


  appendUntilRejected(str
  /*: string*/
  , inputType
  /*: string*/
  ) {
    const offset = this.text.length;

    for (let i = 0; i < str.length; ++i) {
      const chr = str.charAt(i);

      if (!this.acceptsInsertion(chr, offset + i, inputType)) {
        this._text = this._text + str.substr(0, i);
        return str.substr(i);
      }
    }

    this._text = this._text + str;
  } // inserts str at offset if all the characters in str were accepted, otherwise don't do anything
  // return whether the str was accepted or not.


  validateAndInsert(offset
  /*: number*/
  , str
  /*: string*/
  , inputType
  /*: string*/
  ) {
    for (let i = 0; i < str.length; ++i) {
      const chr = str.charAt(i);

      if (!this.acceptsInsertion(chr, offset + i, inputType)) {
        return false;
      }
    }

    const beforeInsert = this._text.substr(0, offset);

    const afterInsert = this._text.substr(offset);

    this._text = beforeInsert + str + afterInsert;
    return true;
  }

  createAutoComplete(updateCallback
  /*: UpdateCallback*/
  )
  /*: void*/
  {}

  trim(len
  /*: number*/
  ) {
    const remaining = this._text.substr(len);

    this._text = this._text.substr(0, len);
    return remaining;
  }

  get text() {
    return this._text;
  }

  get canEdit() {
    return true;
  }

  toString() {
    return `${this.type}(${this.text})`;
  }

  serialize()
  /*: SerializedPart*/
  {
    return {
      type: this.type,
      text: this.text
    };
  }

}

class PlainBasePart extends BasePart {
  acceptsInsertion(chr
  /*: string*/
  , offset
  /*: number*/
  , inputType
  /*: string*/
  ) {
    if (chr === "\n") {
      return false;
    } // when not pasting or dropping text, reject characters that should start a pill candidate


    if (inputType !== "insertFromPaste" && inputType !== "insertFromDrop") {
      if (chr !== "@" && chr !== "#" && chr !== ":" && chr !== "+") {
        return true;
      } // only split if the previous character is a space
      // or if it is a + and this is a :


      return this._text[offset - 1] !== " " && (this._text[offset - 1] !== "+" || chr !== ":");
    }

    return true;
  }

  toDOMNode() {
    return document.createTextNode(this.text);
  }

  merge(part) {
    if (part.type === this.type) {
      this._text = this.text + part.text;
      return true;
    }

    return false;
  }

  updateDOMNode(node
  /*: Node*/
  ) {
    if (node.textContent !== this.text) {
      node.textContent = this.text;
    }
  }

  canUpdateDOMNode(node
  /*: Node*/
  ) {
    return node.nodeType === Node.TEXT_NODE;
  }

} // exported for unit tests, should otherwise only be used through PartCreator


class PlainPart extends PlainBasePart
/*:: implements IBasePart*/
{
  get type()
  /*: IBasePart["type"]*/
  {
    return Type.Plain;
  }

}

exports.PlainPart = PlainPart;

class PillPart extends BasePart
/*:: implements IPillPart*/
{
  constructor(resourceId
  /*: string*/
  , label) {
    super(label);
    this.resourceId
    /*:: */
    = resourceId
    /*:: */
    ;
  }

  acceptsInsertion(chr
  /*: string*/
  ) {
    return chr !== " ";
  }

  acceptsRemoval(position
  /*: number*/
  , chr
  /*: string*/
  ) {
    return position !== 0; //if you remove initial # or @, pill should become plain
  }

  toDOMNode() {
    const container = document.createElement("span");
    container.setAttribute("spellcheck", "false");
    container.className = this.className;
    container.appendChild(document.createTextNode(this.text));
    this.setAvatar(container);
    return container;
  }

  updateDOMNode(node
  /*: HTMLElement*/
  ) {
    const textNode = node.childNodes[0];

    if (textNode.textContent !== this.text) {
      textNode.textContent = this.text;
    }

    if (node.className !== this.className) {
      node.className = this.className;
    }

    this.setAvatar(node);
  }

  canUpdateDOMNode(node
  /*: HTMLElement*/
  ) {
    return node.nodeType === Node.ELEMENT_NODE && node.nodeName === "SPAN" && node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;
  } // helper method for subclasses


  _setAvatarVars(node
  /*: HTMLElement*/
  , avatarUrl
  /*: string*/
  , initialLetter
  /*: string*/
  ) {
    const avatarBackground = `url('${avatarUrl}')`;
    const avatarLetter = `'${initialLetter}'`; // check if the value is changing,
    // otherwise the avatars flicker on every keystroke while updating.

    if (node.style.getPropertyValue("--avatar-background") !== avatarBackground) {
      node.style.setProperty("--avatar-background", avatarBackground);
    }

    if (node.style.getPropertyValue("--avatar-letter") !== avatarLetter) {
      node.style.setProperty("--avatar-letter", avatarLetter);
    }
  }

  get canEdit() {
    return false;
  }

}

class NewlinePart extends BasePart
/*:: implements IBasePart*/
{
  acceptsInsertion(chr
  /*: string*/
  , offset
  /*: number*/
  ) {
    return offset === 0 && chr === "\n";
  }

  acceptsRemoval(position
  /*: number*/
  , chr
  /*: string*/
  ) {
    return true;
  }

  toDOMNode() {
    return document.createElement("br");
  }

  merge() {
    return false;
  }

  updateDOMNode() {}

  canUpdateDOMNode(node
  /*: HTMLElement*/
  ) {
    return node.tagName === "BR";
  }

  get type()
  /*: IBasePart["type"]*/
  {
    return Type.Newline;
  } // this makes the cursor skip this part when it is inserted
  // rather than trying to append to it, which is what we want.
  // As a newline can also be only one character, it makes sense
  // as it can only be one character long. This caused #9741.


  get canEdit() {
    return false;
  }

}

class RoomPillPart extends PillPart {
  constructor(displayAlias, room
  /*: Room*/
  ) {
    super(displayAlias, displayAlias);
    this.room
    /*:: */
    = room
    /*:: */
    ;
  }

  setAvatar(node
  /*: HTMLElement*/
  ) {
    let initialLetter = "";
    let avatarUrl = Avatar.avatarUrlForRoom(this.room, 16 * window.devicePixelRatio, 16 * window.devicePixelRatio, "crop");

    if (!avatarUrl) {
      initialLetter = Avatar.getInitialLetter(this.room ? this.room.name : this.resourceId);
      avatarUrl = Avatar.defaultAvatarUrlForString(this.room ? this.room.roomId : this.resourceId);
    }

    this._setAvatarVars(node, avatarUrl, initialLetter);
  }

  get type()
  /*: IPillPart["type"]*/
  {
    return Type.RoomPill;
  }

  get className() {
    return "mx_RoomPill mx_Pill";
  }

}

class AtRoomPillPart extends RoomPillPart {
  get type()
  /*: IPillPart["type"]*/
  {
    return Type.AtRoomPill;
  }

}

class UserPillPart extends PillPart {
  constructor(userId, displayName, member
  /*: RoomMember*/
  ) {
    super(userId, displayName);
    this.member
    /*:: */
    = member
    /*:: */
    ;
  }

  setAvatar(node
  /*: HTMLElement*/
  ) {
    if (!this.member) {
      return;
    }

    const name = this.member.name || this.member.userId;
    const defaultAvatarUrl = Avatar.defaultAvatarUrlForString(this.member.userId);
    const avatarUrl = Avatar.avatarUrlForMember(this.member, 16 * window.devicePixelRatio, 16 * window.devicePixelRatio, "crop");
    let initialLetter = "";

    if (avatarUrl === defaultAvatarUrl) {
      initialLetter = Avatar.getInitialLetter(name);
    }

    this._setAvatarVars(node, avatarUrl, initialLetter);
  }

  get type()
  /*: IPillPart["type"]*/
  {
    return Type.UserPill;
  }

  get className() {
    return "mx_UserPill mx_Pill";
  }

  serialize()
  /*: ISerializedPillPart*/
  {
    return {
      type: this.type,
      text: this.text,
      resourceId: this.resourceId
    };
  }

}

class PillCandidatePart extends PlainBasePart
/*:: implements IPillCandidatePart*/
{
  constructor(text
  /*: string*/
  , autoCompleteCreator
  /*: IAutocompleteCreator*/
  ) {
    super(text);
    this.autoCompleteCreator
    /*:: */
    = autoCompleteCreator
    /*:: */
    ;
  }

  createAutoComplete(updateCallback
  /*: UpdateCallback*/
  )
  /*: AutocompleteWrapperModel*/
  {
    return this.autoCompleteCreator.create(updateCallback);
  }

  acceptsInsertion(chr
  /*: string*/
  , offset
  /*: number*/
  , inputType
  /*: string*/
  ) {
    if (offset === 0) {
      return true;
    } else {
      return super.acceptsInsertion(chr, offset, inputType);
    }
  }

  merge() {
    return false;
  }

  acceptsRemoval(position
  /*: number*/
  , chr
  /*: string*/
  ) {
    return true;
  }

  get type()
  /*: IPillCandidatePart["type"]*/
  {
    return Type.PillCandidate;
  }

}

function getAutoCompleteCreator(getAutocompleterComponent
/*: GetAutocompleterComponent*/
, updateQuery
/*: UpdateQuery*/
) {
  return (partCreator
  /*: PartCreator*/
  ) => {
    return (updateCallback
    /*: UpdateCallback*/
    ) => {
      return new _autocomplete.default(updateCallback, getAutocompleterComponent, updateQuery, partCreator);
    };
  };
}

class PartCreator {
  constructor(room
  /*: Room*/
  , client
  /*: MatrixClient*/
  , autoCompleteCreator
  /*: AutoCompleteCreator*/
  = null) {
    this.room
    /*:: */
    = room
    /*:: */
    ;
    this.client
    /*:: */
    = client
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "autoCompleteCreator", void 0);
    // pre-create the creator as an object even without callback so it can already be passed
    // to PillCandidatePart (e.g. while deserializing) and set later on
    this.autoCompleteCreator = {
      create: autoCompleteCreator && autoCompleteCreator(this)
    };
  }

  setAutoCompleteCreator(autoCompleteCreator
  /*: AutoCompleteCreator*/
  ) {
    this.autoCompleteCreator.create = autoCompleteCreator(this);
  }

  createPartForInput(input
  /*: string*/
  , partIndex
  /*: number*/
  , inputType
  /*: string*/
  )
  /*: Part*/
  {
    switch (input[0]) {
      case "#":
      case "@":
      case ":":
      case "+":
        return this.pillCandidate("");

      case "\n":
        return new NewlinePart();

      default:
        return new PlainPart();
    }
  }

  createDefaultPart(text
  /*: string*/
  ) {
    return this.plain(text);
  }

  deserializePart(part
  /*: SerializedPart*/
  )
  /*: Part*/
  {
    switch (part.type) {
      case Type.Plain:
        return this.plain(part.text);

      case Type.Newline:
        return this.newline();

      case Type.AtRoomPill:
        return this.atRoomPill(part.text);

      case Type.PillCandidate:
        return this.pillCandidate(part.text);

      case Type.RoomPill:
        return this.roomPill(part.text);

      case Type.UserPill:
        return this.userPill(part.text, part.resourceId);
    }
  }

  plain(text
  /*: string*/
  ) {
    return new PlainPart(text);
  }

  newline() {
    return new NewlinePart("\n");
  }

  pillCandidate(text
  /*: string*/
  ) {
    return new PillCandidatePart(text, this.autoCompleteCreator);
  }

  roomPill(alias
  /*: string*/
  , roomId
  /*: string*/
  ) {
    let room;

    if (roomId || alias[0] !== "#") {
      room = this.client.getRoom(roomId || alias);
    } else {
      room = this.client.getRooms().find(r => {
        return r.getCanonicalAlias() === alias || r.getAltAliases().includes(alias);
      });
    }

    return new RoomPillPart(alias, room);
  }

  atRoomPill(text
  /*: string*/
  ) {
    return new AtRoomPillPart(text, this.room);
  }

  userPill(displayName
  /*: string*/
  , userId
  /*: string*/
  ) {
    const member = this.room.getMember(userId);
    return new UserPillPart(userId, displayName, member);
  }

  createMentionParts(partIndex
  /*: number*/
  , displayName
  /*: string*/
  , userId
  /*: string*/
  ) {
    const pill = this.userPill(displayName, userId);
    const postfix = this.plain(partIndex === 0 ? ": " : " ");
    return [pill, postfix];
  }

} // part creator that support auto complete for /commands,
// used in SendMessageComposer


exports.PartCreator = PartCreator;

class CommandPartCreator extends PartCreator {
  createPartForInput(text
  /*: string*/
  , partIndex
  /*: number*/
  ) {
    // at beginning and starts with /? create
    if (partIndex === 0 && text[0] === "/") {
      // text will be inserted by model, so pass empty string
      return this.command("");
    } else {
      return super.createPartForInput(text, partIndex);
    }
  }

  command(text
  /*: string*/
  ) {
    return new CommandPart(text, this.autoCompleteCreator);
  }

  deserializePart(part
  /*: Part*/
  )
  /*: Part*/
  {
    if (part.type === "command") {
      return this.command(part.text);
    } else {
      return super.deserializePart(part);
    }
  }

}

exports.CommandPartCreator = CommandPartCreator;

class CommandPart extends PillCandidatePart {
  get type()
  /*: IPillCandidatePart["type"]*/
  {
    return Type.Command;
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvcGFydHMudHMiXSwibmFtZXMiOlsiVHlwZSIsIkJhc2VQYXJ0IiwiY29uc3RydWN0b3IiLCJ0ZXh0IiwiX3RleHQiLCJhY2NlcHRzSW5zZXJ0aW9uIiwiY2hyIiwib2Zmc2V0IiwiaW5wdXRUeXBlIiwiYWNjZXB0c1JlbW92YWwiLCJwb3NpdGlvbiIsIm1lcmdlIiwicGFydCIsInNwbGl0Iiwic3BsaXRUZXh0Iiwic3Vic3RyIiwiUGxhaW5QYXJ0IiwicmVtb3ZlIiwibGVuIiwic3RyV2l0aFJlbW92YWwiLCJpIiwiY2hhckF0IiwiYXBwZW5kVW50aWxSZWplY3RlZCIsInN0ciIsImxlbmd0aCIsInZhbGlkYXRlQW5kSW5zZXJ0IiwiYmVmb3JlSW5zZXJ0IiwiYWZ0ZXJJbnNlcnQiLCJjcmVhdGVBdXRvQ29tcGxldGUiLCJ1cGRhdGVDYWxsYmFjayIsInRyaW0iLCJyZW1haW5pbmciLCJjYW5FZGl0IiwidG9TdHJpbmciLCJ0eXBlIiwic2VyaWFsaXplIiwiUGxhaW5CYXNlUGFydCIsInRvRE9NTm9kZSIsImRvY3VtZW50IiwiY3JlYXRlVGV4dE5vZGUiLCJ1cGRhdGVET01Ob2RlIiwibm9kZSIsInRleHRDb250ZW50IiwiY2FuVXBkYXRlRE9NTm9kZSIsIm5vZGVUeXBlIiwiTm9kZSIsIlRFWFRfTk9ERSIsIlBsYWluIiwiUGlsbFBhcnQiLCJyZXNvdXJjZUlkIiwibGFiZWwiLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJzZXRBdmF0YXIiLCJ0ZXh0Tm9kZSIsImNoaWxkTm9kZXMiLCJFTEVNRU5UX05PREUiLCJub2RlTmFtZSIsIl9zZXRBdmF0YXJWYXJzIiwiYXZhdGFyVXJsIiwiaW5pdGlhbExldHRlciIsImF2YXRhckJhY2tncm91bmQiLCJhdmF0YXJMZXR0ZXIiLCJzdHlsZSIsImdldFByb3BlcnR5VmFsdWUiLCJzZXRQcm9wZXJ0eSIsIk5ld2xpbmVQYXJ0IiwidGFnTmFtZSIsIk5ld2xpbmUiLCJSb29tUGlsbFBhcnQiLCJkaXNwbGF5QWxpYXMiLCJyb29tIiwiQXZhdGFyIiwiYXZhdGFyVXJsRm9yUm9vbSIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJnZXRJbml0aWFsTGV0dGVyIiwibmFtZSIsImRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmciLCJyb29tSWQiLCJSb29tUGlsbCIsIkF0Um9vbVBpbGxQYXJ0IiwiQXRSb29tUGlsbCIsIlVzZXJQaWxsUGFydCIsInVzZXJJZCIsImRpc3BsYXlOYW1lIiwibWVtYmVyIiwiZGVmYXVsdEF2YXRhclVybCIsImF2YXRhclVybEZvck1lbWJlciIsIlVzZXJQaWxsIiwiUGlsbENhbmRpZGF0ZVBhcnQiLCJhdXRvQ29tcGxldGVDcmVhdG9yIiwiY3JlYXRlIiwiUGlsbENhbmRpZGF0ZSIsImdldEF1dG9Db21wbGV0ZUNyZWF0b3IiLCJnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50IiwidXBkYXRlUXVlcnkiLCJwYXJ0Q3JlYXRvciIsIkF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCIsIlBhcnRDcmVhdG9yIiwiY2xpZW50Iiwic2V0QXV0b0NvbXBsZXRlQ3JlYXRvciIsImNyZWF0ZVBhcnRGb3JJbnB1dCIsImlucHV0IiwicGFydEluZGV4IiwicGlsbENhbmRpZGF0ZSIsImNyZWF0ZURlZmF1bHRQYXJ0IiwicGxhaW4iLCJkZXNlcmlhbGl6ZVBhcnQiLCJuZXdsaW5lIiwiYXRSb29tUGlsbCIsInJvb21QaWxsIiwidXNlclBpbGwiLCJhbGlhcyIsImdldFJvb20iLCJnZXRSb29tcyIsImZpbmQiLCJyIiwiZ2V0Q2Fub25pY2FsQWxpYXMiLCJnZXRBbHRBbGlhc2VzIiwiaW5jbHVkZXMiLCJnZXRNZW1iZXIiLCJjcmVhdGVNZW50aW9uUGFydHMiLCJwaWxsIiwicG9zdGZpeCIsIkNvbW1hbmRQYXJ0Q3JlYXRvciIsImNvbW1hbmQiLCJDb21tYW5kUGFydCIsIkNvbW1hbmQiXSwibWFwcGlu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K0YsT0FBTCxDQUFhckgsSUFBSSxDQUFDVCxJQUFsQixDQUFQO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsYUFBTyxNQUFNNEcsZUFBTixDQUFzQm5HLElBQXRCLENBQVA7QUFDSDtBQUNKOztBQXJCK0M7Ozs7QUF3QnBELE1BQU1zSCxXQUFOLFNBQTBCckMsaUJBQTFCLENBQTRDO0FBQ3hDLE1BQUkzRCxJQUFKO0FBQUE7QUFBdUM7QUFDbkMsV0FBT2xDLElBQUksQ0FBQ21JLE9BQVo7QUFDSDs7QUFIdUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHtSb29tfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCwge1xuICAgIEdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQsXG4gICAgVXBkYXRlQ2FsbGJhY2ssXG4gICAgVXBkYXRlUXVlcnksXG59IGZyb20gXCIuL2F1dG9jb21wbGV0ZVwiO1xuaW1wb3J0ICogYXMgQXZhdGFyIGZyb20gXCIuLi9BdmF0YXJcIjtcblxuaW50ZXJmYWNlIElTZXJpYWxpemVkUGFydCB7XG4gICAgdHlwZTogVHlwZS5QbGFpbiB8IFR5cGUuTmV3bGluZSB8IFR5cGUuQ29tbWFuZCB8IFR5cGUuUGlsbENhbmRpZGF0ZTtcbiAgICB0ZXh0OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU2VyaWFsaXplZFBpbGxQYXJ0IHtcbiAgICB0eXBlOiBUeXBlLkF0Um9vbVBpbGwgfCBUeXBlLlJvb21QaWxsIHwgVHlwZS5Vc2VyUGlsbDtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgcmVzb3VyY2VJZDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkUGFydCA9IElTZXJpYWxpemVkUGFydCB8IElTZXJpYWxpemVkUGlsbFBhcnQ7XG5cbmVudW0gVHlwZSB7XG4gICAgUGxhaW4gPSBcInBsYWluXCIsXG4gICAgTmV3bGluZSA9IFwibmV3bGluZVwiLFxuICAgIENvbW1hbmQgPSBcImNvbW1hbmRcIixcbiAgICBVc2VyUGlsbCA9IFwidXNlci1waWxsXCIsXG4gICAgUm9vbVBpbGwgPSBcInJvb20tcGlsbFwiLFxuICAgIEF0Um9vbVBpbGwgPSBcImF0LXJvb20tcGlsbFwiLFxuICAgIFBpbGxDYW5kaWRhdGUgPSBcInBpbGwtY2FuZGlkYXRlXCIsXG59XG5cbmludGVyZmFjZSBJQmFzZVBhcnQge1xuICAgIHRleHQ6IHN0cmluZztcbiAgICB0eXBlOiBUeXBlLlBsYWluIHwgVHlwZS5OZXdsaW5lO1xuICAgIGNhbkVkaXQ6IGJvb2xlYW47XG5cbiAgICBjcmVhdGVBdXRvQ29tcGxldGUodXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrKTogdm9pZDtcblxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkUGFydDtcbiAgICByZW1vdmUob2Zmc2V0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogc3RyaW5nO1xuICAgIHNwbGl0KG9mZnNldDogbnVtYmVyKTogSUJhc2VQYXJ0O1xuICAgIHZhbGlkYXRlQW5kSW5zZXJ0KG9mZnNldDogbnVtYmVyLCBzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpOiBib29sZWFuO1xuICAgIGFwcGVuZFVudGlsUmVqZWN0ZWQoc3RyOiBzdHJpbmcsIGlucHV0VHlwZTogc3RyaW5nKTogc3RyaW5nO1xuICAgIHVwZGF0ZURPTU5vZGUobm9kZTogTm9kZSk7XG4gICAgY2FuVXBkYXRlRE9NTm9kZShub2RlOiBOb2RlKTtcbiAgICB0b0RPTU5vZGUoKTogTm9kZTtcbn1cblxuaW50ZXJmYWNlIElQaWxsQ2FuZGlkYXRlUGFydCBleHRlbmRzIE9taXQ8SUJhc2VQYXJ0LCBcInR5cGVcIiB8IFwiY3JlYXRlQXV0b0NvbXBsZXRlXCI+IHtcbiAgICB0eXBlOiBUeXBlLlBpbGxDYW5kaWRhdGUgfCBUeXBlLkNvbW1hbmQ7XG4gICAgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbn1cblxuaW50ZXJmYWNlIElQaWxsUGFydCBleHRlbmRzIE9taXQ8SUJhc2VQYXJ0LCBcInR5cGVcIiB8IFwicmVzb3VyY2VJZFwiPiB7XG4gICAgdHlwZTogVHlwZS5BdFJvb21QaWxsIHwgVHlwZS5Sb29tUGlsbCB8IFR5cGUuVXNlclBpbGw7XG4gICAgcmVzb3VyY2VJZDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gSUJhc2VQYXJ0IHwgSVBpbGxDYW5kaWRhdGVQYXJ0IHwgSVBpbGxQYXJ0O1xuXG5hYnN0cmFjdCBjbGFzcyBCYXNlUGFydCB7XG4gICAgcHJvdGVjdGVkIF90ZXh0OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcih0ZXh0ID0gXCJcIikge1xuICAgICAgICB0aGlzLl90ZXh0ID0gdGV4dDtcbiAgICB9XG5cbiAgICBhY2NlcHRzSW5zZXJ0aW9uKGNocjogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgaW5wdXRUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgbWVyZ2UocGFydDogUGFydCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3BsaXQob2Zmc2V0OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3Qgc3BsaXRUZXh0ID0gdGhpcy50ZXh0LnN1YnN0cihvZmZzZXQpO1xuICAgICAgICB0aGlzLl90ZXh0ID0gdGhpcy50ZXh0LnN1YnN0cigwLCBvZmZzZXQpO1xuICAgICAgICByZXR1cm4gbmV3IFBsYWluUGFydChzcGxpdFRleHQpO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZXMgbGVuIGNoYXJzLCBvciByZXR1cm5zIHRoZSBwbGFpbiB0ZXh0IHRoaXMgcGFydCBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aFxuICAgIC8vIGlmIHRoZSBwYXJ0IHdvdWxkIGJlY29tZSBpbnZhbGlkIGlmIGl0IHJlbW92ZWQgZXZlcnl0aGluZy5cbiAgICByZW1vdmUob2Zmc2V0OiBudW1iZXIsIGxlbjogbnVtYmVyKSB7XG4gICAgICAgIC8vIHZhbGlkYXRlXG4gICAgICAgIGNvbnN0IHN0cldpdGhSZW1vdmFsID0gdGhpcy50ZXh0LnN1YnN0cigwLCBvZmZzZXQpICsgdGhpcy50ZXh0LnN1YnN0cihvZmZzZXQgKyBsZW4pO1xuICAgICAgICBmb3IgKGxldCBpID0gb2Zmc2V0OyBpIDwgKGxlbiArIG9mZnNldCk7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgY2hyID0gdGhpcy50ZXh0LmNoYXJBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY2NlcHRzUmVtb3ZhbChpLCBjaHIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cldpdGhSZW1vdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3RleHQgPSBzdHJXaXRoUmVtb3ZhbDtcbiAgICB9XG5cbiAgICAvLyBhcHBlbmQgc3RyLCByZXR1cm5zIHRoZSByZW1haW5pbmcgc3RyaW5nIGlmIGEgY2hhcmFjdGVyIHdhcyByZWplY3RlZC5cbiAgICBhcHBlbmRVbnRpbFJlamVjdGVkKHN0cjogc3RyaW5nLCBpbnB1dFR5cGU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLnRleHQubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgY2hyID0gc3RyLmNoYXJBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY2NlcHRzSW5zZXJ0aW9uKGNociwgb2Zmc2V0ICsgaSwgaW5wdXRUeXBlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RleHQgPSB0aGlzLl90ZXh0ICsgc3RyLnN1YnN0cigwLCBpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90ZXh0ID0gdGhpcy5fdGV4dCArIHN0cjtcbiAgICB9XG5cbiAgICAvLyBpbnNlcnRzIHN0ciBhdCBvZmZzZXQgaWYgYWxsIHRoZSBjaGFyYWN0ZXJzIGluIHN0ciB3ZXJlIGFjY2VwdGVkLCBvdGhlcndpc2UgZG9uJ3QgZG8gYW55dGhpbmdcbiAgICAvLyByZXR1cm4gd2hldGhlciB0aGUgc3RyIHdhcyBhY2NlcHRlZCBvciBub3QuXG4gICAgdmFsaWRhdGVBbmRJbnNlcnQob2Zmc2V0OiBudW1iZXIsIHN0cjogc3RyaW5nLCBpbnB1dFR5cGU6IHN0cmluZykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgY2hyID0gc3RyLmNoYXJBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY2NlcHRzSW5zZXJ0aW9uKGNociwgb2Zmc2V0ICsgaSwgaW5wdXRUeXBlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBiZWZvcmVJbnNlcnQgPSB0aGlzLl90ZXh0LnN1YnN0cigwLCBvZmZzZXQpO1xuICAgICAgICBjb25zdCBhZnRlckluc2VydCA9IHRoaXMuX3RleHQuc3Vic3RyKG9mZnNldCk7XG4gICAgICAgIHRoaXMuX3RleHQgPSBiZWZvcmVJbnNlcnQgKyBzdHIgKyBhZnRlckluc2VydDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IHZvaWQge31cblxuICAgIHRyaW0obGVuOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gdGhpcy5fdGV4dC5zdWJzdHIobGVuKTtcbiAgICAgICAgdGhpcy5fdGV4dCA9IHRoaXMuX3RleHQuc3Vic3RyKDAsIGxlbik7XG4gICAgICAgIHJldHVybiByZW1haW5pbmc7XG4gICAgfVxuXG4gICAgZ2V0IHRleHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0O1xuICAgIH1cblxuICAgIGFic3RyYWN0IGdldCB0eXBlKCk6IFR5cGU7XG5cbiAgICBnZXQgY2FuRWRpdCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLnR5cGV9KCR7dGhpcy50ZXh0fSlgO1xuICAgIH1cblxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkUGFydCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUgYXMgSVNlcmlhbGl6ZWRQYXJ0W1widHlwZVwiXSxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMudGV4dCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCB1cGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpO1xuICAgIGFic3RyYWN0IGNhblVwZGF0ZURPTU5vZGUobm9kZTogTm9kZSk7XG4gICAgYWJzdHJhY3QgdG9ET01Ob2RlKCk6IE5vZGU7XG59XG5cbmFic3RyYWN0IGNsYXNzIFBsYWluQmFzZVBhcnQgZXh0ZW5kcyBCYXNlUGFydCB7XG4gICAgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIsIGlucHV0VHlwZTogc3RyaW5nKSB7XG4gICAgICAgIGlmIChjaHIgPT09IFwiXFxuXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB3aGVuIG5vdCBwYXN0aW5nIG9yIGRyb3BwaW5nIHRleHQsIHJlamVjdCBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIHN0YXJ0IGEgcGlsbCBjYW5kaWRhdGVcbiAgICAgICAgaWYgKGlucHV0VHlwZSAhPT0gXCJpbnNlcnRGcm9tUGFzdGVcIiAmJiBpbnB1dFR5cGUgIT09IFwiaW5zZXJ0RnJvbURyb3BcIikge1xuICAgICAgICAgICAgaWYgKGNociAhPT0gXCJAXCIgJiYgY2hyICE9PSBcIiNcIiAmJiBjaHIgIT09IFwiOlwiICYmIGNociAhPT0gXCIrXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG9ubHkgc3BsaXQgaWYgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIHNwYWNlXG4gICAgICAgICAgICAvLyBvciBpZiBpdCBpcyBhICsgYW5kIHRoaXMgaXMgYSA6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGV4dFtvZmZzZXQgLSAxXSAhPT0gXCIgXCIgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5fdGV4dFtvZmZzZXQgLSAxXSAhPT0gXCIrXCIgfHwgY2hyICE9PSBcIjpcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdG9ET01Ob2RlKCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50ZXh0KTtcbiAgICB9XG5cbiAgICBtZXJnZShwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09IHRoaXMudHlwZSkge1xuICAgICAgICAgICAgdGhpcy5fdGV4dCA9IHRoaXMudGV4dCArIHBhcnQudGV4dDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUudGV4dENvbnRlbnQgIT09IHRoaXMudGV4dCkge1xuICAgICAgICAgICAgbm9kZS50ZXh0Q29udGVudCA9IHRoaXMudGV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhblVwZGF0ZURPTU5vZGUobm9kZTogTm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREU7XG4gICAgfVxufVxuXG4vLyBleHBvcnRlZCBmb3IgdW5pdCB0ZXN0cywgc2hvdWxkIG90aGVyd2lzZSBvbmx5IGJlIHVzZWQgdGhyb3VnaCBQYXJ0Q3JlYXRvclxuZXhwb3J0IGNsYXNzIFBsYWluUGFydCBleHRlbmRzIFBsYWluQmFzZVBhcnQgaW1wbGVtZW50cyBJQmFzZVBhcnQge1xuICAgIGdldCB0eXBlKCk6IElCYXNlUGFydFtcInR5cGVcIl0ge1xuICAgICAgICByZXR1cm4gVHlwZS5QbGFpbjtcbiAgICB9XG59XG5cbmFic3RyYWN0IGNsYXNzIFBpbGxQYXJ0IGV4dGVuZHMgQmFzZVBhcnQgaW1wbGVtZW50cyBJUGlsbFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyByZXNvdXJjZUlkOiBzdHJpbmcsIGxhYmVsKSB7XG4gICAgICAgIHN1cGVyKGxhYmVsKTtcbiAgICB9XG5cbiAgICBhY2NlcHRzSW5zZXJ0aW9uKGNocjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBjaHIgIT09IFwiIFwiO1xuICAgIH1cblxuICAgIGFjY2VwdHNSZW1vdmFsKHBvc2l0aW9uOiBudW1iZXIsIGNocjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBwb3NpdGlvbiAhPT0gMDsgIC8vaWYgeW91IHJlbW92ZSBpbml0aWFsICMgb3IgQCwgcGlsbCBzaG91bGQgYmVjb21lIHBsYWluXG4gICAgfVxuXG4gICAgdG9ET01Ob2RlKCkge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZShcInNwZWxsY2hlY2tcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSA9IHRoaXMuY2xhc3NOYW1lO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50ZXh0KSk7XG4gICAgICAgIHRoaXMuc2V0QXZhdGFyKGNvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfVxuXG4gICAgdXBkYXRlRE9NTm9kZShub2RlOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IG5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgaWYgKHRleHROb2RlLnRleHRDb250ZW50ICE9PSB0aGlzLnRleHQpIHtcbiAgICAgICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdGhpcy50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmNsYXNzTmFtZSAhPT0gdGhpcy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NOYW1lID0gdGhpcy5jbGFzc05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRBdmF0YXIobm9kZSk7XG4gICAgfVxuXG4gICAgY2FuVXBkYXRlRE9NTm9kZShub2RlOiBIVE1MRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgJiZcbiAgICAgICAgICAgICAgIG5vZGUubm9kZU5hbWUgPT09IFwiU1BBTlwiICYmXG4gICAgICAgICAgICAgICBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgICAgICBub2RlLmNoaWxkTm9kZXNbMF0ubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFO1xuICAgIH1cblxuICAgIC8vIGhlbHBlciBtZXRob2QgZm9yIHN1YmNsYXNzZXNcbiAgICBfc2V0QXZhdGFyVmFycyhub2RlOiBIVE1MRWxlbWVudCwgYXZhdGFyVXJsOiBzdHJpbmcsIGluaXRpYWxMZXR0ZXI6IHN0cmluZykge1xuICAgICAgICBjb25zdCBhdmF0YXJCYWNrZ3JvdW5kID0gYHVybCgnJHthdmF0YXJVcmx9JylgO1xuICAgICAgICBjb25zdCBhdmF0YXJMZXR0ZXIgPSBgJyR7aW5pdGlhbExldHRlcn0nYDtcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHZhbHVlIGlzIGNoYW5naW5nLFxuICAgICAgICAvLyBvdGhlcndpc2UgdGhlIGF2YXRhcnMgZmxpY2tlciBvbiBldmVyeSBrZXlzdHJva2Ugd2hpbGUgdXBkYXRpbmcuXG4gICAgICAgIGlmIChub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWF2YXRhci1iYWNrZ3JvdW5kXCIpICE9PSBhdmF0YXJCYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KFwiLS1hdmF0YXItYmFja2dyb3VuZFwiLCBhdmF0YXJCYWNrZ3JvdW5kKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1hdmF0YXItbGV0dGVyXCIpICE9PSBhdmF0YXJMZXR0ZXIpIHtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoXCItLWF2YXRhci1sZXR0ZXJcIiwgYXZhdGFyTGV0dGVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBjYW5FZGl0KCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYWJzdHJhY3QgZ2V0IHR5cGUoKTogSVBpbGxQYXJ0W1widHlwZVwiXTtcblxuICAgIGFic3RyYWN0IGdldCBjbGFzc05hbWUoKTogc3RyaW5nO1xuXG4gICAgYWJzdHJhY3Qgc2V0QXZhdGFyKG5vZGU6IEhUTUxFbGVtZW50KTogdm9pZDtcbn1cblxuY2xhc3MgTmV3bGluZVBhcnQgZXh0ZW5kcyBCYXNlUGFydCBpbXBsZW1lbnRzIElCYXNlUGFydCB7XG4gICAgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG9mZnNldCA9PT0gMCAmJiBjaHIgPT09IFwiXFxuXCI7XG4gICAgfVxuXG4gICAgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdG9ET01Ob2RlKCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJyXCIpO1xuICAgIH1cblxuICAgIG1lcmdlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdXBkYXRlRE9NTm9kZSgpIHt9XG5cbiAgICBjYW5VcGRhdGVET01Ob2RlKG5vZGU6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBub2RlLnRhZ05hbWUgPT09IFwiQlJcIjtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpOiBJQmFzZVBhcnRbXCJ0eXBlXCJdIHtcbiAgICAgICAgcmV0dXJuIFR5cGUuTmV3bGluZTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG1ha2VzIHRoZSBjdXJzb3Igc2tpcCB0aGlzIHBhcnQgd2hlbiBpdCBpcyBpbnNlcnRlZFxuICAgIC8vIHJhdGhlciB0aGFuIHRyeWluZyB0byBhcHBlbmQgdG8gaXQsIHdoaWNoIGlzIHdoYXQgd2Ugd2FudC5cbiAgICAvLyBBcyBhIG5ld2xpbmUgY2FuIGFsc28gYmUgb25seSBvbmUgY2hhcmFjdGVyLCBpdCBtYWtlcyBzZW5zZVxuICAgIC8vIGFzIGl0IGNhbiBvbmx5IGJlIG9uZSBjaGFyYWN0ZXIgbG9uZy4gVGhpcyBjYXVzZWQgIzk3NDEuXG4gICAgZ2V0IGNhbkVkaXQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmNsYXNzIFJvb21QaWxsUGFydCBleHRlbmRzIFBpbGxQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihkaXNwbGF5QWxpYXMsIHByaXZhdGUgcm9vbTogUm9vbSkge1xuICAgICAgICBzdXBlcihkaXNwbGF5QWxpYXMsIGRpc3BsYXlBbGlhcyk7XG4gICAgfVxuXG4gICAgc2V0QXZhdGFyKG5vZGU6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxldCBpbml0aWFsTGV0dGVyID0gXCJcIjtcbiAgICAgICAgbGV0IGF2YXRhclVybCA9IEF2YXRhci5hdmF0YXJVcmxGb3JSb29tKFxuICAgICAgICAgICAgdGhpcy5yb29tLFxuICAgICAgICAgICAgMTYgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgICAgICAgIDE2ICogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICAgICAgICBcImNyb3BcIik7XG4gICAgICAgIGlmICghYXZhdGFyVXJsKSB7XG4gICAgICAgICAgICBpbml0aWFsTGV0dGVyID0gQXZhdGFyLmdldEluaXRpYWxMZXR0ZXIodGhpcy5yb29tID8gdGhpcy5yb29tLm5hbWUgOiB0aGlzLnJlc291cmNlSWQpO1xuICAgICAgICAgICAgYXZhdGFyVXJsID0gQXZhdGFyLmRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmcodGhpcy5yb29tID8gdGhpcy5yb29tLnJvb21JZCA6IHRoaXMucmVzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0QXZhdGFyVmFycyhub2RlLCBhdmF0YXJVcmwsIGluaXRpYWxMZXR0ZXIpO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCk6IElQaWxsUGFydFtcInR5cGVcIl0ge1xuICAgICAgICByZXR1cm4gVHlwZS5Sb29tUGlsbDtcbiAgICB9XG5cbiAgICBnZXQgY2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJteF9Sb29tUGlsbCBteF9QaWxsXCI7XG4gICAgfVxufVxuXG5jbGFzcyBBdFJvb21QaWxsUGFydCBleHRlbmRzIFJvb21QaWxsUGFydCB7XG4gICAgZ2V0IHR5cGUoKTogSVBpbGxQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLkF0Um9vbVBpbGw7XG4gICAgfVxufVxuXG5jbGFzcyBVc2VyUGlsbFBhcnQgZXh0ZW5kcyBQaWxsUGFydCB7XG4gICAgY29uc3RydWN0b3IodXNlcklkLCBkaXNwbGF5TmFtZSwgcHJpdmF0ZSBtZW1iZXI6IFJvb21NZW1iZXIpIHtcbiAgICAgICAgc3VwZXIodXNlcklkLCBkaXNwbGF5TmFtZSk7XG4gICAgfVxuXG4gICAgc2V0QXZhdGFyKG5vZGU6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5tZW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5tZW1iZXIubmFtZSB8fCB0aGlzLm1lbWJlci51c2VySWQ7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRBdmF0YXJVcmwgPSBBdmF0YXIuZGVmYXVsdEF2YXRhclVybEZvclN0cmluZyh0aGlzLm1lbWJlci51c2VySWQpO1xuICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBBdmF0YXIuYXZhdGFyVXJsRm9yTWVtYmVyKFxuICAgICAgICAgICAgdGhpcy5tZW1iZXIsXG4gICAgICAgICAgICAxNiAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgICAgICAgMTYgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgICAgICAgIFwiY3JvcFwiKTtcbiAgICAgICAgbGV0IGluaXRpYWxMZXR0ZXIgPSBcIlwiO1xuICAgICAgICBpZiAoYXZhdGFyVXJsID09PSBkZWZhdWx0QXZhdGFyVXJsKSB7XG4gICAgICAgICAgICBpbml0aWFsTGV0dGVyID0gQXZhdGFyLmdldEluaXRpYWxMZXR0ZXIobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0QXZhdGFyVmFycyhub2RlLCBhdmF0YXJVcmwsIGluaXRpYWxMZXR0ZXIpO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCk6IElQaWxsUGFydFtcInR5cGVcIl0ge1xuICAgICAgICByZXR1cm4gVHlwZS5Vc2VyUGlsbDtcbiAgICB9XG5cbiAgICBnZXQgY2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJteF9Vc2VyUGlsbCBteF9QaWxsXCI7XG4gICAgfVxuXG4gICAgc2VyaWFsaXplKCk6IElTZXJpYWxpemVkUGlsbFBhcnQge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgdGV4dDogdGhpcy50ZXh0LFxuICAgICAgICAgICAgcmVzb3VyY2VJZDogdGhpcy5yZXNvdXJjZUlkLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuY2xhc3MgUGlsbENhbmRpZGF0ZVBhcnQgZXh0ZW5kcyBQbGFpbkJhc2VQYXJ0IGltcGxlbWVudHMgSVBpbGxDYW5kaWRhdGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHByaXZhdGUgYXV0b0NvbXBsZXRlQ3JlYXRvcjogSUF1dG9jb21wbGV0ZUNyZWF0b3IpIHtcbiAgICAgICAgc3VwZXIodGV4dCk7XG4gICAgfVxuXG4gICAgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IuY3JlYXRlKHVwZGF0ZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBhY2NlcHRzSW5zZXJ0aW9uKGNocjogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgaW5wdXRUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuYWNjZXB0c0luc2VydGlvbihjaHIsIG9mZnNldCwgaW5wdXRUeXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1lcmdlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKTogSVBpbGxDYW5kaWRhdGVQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLlBpbGxDYW5kaWRhdGU7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcihnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50OiBHZXRBdXRvY29tcGxldGVyQ29tcG9uZW50LCB1cGRhdGVRdWVyeTogVXBkYXRlUXVlcnkpIHtcbiAgICByZXR1cm4gKHBhcnRDcmVhdG9yOiBQYXJ0Q3JlYXRvcikgPT4ge1xuICAgICAgICByZXR1cm4gKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWwoXG4gICAgICAgICAgICAgICAgdXBkYXRlQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgZ2V0QXV0b2NvbXBsZXRlckNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB1cGRhdGVRdWVyeSxcbiAgICAgICAgICAgICAgICBwYXJ0Q3JlYXRvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxudHlwZSBBdXRvQ29tcGxldGVDcmVhdG9yID0gUmV0dXJuVHlwZTx0eXBlb2YgZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcj47XG5cbmludGVyZmFjZSBJQXV0b2NvbXBsZXRlQ3JlYXRvciB7XG4gICAgY3JlYXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbn1cblxuZXhwb3J0IGNsYXNzIFBhcnRDcmVhdG9yIHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgYXV0b0NvbXBsZXRlQ3JlYXRvcjogSUF1dG9jb21wbGV0ZUNyZWF0b3I7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvb206IFJvb20sIHByaXZhdGUgY2xpZW50OiBNYXRyaXhDbGllbnQsIGF1dG9Db21wbGV0ZUNyZWF0b3I6IEF1dG9Db21wbGV0ZUNyZWF0b3IgPSBudWxsKSB7XG4gICAgICAgIC8vIHByZS1jcmVhdGUgdGhlIGNyZWF0b3IgYXMgYW4gb2JqZWN0IGV2ZW4gd2l0aG91dCBjYWxsYmFjayBzbyBpdCBjYW4gYWxyZWFkeSBiZSBwYXNzZWRcbiAgICAgICAgLy8gdG8gUGlsbENhbmRpZGF0ZVBhcnQgKGUuZy4gd2hpbGUgZGVzZXJpYWxpemluZykgYW5kIHNldCBsYXRlciBvblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IgPSB7Y3JlYXRlOiBhdXRvQ29tcGxldGVDcmVhdG9yICYmIGF1dG9Db21wbGV0ZUNyZWF0b3IodGhpcyl9O1xuICAgIH1cblxuICAgIHNldEF1dG9Db21wbGV0ZUNyZWF0b3IoYXV0b0NvbXBsZXRlQ3JlYXRvcjogQXV0b0NvbXBsZXRlQ3JlYXRvcikge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IuY3JlYXRlID0gYXV0b0NvbXBsZXRlQ3JlYXRvcih0aGlzKTtcbiAgICB9XG5cbiAgICBjcmVhdGVQYXJ0Rm9ySW5wdXQoaW5wdXQ6IHN0cmluZywgcGFydEluZGV4OiBudW1iZXIsIGlucHV0VHlwZT86IHN0cmluZyk6IFBhcnQge1xuICAgICAgICBzd2l0Y2ggKGlucHV0WzBdKSB7XG4gICAgICAgICAgICBjYXNlIFwiI1wiOlxuICAgICAgICAgICAgY2FzZSBcIkBcIjpcbiAgICAgICAgICAgIGNhc2UgXCI6XCI6XG4gICAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBpbGxDYW5kaWRhdGUoXCJcIik7XG4gICAgICAgICAgICBjYXNlIFwiXFxuXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOZXdsaW5lUGFydCgpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBsYWluUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlRGVmYXVsdFBhcnQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYWluKHRleHQpO1xuICAgIH1cblxuICAgIGRlc2VyaWFsaXplUGFydChwYXJ0OiBTZXJpYWxpemVkUGFydCk6IFBhcnQge1xuICAgICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBUeXBlLlBsYWluOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsYWluKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuTmV3bGluZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZXdsaW5lKCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuQXRSb29tUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdFJvb21QaWxsKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuUGlsbENhbmRpZGF0ZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5waWxsQ2FuZGlkYXRlKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuUm9vbVBpbGw6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vbVBpbGwocGFydC50ZXh0KTtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Vc2VyUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyUGlsbChwYXJ0LnRleHQsIHBhcnQucmVzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGFpbih0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQbGFpblBhcnQodGV4dCk7XG4gICAgfVxuXG4gICAgbmV3bGluZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOZXdsaW5lUGFydChcIlxcblwiKTtcbiAgICB9XG5cbiAgICBwaWxsQ2FuZGlkYXRlKHRleHQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFBpbGxDYW5kaWRhdGVQYXJ0KHRleHQsIHRoaXMuYXV0b0NvbXBsZXRlQ3JlYXRvcik7XG4gICAgfVxuXG4gICAgcm9vbVBpbGwoYWxpYXM6IHN0cmluZywgcm9vbUlkPzogc3RyaW5nKSB7XG4gICAgICAgIGxldCByb29tO1xuICAgICAgICBpZiAocm9vbUlkIHx8IGFsaWFzWzBdICE9PSBcIiNcIikge1xuICAgICAgICAgICAgcm9vbSA9IHRoaXMuY2xpZW50LmdldFJvb20ocm9vbUlkIHx8IGFsaWFzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvb20gPSB0aGlzLmNsaWVudC5nZXRSb29tcygpLmZpbmQoKHIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci5nZXRDYW5vbmljYWxBbGlhcygpID09PSBhbGlhcyB8fFxuICAgICAgICAgICAgICAgICAgICAgICByLmdldEFsdEFsaWFzZXMoKS5pbmNsdWRlcyhhbGlhcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJvb21QaWxsUGFydChhbGlhcywgcm9vbSk7XG4gICAgfVxuXG4gICAgYXRSb29tUGlsbCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdFJvb21QaWxsUGFydCh0ZXh0LCB0aGlzLnJvb20pO1xuICAgIH1cblxuICAgIHVzZXJQaWxsKGRpc3BsYXlOYW1lOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMucm9vbS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyUGlsbFBhcnQodXNlcklkLCBkaXNwbGF5TmFtZSwgbWVtYmVyKTtcbiAgICB9XG5cbiAgICBjcmVhdGVNZW50aW9uUGFydHMocGFydEluZGV4OiBudW1iZXIsIGRpc3BsYXlOYW1lOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHBpbGwgPSB0aGlzLnVzZXJQaWxsKGRpc3BsYXlOYW1lLCB1c2VySWQpO1xuICAgICAgICBjb25zdCBwb3N0Zml4ID0gdGhpcy5wbGFpbihwYXJ0SW5kZXggPT09IDAgPyBcIjogXCIgOiBcIiBcIik7XG4gICAgICAgIHJldHVybiBbcGlsbCwgcG9zdGZpeF07XG4gICAgfVxufVxuXG4vLyBwYXJ0IGNyZWF0b3IgdGhhdCBzdXBwb3J0IGF1dG8gY29tcGxldGUgZm9yIC9jb21tYW5kcyxcbi8vIHVzZWQgaW4gU2VuZE1lc3NhZ2VDb21wb3NlclxuZXhwb3J0IGNsYXNzIENvbW1hbmRQYXJ0Q3JlYXRvciBleHRlbmRzIFBhcnRDcmVhdG9yIHtcbiAgICBjcmVhdGVQYXJ0Rm9ySW5wdXQodGV4dDogc3RyaW5nLCBwYXJ0SW5kZXg6IG51bWJlcikge1xuICAgICAgICAvLyBhdCBiZWdpbm5pbmcgYW5kIHN0YXJ0cyB3aXRoIC8/IGNyZWF0ZVxuICAgICAgICBpZiAocGFydEluZGV4ID09PSAwICYmIHRleHRbMF0gPT09IFwiL1wiKSB7XG4gICAgICAgICAgICAvLyB0ZXh0IHdpbGwgYmUgaW5zZXJ0ZWQgYnkgbW9kZWwsIHNvIHBhc3MgZW1wdHkgc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21tYW5kKFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmNyZWF0ZVBhcnRGb3JJbnB1dCh0ZXh0LCBwYXJ0SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tbWFuZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21tYW5kUGFydCh0ZXh0LCB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IpO1xuICAgIH1cblxuICAgIGRlc2VyaWFsaXplUGFydChwYXJ0OiBQYXJ0KTogUGFydCB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09IFwiY29tbWFuZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21tYW5kKHBhcnQudGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZGVzZXJpYWxpemVQYXJ0KHBhcnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBDb21tYW5kUGFydCBleHRlbmRzIFBpbGxDYW5kaWRhdGVQYXJ0IHtcbiAgICBnZXQgdHlwZSgpOiBJUGlsbENhbmRpZGF0ZVBhcnRbXCJ0eXBlXCJdIHtcbiAgICAgICAgcmV0dXJuIFR5cGUuQ29tbWFuZDtcbiAgICB9XG59XG4iXX0=