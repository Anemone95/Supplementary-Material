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
      } // split if we are at the beginning of the part text


      if (offset === 0) {
        return false;
      } // or split if the previous character is a space
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

  serialize()
  /*: ISerializedPillPart*/
  {
    return {
      type: this.type,
      text: this.text,
      resourceId: this.resourceId
    };
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
  constructor(resourceId
  /*: string*/
  , label
  /*: string*/
  , room
  /*: Room*/
  ) {
    super(resourceId, label);
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
    let avatarUrl = Avatar.avatarUrlForRoom(this.room, 16, 16, "crop");

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
  constructor(text
  /*: string*/
  , room
  /*: Room*/
  ) {
    super(text, text, room);
  }

  get type()
  /*: IPillPart["type"]*/
  {
    return Type.AtRoomPill;
  }

  serialize()
  /*: ISerializedPillPart*/
  {
    return {
      type: this.type,
      text: this.text
    };
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
    const avatarUrl = Avatar.avatarUrlForMember(this.member, 16, 16, "crop");
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
        return this.roomPill(part.resourceId);

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

    return new RoomPillPart(alias, room ? room.name : alias, room);
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

  createMentionParts(insertTrailingCharacter
  /*: boolean*/
  , displayName
  /*: string*/
  , userId
  /*: string*/
  ) {
    const pill = this.userPill(displayName, userId);
    const postfix = this.plain(insertTrailingCharacter ? ": " : " ");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvcGFydHMudHMiXSwibmFtZXMiOlsiVHlwZSIsIkJhc2VQYXJ0IiwiY29uc3RydWN0b3IiLCJ0ZXh0IiwiX3RleHQiLCJhY2NlcHRzSW5zZXJ0aW9uIiwiY2hyIiwib2Zmc2V0IiwiaW5wdXRUeXBlIiwiYWNjZXB0c1JlbW92YWwiLCJwb3NpdGlvbiIsIm1lcmdlIiwicGFydCIsInNwbGl0Iiwic3BsaXRUZXh0Iiwic3Vic3RyIiwiUGxhaW5QYXJ0IiwicmVtb3ZlIiwibGVuIiwic3RyV2l0aFJlbW92YWwiLCJpIiwiY2hhckF0IiwiYXBwZW5kVW50aWxSZWplY3RlZCIsInN0ciIsImxlbmd0aCIsInZhbGlkYXRlQW5kSW5zZXJ0IiwiYmVmb3JlSW5zZXJ0IiwiYWZ0ZXJJbnNlcnQiLCJjcmVhdGVBdXRvQ29tcGxldGUiLCJ1cGRhdGVDYWxsYmFjayIsInRyaW0iLCJyZW1haW5pbmciLCJjYW5FZGl0IiwidG9TdHJpbmciLCJ0eXBlIiwic2VyaWFsaXplIiwiUGxhaW5CYXNlUGFydCIsInRvRE9NTm9kZSIsImRvY3VtZW50IiwiY3JlYXRlVGV4dE5vZGUiLCJ1cGRhdGVET01Ob2RlIiwibm9kZSIsInRleHRDb250ZW50IiwiY2FuVXBkYXRlRE9NTm9kZSIsIm5vZGVUeXBlIiwiTm9kZSIsIlRFWFRfTk9ERSIsIlBsYWluIiwiUGlsbFBhcnQiLCJyZXNvdXJjZUlkIiwibGFiZWwiLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJzZXRBdmF0YXIiLCJ0ZXh0Tm9kZSIsImNoaWxkTm9kZXMiLCJFTEVNRU5UX05PREUiLCJub2RlTmFtZSIsIl9zZXRBdmF0YXJWYXJzIiwiYXZhdGFyVXJsIiwiaW5pdGlhbExldHRlciIsImF2YXRhckJhY2tncm91bmQiLCJhdmF0YXJMZXR0ZXIiLCJzdHlsZSIsImdldFByb3BlcnR5VmFsdWUiLCJzZXRQcm9wZXJ0eSIsIk5ld2xpbmVQYXJ0IiwidGFnTmFtZSIsIk5ld2xpbmUiLCJSb29tUGlsbFBhcnQiLCJyb29tIiwiQXZhdGFyIiwiYXZhdGFyVXJsRm9yUm9vbSIsImdldEluaXRpYWxMZXR0ZXIiLCJuYW1lIiwiZGVmYXVsdEF2YXRhclVybEZvclN0cmluZyIsInJvb21JZCIsIlJvb21QaWxsIiwiQXRSb29tUGlsbFBhcnQiLCJBdFJvb21QaWxsIiwiVXNlclBpbGxQYXJ0IiwidXNlcklkIiwiZGlzcGxheU5hbWUiLCJtZW1iZXIiLCJkZWZhdWx0QXZhdGFyVXJsIiwiYXZhdGFyVXJsRm9yTWVtYmVyIiwiVXNlclBpbGwiLCJQaWxsQ2FuZGlkYXRlUGFydCIsImF1dG9Db21wbGV0ZUNyZWF0b3IiLCJjcmVhdGUiLCJQaWxsQ2FuZGlkYXRlIiwiZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvciIsImdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQiLCJ1cGRhdGVRdWVyeSIsInBhcnRDcmVhdG9yIiwiQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsIiwiUGFydENyZWF0b3IiLCJjbGllbnQiLCJzZXRBdXRvQ29tcGxldGVDcmVhdG9yIiwiY3JlYXRlUGFydEZvcklucHV0IiwiaW5wdXQiLCJwYXJ0SW5kZXgiLCJwaWxsQ2FuZGlkYXRlIiwiY3JlYXRlRGVmYXVsdFBhcnQiLCJwbGFpbiIsImRlc2VyaWFsaXplUGFydCIsIm5ld2xpbmUiLCJhdFJvb21QaWxsIiwicm9vbVBpbGwiLCJ1c2VyUGlsbCIsImFsaWFzIiwiZ2V0Um9vbSIsImdldFJvb21zIiwiZmluZCIsInIiLCJnZXRDYW5vbmljYWxBbGlhcyIsImdldEFsdEFsaWFzZXMiLCJpbmNsdWRlcyIsImdldE1lbWJlciIsImNyZWF0ZU1lbnRpb25QYXJ0cyIsImluc2VydFRyYWlsaW5nQ2hhcmFjdGVyIiwicGlsbCIsInBvc3RmaXgiLCJDb21tYW5kUGFydENyZWF0b3IiLCJjb21tYW5kIiwiQ29tbWFuZFBhcnQiLCJDb21tYW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7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QUFDSCxhQUFPLE1BQU16QixrQkFBTixDQUF5Qm5HLElBQXpCLEVBQStCcUcsU0FBL0IsQ0FBUDtBQUNIO0FBQ0o7O0FBRUR1QixFQUFBQSxPQUFPLENBQUM1SDtBQUFEO0FBQUEsSUFBZTtBQUNsQixXQUFPLElBQUk2SCxXQUFKLENBQWdCN0gsSUFBaEIsRUFBc0IsS0FBS3dGLG1CQUEzQixDQUFQO0FBQ0g7O0FBRURpQixFQUFBQSxlQUFlLENBQUNoRztBQUFEO0FBQUE7QUFBQTtBQUFtQjtBQUM5QixRQUFJQSxJQUFJLENBQUNzQixJQUFMLEtBQWMsU0FBbEIsRUFBNkI7QUFDekIsYUFBTyxLQUFLNkYsT0FBTCxDQUFhbkgsSUFBSSxDQUFDVCxJQUFsQixDQUFQO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsYUFBTyxNQUFNeUcsZUFBTixDQUFzQmhHLElBQXRCLENBQVA7QUFDSDtBQUNKOztBQXJCK0M7Ozs7QUF3QnBELE1BQU1vSCxXQUFOLFNBQTBCdEMsaUJBQTFCLENBQTRDO0FBQ3hDLE1BQUl4RCxJQUFKO0FBQUE7QUFBdUM7QUFDbkMsV0FBT2xDLElBQUksQ0FBQ2lJLE9BQVo7QUFDSDs7QUFIdUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHtSb29tfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCwge1xuICAgIEdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQsXG4gICAgVXBkYXRlQ2FsbGJhY2ssXG4gICAgVXBkYXRlUXVlcnksXG59IGZyb20gXCIuL2F1dG9jb21wbGV0ZVwiO1xuaW1wb3J0ICogYXMgQXZhdGFyIGZyb20gXCIuLi9BdmF0YXJcIjtcblxuaW50ZXJmYWNlIElTZXJpYWxpemVkUGFydCB7XG4gICAgdHlwZTogVHlwZS5QbGFpbiB8IFR5cGUuTmV3bGluZSB8IFR5cGUuQ29tbWFuZCB8IFR5cGUuUGlsbENhbmRpZGF0ZTtcbiAgICB0ZXh0OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU2VyaWFsaXplZFBpbGxQYXJ0IHtcbiAgICB0eXBlOiBUeXBlLkF0Um9vbVBpbGwgfCBUeXBlLlJvb21QaWxsIHwgVHlwZS5Vc2VyUGlsbDtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgcmVzb3VyY2VJZD86IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFBhcnQgPSBJU2VyaWFsaXplZFBhcnQgfCBJU2VyaWFsaXplZFBpbGxQYXJ0O1xuXG5lbnVtIFR5cGUge1xuICAgIFBsYWluID0gXCJwbGFpblwiLFxuICAgIE5ld2xpbmUgPSBcIm5ld2xpbmVcIixcbiAgICBDb21tYW5kID0gXCJjb21tYW5kXCIsXG4gICAgVXNlclBpbGwgPSBcInVzZXItcGlsbFwiLFxuICAgIFJvb21QaWxsID0gXCJyb29tLXBpbGxcIixcbiAgICBBdFJvb21QaWxsID0gXCJhdC1yb29tLXBpbGxcIixcbiAgICBQaWxsQ2FuZGlkYXRlID0gXCJwaWxsLWNhbmRpZGF0ZVwiLFxufVxuXG5pbnRlcmZhY2UgSUJhc2VQYXJ0IHtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgdHlwZTogVHlwZS5QbGFpbiB8IFR5cGUuTmV3bGluZTtcbiAgICBjYW5FZGl0OiBib29sZWFuO1xuXG4gICAgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IHZvaWQ7XG5cbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFBhcnQ7XG4gICAgcmVtb3ZlKG9mZnNldDogbnVtYmVyLCBsZW46IG51bWJlcik6IHN0cmluZztcbiAgICBzcGxpdChvZmZzZXQ6IG51bWJlcik6IElCYXNlUGFydDtcbiAgICB2YWxpZGF0ZUFuZEluc2VydChvZmZzZXQ6IG51bWJlciwgc3RyOiBzdHJpbmcsIGlucHV0VHlwZTogc3RyaW5nKTogYm9vbGVhbjtcbiAgICBhcHBlbmRVbnRpbFJlamVjdGVkKHN0cjogc3RyaW5nLCBpbnB1dFR5cGU6IHN0cmluZyk6IHN0cmluZztcbiAgICB1cGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpO1xuICAgIGNhblVwZGF0ZURPTU5vZGUobm9kZTogTm9kZSk7XG4gICAgdG9ET01Ob2RlKCk6IE5vZGU7XG59XG5cbmludGVyZmFjZSBJUGlsbENhbmRpZGF0ZVBhcnQgZXh0ZW5kcyBPbWl0PElCYXNlUGFydCwgXCJ0eXBlXCIgfCBcImNyZWF0ZUF1dG9Db21wbGV0ZVwiPiB7XG4gICAgdHlwZTogVHlwZS5QaWxsQ2FuZGlkYXRlIHwgVHlwZS5Db21tYW5kO1xuICAgIGNyZWF0ZUF1dG9Db21wbGV0ZSh1cGRhdGVDYWxsYmFjazogVXBkYXRlQ2FsbGJhY2spOiBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWw7XG59XG5cbmludGVyZmFjZSBJUGlsbFBhcnQgZXh0ZW5kcyBPbWl0PElCYXNlUGFydCwgXCJ0eXBlXCIgfCBcInJlc291cmNlSWRcIj4ge1xuICAgIHR5cGU6IFR5cGUuQXRSb29tUGlsbCB8IFR5cGUuUm9vbVBpbGwgfCBUeXBlLlVzZXJQaWxsO1xuICAgIHJlc291cmNlSWQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUGFydCA9IElCYXNlUGFydCB8IElQaWxsQ2FuZGlkYXRlUGFydCB8IElQaWxsUGFydDtcblxuYWJzdHJhY3QgY2xhc3MgQmFzZVBhcnQge1xuICAgIHByb3RlY3RlZCBfdGV4dDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodGV4dCA9IFwiXCIpIHtcbiAgICAgICAgdGhpcy5fdGV4dCA9IHRleHQ7XG4gICAgfVxuXG4gICAgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIsIGlucHV0VHlwZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGFjY2VwdHNSZW1vdmFsKHBvc2l0aW9uOiBudW1iZXIsIGNocjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG1lcmdlKHBhcnQ6IFBhcnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHNwbGl0KG9mZnNldDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHNwbGl0VGV4dCA9IHRoaXMudGV4dC5zdWJzdHIob2Zmc2V0KTtcbiAgICAgICAgdGhpcy5fdGV4dCA9IHRoaXMudGV4dC5zdWJzdHIoMCwgb2Zmc2V0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQbGFpblBhcnQoc3BsaXRUZXh0KTtcbiAgICB9XG5cbiAgICAvLyByZW1vdmVzIGxlbiBjaGFycywgb3IgcmV0dXJucyB0aGUgcGxhaW4gdGV4dCB0aGlzIHBhcnQgc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGhcbiAgICAvLyBpZiB0aGUgcGFydCB3b3VsZCBiZWNvbWUgaW52YWxpZCBpZiBpdCByZW1vdmVkIGV2ZXJ5dGhpbmcuXG4gICAgcmVtb3ZlKG9mZnNldDogbnVtYmVyLCBsZW46IG51bWJlcikge1xuICAgICAgICAvLyB2YWxpZGF0ZVxuICAgICAgICBjb25zdCBzdHJXaXRoUmVtb3ZhbCA9IHRoaXMudGV4dC5zdWJzdHIoMCwgb2Zmc2V0KSArIHRoaXMudGV4dC5zdWJzdHIob2Zmc2V0ICsgbGVuKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IG9mZnNldDsgaSA8IChsZW4gKyBvZmZzZXQpOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGNociA9IHRoaXMudGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWNjZXB0c1JlbW92YWwoaSwgY2hyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHJXaXRoUmVtb3ZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90ZXh0ID0gc3RyV2l0aFJlbW92YWw7XG4gICAgfVxuXG4gICAgLy8gYXBwZW5kIHN0ciwgcmV0dXJucyB0aGUgcmVtYWluaW5nIHN0cmluZyBpZiBhIGNoYXJhY3RlciB3YXMgcmVqZWN0ZWQuXG4gICAgYXBwZW5kVW50aWxSZWplY3RlZChzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGNociA9IHN0ci5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWNjZXB0c0luc2VydGlvbihjaHIsIG9mZnNldCArIGksIGlucHV0VHlwZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90ZXh0ID0gdGhpcy5fdGV4dCArIHN0ci5zdWJzdHIoMCwgaSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdGV4dCA9IHRoaXMuX3RleHQgKyBzdHI7XG4gICAgfVxuXG4gICAgLy8gaW5zZXJ0cyBzdHIgYXQgb2Zmc2V0IGlmIGFsbCB0aGUgY2hhcmFjdGVycyBpbiBzdHIgd2VyZSBhY2NlcHRlZCwgb3RoZXJ3aXNlIGRvbid0IGRvIGFueXRoaW5nXG4gICAgLy8gcmV0dXJuIHdoZXRoZXIgdGhlIHN0ciB3YXMgYWNjZXB0ZWQgb3Igbm90LlxuICAgIHZhbGlkYXRlQW5kSW5zZXJ0KG9mZnNldDogbnVtYmVyLCBzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGNociA9IHN0ci5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWNjZXB0c0luc2VydGlvbihjaHIsIG9mZnNldCArIGksIGlucHV0VHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmVmb3JlSW5zZXJ0ID0gdGhpcy5fdGV4dC5zdWJzdHIoMCwgb2Zmc2V0KTtcbiAgICAgICAgY29uc3QgYWZ0ZXJJbnNlcnQgPSB0aGlzLl90ZXh0LnN1YnN0cihvZmZzZXQpO1xuICAgICAgICB0aGlzLl90ZXh0ID0gYmVmb3JlSW5zZXJ0ICsgc3RyICsgYWZ0ZXJJbnNlcnQ7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNyZWF0ZUF1dG9Db21wbGV0ZSh1cGRhdGVDYWxsYmFjazogVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHt9XG5cbiAgICB0cmltKGxlbjogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IHRoaXMuX3RleHQuc3Vic3RyKGxlbik7XG4gICAgICAgIHRoaXMuX3RleHQgPSB0aGlzLl90ZXh0LnN1YnN0cigwLCBsZW4pO1xuICAgICAgICByZXR1cm4gcmVtYWluaW5nO1xuICAgIH1cblxuICAgIGdldCB0ZXh0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dDtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBnZXQgdHlwZSgpOiBUeXBlO1xuXG4gICAgZ2V0IGNhbkVkaXQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy50eXBlfSgke3RoaXMudGV4dH0pYDtcbiAgICB9XG5cbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFBhcnQge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlIGFzIElTZXJpYWxpemVkUGFydFtcInR5cGVcIl0sXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnRleHQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYWJzdHJhY3QgdXBkYXRlRE9NTm9kZShub2RlOiBOb2RlKTtcbiAgICBhYnN0cmFjdCBjYW5VcGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpO1xuICAgIGFic3RyYWN0IHRvRE9NTm9kZSgpOiBOb2RlO1xufVxuXG5hYnN0cmFjdCBjbGFzcyBQbGFpbkJhc2VQYXJ0IGV4dGVuZHMgQmFzZVBhcnQge1xuICAgIGFjY2VwdHNJbnNlcnRpb24oY2hyOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyLCBpbnB1dFR5cGU6IHN0cmluZykge1xuICAgICAgICBpZiAoY2hyID09PSBcIlxcblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gd2hlbiBub3QgcGFzdGluZyBvciBkcm9wcGluZyB0ZXh0LCByZWplY3QgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBzdGFydCBhIHBpbGwgY2FuZGlkYXRlXG4gICAgICAgIGlmIChpbnB1dFR5cGUgIT09IFwiaW5zZXJ0RnJvbVBhc3RlXCIgJiYgaW5wdXRUeXBlICE9PSBcImluc2VydEZyb21Ecm9wXCIpIHtcbiAgICAgICAgICAgIGlmIChjaHIgIT09IFwiQFwiICYmIGNociAhPT0gXCIjXCIgJiYgY2hyICE9PSBcIjpcIiAmJiBjaHIgIT09IFwiK1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNwbGl0IGlmIHdlIGFyZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwYXJ0IHRleHRcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9yIHNwbGl0IGlmIHRoZSBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBzcGFjZVxuICAgICAgICAgICAgLy8gb3IgaWYgaXQgaXMgYSArIGFuZCB0aGlzIGlzIGEgOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RleHRbb2Zmc2V0IC0gMV0gIT09IFwiIFwiICYmXG4gICAgICAgICAgICAgICAgKHRoaXMuX3RleHRbb2Zmc2V0IC0gMV0gIT09IFwiK1wiIHx8IGNociAhPT0gXCI6XCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRvRE9NTm9kZSgpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGV4dCk7XG4gICAgfVxuXG4gICAgbWVyZ2UocGFydCkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSB0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3RleHQgPSB0aGlzLnRleHQgKyBwYXJ0LnRleHQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdXBkYXRlRE9NTm9kZShub2RlOiBOb2RlKSB7XG4gICAgICAgIGlmIChub2RlLnRleHRDb250ZW50ICE9PSB0aGlzLnRleHQpIHtcbiAgICAgICAgICAgIG5vZGUudGV4dENvbnRlbnQgPSB0aGlzLnRleHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5VcGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFO1xuICAgIH1cbn1cblxuLy8gZXhwb3J0ZWQgZm9yIHVuaXQgdGVzdHMsIHNob3VsZCBvdGhlcndpc2Ugb25seSBiZSB1c2VkIHRocm91Z2ggUGFydENyZWF0b3JcbmV4cG9ydCBjbGFzcyBQbGFpblBhcnQgZXh0ZW5kcyBQbGFpbkJhc2VQYXJ0IGltcGxlbWVudHMgSUJhc2VQYXJ0IHtcbiAgICBnZXQgdHlwZSgpOiBJQmFzZVBhcnRbXCJ0eXBlXCJdIHtcbiAgICAgICAgcmV0dXJuIFR5cGUuUGxhaW47XG4gICAgfVxufVxuXG5hYnN0cmFjdCBjbGFzcyBQaWxsUGFydCBleHRlbmRzIEJhc2VQYXJ0IGltcGxlbWVudHMgSVBpbGxQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVzb3VyY2VJZDogc3RyaW5nLCBsYWJlbCkge1xuICAgICAgICBzdXBlcihsYWJlbCk7XG4gICAgfVxuXG4gICAgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gY2hyICE9PSBcIiBcIjtcbiAgICB9XG5cbiAgICBhY2NlcHRzUmVtb3ZhbChwb3NpdGlvbjogbnVtYmVyLCBjaHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gcG9zaXRpb24gIT09IDA7ICAvL2lmIHlvdSByZW1vdmUgaW5pdGlhbCAjIG9yIEAsIHBpbGwgc2hvdWxkIGJlY29tZSBwbGFpblxuICAgIH1cblxuICAgIHRvRE9NTm9kZSgpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJzcGVsbGNoZWNrXCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLmNsYXNzTmFtZTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGV4dCkpO1xuICAgICAgICB0aGlzLnNldEF2YXRhcihjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHVwZGF0ZURPTU5vZGUobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIGlmICh0ZXh0Tm9kZS50ZXh0Q29udGVudCAhPT0gdGhpcy50ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0Tm9kZS50ZXh0Q29udGVudCA9IHRoaXMudGV4dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5jbGFzc05hbWUgIT09IHRoaXMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTmFtZSA9IHRoaXMuY2xhc3NOYW1lO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0QXZhdGFyKG5vZGUpO1xuICAgIH1cblxuICAgIGNhblVwZGF0ZURPTU5vZGUobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmXG4gICAgICAgICAgICAgICBub2RlLm5vZGVOYW1lID09PSBcIlNQQU5cIiAmJlxuICAgICAgICAgICAgICAgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgbm9kZS5jaGlsZE5vZGVzWzBdLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERTtcbiAgICB9XG5cbiAgICAvLyBoZWxwZXIgbWV0aG9kIGZvciBzdWJjbGFzc2VzXG4gICAgX3NldEF2YXRhclZhcnMobm9kZTogSFRNTEVsZW1lbnQsIGF2YXRhclVybDogc3RyaW5nLCBpbml0aWFsTGV0dGVyOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgYXZhdGFyQmFja2dyb3VuZCA9IGB1cmwoJyR7YXZhdGFyVXJsfScpYDtcbiAgICAgICAgY29uc3QgYXZhdGFyTGV0dGVyID0gYCcke2luaXRpYWxMZXR0ZXJ9J2A7XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSB2YWx1ZSBpcyBjaGFuZ2luZyxcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHRoZSBhdmF0YXJzIGZsaWNrZXIgb24gZXZlcnkga2V5c3Ryb2tlIHdoaWxlIHVwZGF0aW5nLlxuICAgICAgICBpZiAobm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1hdmF0YXItYmFja2dyb3VuZFwiKSAhPT0gYXZhdGFyQmFja2dyb3VuZCkge1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tYXZhdGFyLWJhY2tncm91bmRcIiwgYXZhdGFyQmFja2dyb3VuZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0tYXZhdGFyLWxldHRlclwiKSAhPT0gYXZhdGFyTGV0dGVyKSB7XG4gICAgICAgICAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KFwiLS1hdmF0YXItbGV0dGVyXCIsIGF2YXRhckxldHRlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXJpYWxpemUoKTogSVNlcmlhbGl6ZWRQaWxsUGFydCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnRleHQsXG4gICAgICAgICAgICByZXNvdXJjZUlkOiB0aGlzLnJlc291cmNlSWQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0IGNhbkVkaXQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBnZXQgdHlwZSgpOiBJUGlsbFBhcnRbXCJ0eXBlXCJdO1xuXG4gICAgYWJzdHJhY3QgZ2V0IGNsYXNzTmFtZSgpOiBzdHJpbmc7XG5cbiAgICBhYnN0cmFjdCBzZXRBdmF0YXIobm9kZTogSFRNTEVsZW1lbnQpOiB2b2lkO1xufVxuXG5jbGFzcyBOZXdsaW5lUGFydCBleHRlbmRzIEJhc2VQYXJ0IGltcGxlbWVudHMgSUJhc2VQYXJ0IHtcbiAgICBhY2NlcHRzSW5zZXJ0aW9uKGNocjogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gb2Zmc2V0ID09PSAwICYmIGNociA9PT0gXCJcXG5cIjtcbiAgICB9XG5cbiAgICBhY2NlcHRzUmVtb3ZhbChwb3NpdGlvbjogbnVtYmVyLCBjaHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB0b0RPTU5vZGUoKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgfVxuXG4gICAgbWVyZ2UoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGVET01Ob2RlKCkge31cblxuICAgIGNhblVwZGF0ZURPTU5vZGUobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gXCJCUlwiO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCk6IElCYXNlUGFydFtcInR5cGVcIl0ge1xuICAgICAgICByZXR1cm4gVHlwZS5OZXdsaW5lO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbWFrZXMgdGhlIGN1cnNvciBza2lwIHRoaXMgcGFydCB3aGVuIGl0IGlzIGluc2VydGVkXG4gICAgLy8gcmF0aGVyIHRoYW4gdHJ5aW5nIHRvIGFwcGVuZCB0byBpdCwgd2hpY2ggaXMgd2hhdCB3ZSB3YW50LlxuICAgIC8vIEFzIGEgbmV3bGluZSBjYW4gYWxzbyBiZSBvbmx5IG9uZSBjaGFyYWN0ZXIsIGl0IG1ha2VzIHNlbnNlXG4gICAgLy8gYXMgaXQgY2FuIG9ubHkgYmUgb25lIGNoYXJhY3RlciBsb25nLiBUaGlzIGNhdXNlZCAjOTc0MS5cbiAgICBnZXQgY2FuRWRpdCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuY2xhc3MgUm9vbVBpbGxQYXJ0IGV4dGVuZHMgUGlsbFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHJlc291cmNlSWQ6IHN0cmluZywgbGFiZWw6IHN0cmluZywgcHJpdmF0ZSByb29tOiBSb29tKSB7XG4gICAgICAgIHN1cGVyKHJlc291cmNlSWQsIGxhYmVsKTtcbiAgICB9XG5cbiAgICBzZXRBdmF0YXIobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGluaXRpYWxMZXR0ZXIgPSBcIlwiO1xuICAgICAgICBsZXQgYXZhdGFyVXJsID0gQXZhdGFyLmF2YXRhclVybEZvclJvb20odGhpcy5yb29tLCAxNiwgMTYsIFwiY3JvcFwiKTtcbiAgICAgICAgaWYgKCFhdmF0YXJVcmwpIHtcbiAgICAgICAgICAgIGluaXRpYWxMZXR0ZXIgPSBBdmF0YXIuZ2V0SW5pdGlhbExldHRlcih0aGlzLnJvb20gPyB0aGlzLnJvb20ubmFtZSA6IHRoaXMucmVzb3VyY2VJZCk7XG4gICAgICAgICAgICBhdmF0YXJVcmwgPSBBdmF0YXIuZGVmYXVsdEF2YXRhclVybEZvclN0cmluZyh0aGlzLnJvb20gPyB0aGlzLnJvb20ucm9vbUlkIDogdGhpcy5yZXNvdXJjZUlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXRBdmF0YXJWYXJzKG5vZGUsIGF2YXRhclVybCwgaW5pdGlhbExldHRlcik7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKTogSVBpbGxQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLlJvb21QaWxsO1xuICAgIH1cblxuICAgIGdldCBjbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIm14X1Jvb21QaWxsIG14X1BpbGxcIjtcbiAgICB9XG59XG5cbmNsYXNzIEF0Um9vbVBpbGxQYXJ0IGV4dGVuZHMgUm9vbVBpbGxQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHJvb206IFJvb20pIHtcbiAgICAgICAgc3VwZXIodGV4dCwgdGV4dCwgcm9vbSk7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKTogSVBpbGxQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLkF0Um9vbVBpbGw7XG4gICAgfVxuXG4gICAgc2VyaWFsaXplKCk6IElTZXJpYWxpemVkUGlsbFBhcnQge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgdGV4dDogdGhpcy50ZXh0LFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuY2xhc3MgVXNlclBpbGxQYXJ0IGV4dGVuZHMgUGlsbFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHVzZXJJZCwgZGlzcGxheU5hbWUsIHByaXZhdGUgbWVtYmVyOiBSb29tTWVtYmVyKSB7XG4gICAgICAgIHN1cGVyKHVzZXJJZCwgZGlzcGxheU5hbWUpO1xuICAgIH1cblxuICAgIHNldEF2YXRhcihub2RlOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAoIXRoaXMubWVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMubWVtYmVyLm5hbWUgfHwgdGhpcy5tZW1iZXIudXNlcklkO1xuICAgICAgICBjb25zdCBkZWZhdWx0QXZhdGFyVXJsID0gQXZhdGFyLmRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmcodGhpcy5tZW1iZXIudXNlcklkKTtcbiAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gQXZhdGFyLmF2YXRhclVybEZvck1lbWJlcih0aGlzLm1lbWJlciwgMTYsIDE2LCBcImNyb3BcIik7XG4gICAgICAgIGxldCBpbml0aWFsTGV0dGVyID0gXCJcIjtcbiAgICAgICAgaWYgKGF2YXRhclVybCA9PT0gZGVmYXVsdEF2YXRhclVybCkge1xuICAgICAgICAgICAgaW5pdGlhbExldHRlciA9IEF2YXRhci5nZXRJbml0aWFsTGV0dGVyKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldEF2YXRhclZhcnMobm9kZSwgYXZhdGFyVXJsLCBpbml0aWFsTGV0dGVyKTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpOiBJUGlsbFBhcnRbXCJ0eXBlXCJdIHtcbiAgICAgICAgcmV0dXJuIFR5cGUuVXNlclBpbGw7XG4gICAgfVxuXG4gICAgZ2V0IGNsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwibXhfVXNlclBpbGwgbXhfUGlsbFwiO1xuICAgIH1cbn1cblxuY2xhc3MgUGlsbENhbmRpZGF0ZVBhcnQgZXh0ZW5kcyBQbGFpbkJhc2VQYXJ0IGltcGxlbWVudHMgSVBpbGxDYW5kaWRhdGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHByaXZhdGUgYXV0b0NvbXBsZXRlQ3JlYXRvcjogSUF1dG9jb21wbGV0ZUNyZWF0b3IpIHtcbiAgICAgICAgc3VwZXIodGV4dCk7XG4gICAgfVxuXG4gICAgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IuY3JlYXRlKHVwZGF0ZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBhY2NlcHRzSW5zZXJ0aW9uKGNocjogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgaW5wdXRUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuYWNjZXB0c0luc2VydGlvbihjaHIsIG9mZnNldCwgaW5wdXRUeXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1lcmdlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKTogSVBpbGxDYW5kaWRhdGVQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLlBpbGxDYW5kaWRhdGU7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcihnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50OiBHZXRBdXRvY29tcGxldGVyQ29tcG9uZW50LCB1cGRhdGVRdWVyeTogVXBkYXRlUXVlcnkpIHtcbiAgICByZXR1cm4gKHBhcnRDcmVhdG9yOiBQYXJ0Q3JlYXRvcikgPT4ge1xuICAgICAgICByZXR1cm4gKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWwoXG4gICAgICAgICAgICAgICAgdXBkYXRlQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgZ2V0QXV0b2NvbXBsZXRlckNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB1cGRhdGVRdWVyeSxcbiAgICAgICAgICAgICAgICBwYXJ0Q3JlYXRvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxudHlwZSBBdXRvQ29tcGxldGVDcmVhdG9yID0gUmV0dXJuVHlwZTx0eXBlb2YgZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcj47XG5cbmludGVyZmFjZSBJQXV0b2NvbXBsZXRlQ3JlYXRvciB7XG4gICAgY3JlYXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbn1cblxuZXhwb3J0IGNsYXNzIFBhcnRDcmVhdG9yIHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgYXV0b0NvbXBsZXRlQ3JlYXRvcjogSUF1dG9jb21wbGV0ZUNyZWF0b3I7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvb206IFJvb20sIHByaXZhdGUgY2xpZW50OiBNYXRyaXhDbGllbnQsIGF1dG9Db21wbGV0ZUNyZWF0b3I6IEF1dG9Db21wbGV0ZUNyZWF0b3IgPSBudWxsKSB7XG4gICAgICAgIC8vIHByZS1jcmVhdGUgdGhlIGNyZWF0b3IgYXMgYW4gb2JqZWN0IGV2ZW4gd2l0aG91dCBjYWxsYmFjayBzbyBpdCBjYW4gYWxyZWFkeSBiZSBwYXNzZWRcbiAgICAgICAgLy8gdG8gUGlsbENhbmRpZGF0ZVBhcnQgKGUuZy4gd2hpbGUgZGVzZXJpYWxpemluZykgYW5kIHNldCBsYXRlciBvblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IgPSB7Y3JlYXRlOiBhdXRvQ29tcGxldGVDcmVhdG9yICYmIGF1dG9Db21wbGV0ZUNyZWF0b3IodGhpcyl9O1xuICAgIH1cblxuICAgIHNldEF1dG9Db21wbGV0ZUNyZWF0b3IoYXV0b0NvbXBsZXRlQ3JlYXRvcjogQXV0b0NvbXBsZXRlQ3JlYXRvcikge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IuY3JlYXRlID0gYXV0b0NvbXBsZXRlQ3JlYXRvcih0aGlzKTtcbiAgICB9XG5cbiAgICBjcmVhdGVQYXJ0Rm9ySW5wdXQoaW5wdXQ6IHN0cmluZywgcGFydEluZGV4OiBudW1iZXIsIGlucHV0VHlwZT86IHN0cmluZyk6IFBhcnQge1xuICAgICAgICBzd2l0Y2ggKGlucHV0WzBdKSB7XG4gICAgICAgICAgICBjYXNlIFwiI1wiOlxuICAgICAgICAgICAgY2FzZSBcIkBcIjpcbiAgICAgICAgICAgIGNhc2UgXCI6XCI6XG4gICAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBpbGxDYW5kaWRhdGUoXCJcIik7XG4gICAgICAgICAgICBjYXNlIFwiXFxuXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOZXdsaW5lUGFydCgpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBsYWluUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlRGVmYXVsdFBhcnQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYWluKHRleHQpO1xuICAgIH1cblxuICAgIGRlc2VyaWFsaXplUGFydChwYXJ0OiBTZXJpYWxpemVkUGFydCk6IFBhcnQge1xuICAgICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBUeXBlLlBsYWluOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsYWluKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuTmV3bGluZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZXdsaW5lKCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuQXRSb29tUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdFJvb21QaWxsKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuUGlsbENhbmRpZGF0ZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5waWxsQ2FuZGlkYXRlKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuUm9vbVBpbGw6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vbVBpbGwocGFydC5yZXNvdXJjZUlkKTtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Vc2VyUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyUGlsbChwYXJ0LnRleHQsIHBhcnQucmVzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGFpbih0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQbGFpblBhcnQodGV4dCk7XG4gICAgfVxuXG4gICAgbmV3bGluZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOZXdsaW5lUGFydChcIlxcblwiKTtcbiAgICB9XG5cbiAgICBwaWxsQ2FuZGlkYXRlKHRleHQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFBpbGxDYW5kaWRhdGVQYXJ0KHRleHQsIHRoaXMuYXV0b0NvbXBsZXRlQ3JlYXRvcik7XG4gICAgfVxuXG4gICAgcm9vbVBpbGwoYWxpYXM6IHN0cmluZywgcm9vbUlkPzogc3RyaW5nKSB7XG4gICAgICAgIGxldCByb29tO1xuICAgICAgICBpZiAocm9vbUlkIHx8IGFsaWFzWzBdICE9PSBcIiNcIikge1xuICAgICAgICAgICAgcm9vbSA9IHRoaXMuY2xpZW50LmdldFJvb20ocm9vbUlkIHx8IGFsaWFzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvb20gPSB0aGlzLmNsaWVudC5nZXRSb29tcygpLmZpbmQoKHIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci5nZXRDYW5vbmljYWxBbGlhcygpID09PSBhbGlhcyB8fFxuICAgICAgICAgICAgICAgICAgICAgICByLmdldEFsdEFsaWFzZXMoKS5pbmNsdWRlcyhhbGlhcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJvb21QaWxsUGFydChhbGlhcywgcm9vbSA/IHJvb20ubmFtZSA6IGFsaWFzLCByb29tKTtcbiAgICB9XG5cbiAgICBhdFJvb21QaWxsKHRleHQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IEF0Um9vbVBpbGxQYXJ0KHRleHQsIHRoaXMucm9vbSk7XG4gICAgfVxuXG4gICAgdXNlclBpbGwoZGlzcGxheU5hbWU6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gdGhpcy5yb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICByZXR1cm4gbmV3IFVzZXJQaWxsUGFydCh1c2VySWQsIGRpc3BsYXlOYW1lLCBtZW1iZXIpO1xuICAgIH1cblxuICAgIGNyZWF0ZU1lbnRpb25QYXJ0cyhpbnNlcnRUcmFpbGluZ0NoYXJhY3RlcjogYm9vbGVhbiwgZGlzcGxheU5hbWU6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcGlsbCA9IHRoaXMudXNlclBpbGwoZGlzcGxheU5hbWUsIHVzZXJJZCk7XG4gICAgICAgIGNvbnN0IHBvc3RmaXggPSB0aGlzLnBsYWluKGluc2VydFRyYWlsaW5nQ2hhcmFjdGVyID8gXCI6IFwiIDogXCIgXCIpO1xuICAgICAgICByZXR1cm4gW3BpbGwsIHBvc3RmaXhdO1xuICAgIH1cbn1cblxuLy8gcGFydCBjcmVhdG9yIHRoYXQgc3VwcG9ydCBhdXRvIGNvbXBsZXRlIGZvciAvY29tbWFuZHMsXG4vLyB1c2VkIGluIFNlbmRNZXNzYWdlQ29tcG9zZXJcbmV4cG9ydCBjbGFzcyBDb21tYW5kUGFydENyZWF0b3IgZXh0ZW5kcyBQYXJ0Q3JlYXRvciB7XG4gICAgY3JlYXRlUGFydEZvcklucHV0KHRleHQ6IHN0cmluZywgcGFydEluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgLy8gYXQgYmVnaW5uaW5nIGFuZCBzdGFydHMgd2l0aCAvPyBjcmVhdGVcbiAgICAgICAgaWYgKHBhcnRJbmRleCA9PT0gMCAmJiB0ZXh0WzBdID09PSBcIi9cIikge1xuICAgICAgICAgICAgLy8gdGV4dCB3aWxsIGJlIGluc2VydGVkIGJ5IG1vZGVsLCBzbyBwYXNzIGVtcHR5IHN0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWFuZChcIlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5jcmVhdGVQYXJ0Rm9ySW5wdXQodGV4dCwgcGFydEluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbW1hbmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tbWFuZFBhcnQodGV4dCwgdGhpcy5hdXRvQ29tcGxldGVDcmVhdG9yKTtcbiAgICB9XG5cbiAgICBkZXNlcmlhbGl6ZVBhcnQocGFydDogUGFydCk6IFBhcnQge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSBcImNvbW1hbmRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWFuZChwYXJ0LnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmRlc2VyaWFsaXplUGFydChwYXJ0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgQ29tbWFuZFBhcnQgZXh0ZW5kcyBQaWxsQ2FuZGlkYXRlUGFydCB7XG4gICAgZ2V0IHR5cGUoKTogSVBpbGxDYW5kaWRhdGVQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLkNvbW1hbmQ7XG4gICAgfVxufVxuIl19