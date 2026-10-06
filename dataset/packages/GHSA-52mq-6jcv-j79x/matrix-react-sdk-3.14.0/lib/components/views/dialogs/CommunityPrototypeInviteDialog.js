"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _arrays = require("../../../utils/arrays");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _InviteDialog = _interopRequireDefault(require("./InviteDialog"));

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _contentRepo = require("matrix-js-sdk/src/content-repo");

var _RoomInvite = require("../../../RoomInvite");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("./ErrorDialog"));

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class CommunityPrototypeInviteDialog extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "onSubmit", async (ev
    /*: FormEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        busy: true
      });

      try {
        const targets = [...this.state.emailTargets, ...this.state.userTargets];
        const result = await (0, _RoomInvite.inviteMultipleToRoom)(this.props.roomId, targets);

        const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

        const success = (0, _RoomInvite.showAnyInviteErrors)(result.states, room, result.inviter);

        if (success) {
          this.props.onFinished(true);
        } else {
          this.setState({
            busy: false
          });
        }
      } catch (e) {
        this.setState({
          busy: false
        });
        console.error(e);

        _Modal.default.createTrackedDialog('Failed to invite', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Failed to invite"),
          description: e && e.message ? e.message : (0, _languageHandler._t)("Operation failed")
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAddressChange", (ev
    /*: ChangeEvent<HTMLInputElement>*/
    , index
    /*: number*/
    ) => {
      const targets = (0, _arrays.arrayFastClone)(this.state.emailTargets);

      if (index >= targets.length) {
        targets.push(ev.target.value);
      } else {
        targets[index] = ev.target.value;
      }

      this.setState({
        emailTargets: targets
      });
    });
    (0, _defineProperty2.default)(this, "onAddressBlur", (index
    /*: number*/
    ) => {
      const targets = (0, _arrays.arrayFastClone)(this.state.emailTargets);
      if (index >= targets.length) return; // not important

      if (targets[index].trim() === "") {
        targets.splice(index, 1);
        this.setState({
          emailTargets: targets
        });
      }
    });
    (0, _defineProperty2.default)(this, "onShowPeopleClick", () => {
      this.setState({
        showPeople: !this.state.showPeople
      });
    });
    (0, _defineProperty2.default)(this, "setPersonToggle", (person
    /*: IPerson*/
    , selected
    /*: boolean*/
    ) => {
      const targets = (0, _arrays.arrayFastClone)(this.state.userTargets);

      if (selected && !targets.includes(person.userId)) {
        targets.push(person.userId);
      } else if (!selected && targets.includes(person.userId)) {
        targets.splice(targets.indexOf(person.userId), 1);
      }

      this.setState({
        userTargets: targets
      });
    });
    (0, _defineProperty2.default)(this, "onShowMorePeople", () => {
      this.setState({
        numPeople: this.state.numPeople + 5
      }); // arbitrary increase
    });
    this.state = {
      emailTargets: [],
      userTargets: [],
      showPeople: false,
      people: this.buildSuggestions(),
      numPeople: 5,
      // arbitrary default
      busy: false
    };
  }

  buildSuggestions()
  /*: IPerson[]*/
  {
    const alreadyInvited = new Set([_MatrixClientPeg.MatrixClientPeg.get().getUserId(), _SdkConfig.default.get()['welcomeUserId']]);

    if (this.props.roomId) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

      if (!room) throw new Error("Room ID given to InviteDialog does not look like a room");
      room.getMembersWithMembership('invite').forEach(m => alreadyInvited.add(m.userId));
      room.getMembersWithMembership('join').forEach(m => alreadyInvited.add(m.userId)); // add banned users, so we don't try to invite them

      room.getMembersWithMembership('ban').forEach(m => alreadyInvited.add(m.userId));
    }

    return _InviteDialog.default.buildRecents(alreadyInvited);
  }

  renderPerson(person
  /*: IPerson*/
  , key
  /*: any*/
  ) {
    const avatarSize = 36;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CommunityPrototypeInviteDialog_person",
      key: key
    }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      url: (0, _contentRepo.getHttpUriForMxc)(_MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl(), person.user.getMxcAvatarUrl(), avatarSize, avatarSize, "crop"),
      name: person.user.name,
      idName: person.user.userId,
      width: avatarSize,
      height: avatarSize
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CommunityPrototypeInviteDialog_personIdentifiers"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CommunityPrototypeInviteDialog_personName"
    }, person.user.name), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CommunityPrototypeInviteDialog_personId"
    }, person.userId)), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      onChange: e => this.setPersonToggle(person, e.target.checked)
    }));
  }

  render() {
    const emailAddresses = [];
    this.state.emailTargets.forEach((address, i) => {
      emailAddresses.push( /*#__PURE__*/_react.default.createElement(_Field.default, {
        key: i,
        value: address,
        onChange: e => this.onAddressChange(e, i),
        label: (0, _languageHandler._t)("Email address"),
        placeholder: (0, _languageHandler._t)("Email address"),
        onBlur: () => this.onAddressBlur(i)
      }));
    }); // Push a clean input

    emailAddresses.push( /*#__PURE__*/_react.default.createElement(_Field.default, {
      key: emailAddresses.length,
      value: "",
      onChange: e => this.onAddressChange(e, emailAddresses.length),
      label: emailAddresses.length > 0 ? (0, _languageHandler._t)("Add another email") : (0, _languageHandler._t)("Email address"),
      placeholder: emailAddresses.length > 0 ? (0, _languageHandler._t)("Add another email") : (0, _languageHandler._t)("Email address")
    }));
    let peopleIntro = null;
    const people = [];

    if (this.state.showPeople) {
      const humansToPresent = this.state.people.slice(0, this.state.numPeople);
      humansToPresent.forEach((person, i) => {
        people.push(this.renderPerson(person, i));
      });

      if (humansToPresent.length < this.state.people.length) {
        people.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: this.onShowMorePeople,
          kind: "link",
          key: "more",
          className: "mx_CommunityPrototypeInviteDialog_morePeople"
        }, (0, _languageHandler._t)("Show more")));
      }
    }

    if (this.state.people.length > 0) {
      peopleIntro = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CommunityPrototypeInviteDialog_people"
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("People you know on %(brand)s", {
        brand: _SdkConfig.default.get().brand
      })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onShowPeopleClick
      }, this.state.showPeople ? (0, _languageHandler._t)("Hide") : (0, _languageHandler._t)("Show")));
    }

    let buttonText = (0, _languageHandler._t)("Skip");
    const targetCount = this.state.userTargets.length + this.state.emailTargets.length;

    if (targetCount > 0) {
      buttonText = (0, _languageHandler._t)("Send %(count)s invites", {
        count: targetCount
      });
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CommunityPrototypeInviteDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Invite people to join %(communityName)s", {
        communityName: this.props.communityName
      })
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, emailAddresses, peopleIntro, people, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this.onSubmit,
      disabled: this.state.busy,
      className: "mx_CommunityPrototypeInviteDialog_primaryButton"
    }, buttonText))));
  }

}

exports.default = CommunityPrototypeInviteDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ29tbXVuaXR5UHJvdG90eXBlSW52aXRlRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJDb21tdW5pdHlQcm90b3R5cGVJbnZpdGVEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNldFN0YXRlIiwiYnVzeSIsInRhcmdldHMiLCJzdGF0ZSIsImVtYWlsVGFyZ2V0cyIsInVzZXJUYXJnZXRzIiwicmVzdWx0Iiwicm9vbUlkIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJzdWNjZXNzIiwic3RhdGVzIiwiaW52aXRlciIsIm9uRmluaXNoZWQiLCJlIiwiY29uc29sZSIsImVycm9yIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsImluZGV4IiwibGVuZ3RoIiwicHVzaCIsInRhcmdldCIsInZhbHVlIiwidHJpbSIsInNwbGljZSIsInNob3dQZW9wbGUiLCJwZXJzb24iLCJzZWxlY3RlZCIsImluY2x1ZGVzIiwidXNlcklkIiwiaW5kZXhPZiIsIm51bVBlb3BsZSIsInBlb3BsZSIsImJ1aWxkU3VnZ2VzdGlvbnMiLCJhbHJlYWR5SW52aXRlZCIsIlNldCIsImdldFVzZXJJZCIsIlNka0NvbmZpZyIsIkVycm9yIiwiZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwIiwiZm9yRWFjaCIsIm0iLCJhZGQiLCJJbnZpdGVEaWFsb2ciLCJidWlsZFJlY2VudHMiLCJyZW5kZXJQZXJzb24iLCJrZXkiLCJhdmF0YXJTaXplIiwiZ2V0SG9tZXNlcnZlclVybCIsInVzZXIiLCJnZXRNeGNBdmF0YXJVcmwiLCJuYW1lIiwic2V0UGVyc29uVG9nZ2xlIiwiY2hlY2tlZCIsInJlbmRlciIsImVtYWlsQWRkcmVzc2VzIiwiYWRkcmVzcyIsImkiLCJvbkFkZHJlc3NDaGFuZ2UiLCJvbkFkZHJlc3NCbHVyIiwicGVvcGxlSW50cm8iLCJodW1hbnNUb1ByZXNlbnQiLCJzbGljZSIsIm9uU2hvd01vcmVQZW9wbGUiLCJicmFuZCIsIm9uU2hvd1Blb3BsZUNsaWNrIiwiYnV0dG9uVGV4dCIsInRhcmdldENvdW50IiwiY291bnQiLCJjb21tdW5pdHlOYW1lIiwib25TdWJtaXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF3Q2UsTUFBTUEsOEJBQU4sU0FBNkNDLGVBQU1DO0FBQW5EO0FBQWlGO0FBQzVGQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFnQjtBQUN2QixVQUFNQSxLQUFOO0FBRHVCLG9EQTJCUixPQUFPQztBQUFQO0FBQUEsU0FBeUI7QUFDeENBLE1BQUFBLEVBQUUsQ0FBQ0MsY0FBSDtBQUNBRCxNQUFBQSxFQUFFLENBQUNFLGVBQUg7QUFFQSxXQUFLQyxRQUFMLENBQWM7QUFBQ0MsUUFBQUEsSUFBSSxFQUFFO0FBQVAsT0FBZDs7QUFDQSxVQUFJO0FBQ0EsY0FBTUMsT0FBTyxHQUFHLENBQUMsR0FBRyxLQUFLQyxLQUFMLENBQVdDLFlBQWYsRUFBNkIsR0FBRyxLQUFLRCxLQUFMLENBQVdFLFdBQTNDLENBQWhCO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLE1BQU0sc0NBQXFCLEtBQUtWLEtBQUwsQ0FBV1csTUFBaEMsRUFBd0NMLE9BQXhDLENBQXJCOztBQUNBLGNBQU1NLElBQUksR0FBR0MsaUNBQWdCQyxHQUFoQixHQUFzQkMsT0FBdEIsQ0FBOEIsS0FBS2Ys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LEtBQUtzQyxRQURqQztBQUVJLE1BQUEsUUFBUSxFQUFFLEtBQUsxRSxLQUFMLENBQVdGLElBRnpCO0FBR0ksTUFBQSxTQUFTLEVBQUM7QUFIZCxPQUlFd0UsVUFKRixDQUpKLENBREosQ0FMSixDQURKO0FBb0JIOztBQWhNMkYiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2hhbmdlRXZlbnQsIEZvcm1FdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7IFJvb21NZW1iZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyXCI7XG5pbXBvcnQgSW52aXRlRGlhbG9nIGZyb20gXCIuL0ludml0ZURpYWxvZ1wiO1xuaW1wb3J0IEJhc2VBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvQmFzZUF2YXRhclwiO1xuaW1wb3J0IHtnZXRIdHRwVXJpRm9yTXhjfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY29udGVudC1yZXBvXCI7XG5pbXBvcnQge2ludml0ZU11bHRpcGxlVG9Sb29tLCBzaG93QW55SW52aXRlRXJyb3JzfSBmcm9tIFwiLi4vLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IFN0eWxlZENoZWNrYm94IGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRDaGVja2JveFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuL0Vycm9yRGlhbG9nXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xuICAgIGNvbW11bml0eU5hbWU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElQZXJzb24ge1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIHVzZXI6IFJvb21NZW1iZXI7XG4gICAgbGFzdEFjdGl2ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBlbWFpbFRhcmdldHM6IHN0cmluZ1tdO1xuICAgIHVzZXJUYXJnZXRzOiBzdHJpbmdbXTtcbiAgICBzaG93UGVvcGxlOiBib29sZWFuO1xuICAgIHBlb3BsZTogSVBlcnNvbltdO1xuICAgIG51bVBlb3BsZTogbnVtYmVyO1xuICAgIGJ1c3k6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW11bml0eVByb3RvdHlwZUludml0ZURpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZW1haWxUYXJnZXRzOiBbXSxcbiAgICAgICAgICAgIHVzZXJUYXJnZXRzOiBbXSxcbiAgICAgICAgICAgIHNob3dQZW9wbGU6IGZhbHNlLFxuICAgICAgICAgICAgcGVvcGxlOiB0aGlzLmJ1aWxkU3VnZ2VzdGlvbnMoKSxcbiAgICAgICAgICAgIG51bVBlb3BsZTogNSwgLy8gYXJiaXRyYXJ5IGRlZmF1bHRcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYnVpbGRTdWdnZXN0aW9ucygpOiBJUGVyc29uW10ge1xuICAgICAgICBjb25zdCBhbHJlYWR5SW52aXRlZCA9IG5ldyBTZXQoW01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSwgU2RrQ29uZmlnLmdldCgpWyd3ZWxjb21lVXNlcklkJ11dKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFyb29tKSB0aHJvdyBuZXcgRXJyb3IoXCJSb29tIElEIGdpdmVuIHRvIEludml0ZURpYWxvZyBkb2VzIG5vdCBsb29rIGxpa2UgYSByb29tXCIpO1xuICAgICAgICAgICAgcm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoJ2ludml0ZScpLmZvckVhY2gobSA9PiBhbHJlYWR5SW52aXRlZC5hZGQobS51c2VySWQpKTtcbiAgICAgICAgICAgIHJvb20uZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwKCdqb2luJykuZm9yRWFjaChtID0+IGFscmVhZHlJbnZpdGVkLmFkZChtLnVzZXJJZCkpO1xuICAgICAgICAgICAgLy8gYWRkIGJhbm5lZCB1c2Vycywgc28gd2UgZG9uJ3QgdHJ5IHRvIGludml0ZSB0aGVtXG4gICAgICAgICAgICByb29tLmdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcCgnYmFuJykuZm9yRWFjaChtID0+IGFscmVhZHlJbnZpdGVkLmFkZChtLnVzZXJJZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIEludml0ZURpYWxvZy5idWlsZFJlY2VudHMoYWxyZWFkeUludml0ZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdWJtaXQgPSBhc3luYyAoZXY6IEZvcm1FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRzID0gWy4uLnRoaXMuc3RhdGUuZW1haWxUYXJnZXRzLCAuLi50aGlzLnN0YXRlLnVzZXJUYXJnZXRzXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGludml0ZU11bHRpcGxlVG9Sb29tKHRoaXMucHJvcHMucm9vbUlkLCB0YXJnZXRzKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgICAgICBjb25zdCBzdWNjZXNzID0gc2hvd0FueUludml0ZUVycm9ycyhyZXN1bHQuc3RhdGVzLCByb29tLCByZXN1bHQuaW52aXRlcik7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gaW52aXRlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIGludml0ZVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlICYmIGUubWVzc2FnZSkgPyBlLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFkZHJlc3NDaGFuZ2UgPSAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSBhcnJheUZhc3RDbG9uZSh0aGlzLnN0YXRlLmVtYWlsVGFyZ2V0cyk7XG4gICAgICAgIGlmIChpbmRleCA+PSB0YXJnZXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKGV2LnRhcmdldC52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRzW2luZGV4XSA9IGV2LnRhcmdldC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtlbWFpbFRhcmdldHM6IHRhcmdldHN9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFkZHJlc3NCbHVyID0gKGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IGFycmF5RmFzdENsb25lKHRoaXMuc3RhdGUuZW1haWxUYXJnZXRzKTtcbiAgICAgICAgaWYgKGluZGV4ID49IHRhcmdldHMubGVuZ3RoKSByZXR1cm47IC8vIG5vdCBpbXBvcnRhbnRcbiAgICAgICAgaWYgKHRhcmdldHNbaW5kZXhdLnRyaW0oKSA9PT0gXCJcIikge1xuICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZW1haWxUYXJnZXRzOiB0YXJnZXRzfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNob3dQZW9wbGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1Blb3BsZTogIXRoaXMuc3RhdGUuc2hvd1Blb3BsZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNldFBlcnNvblRvZ2dsZSA9IChwZXJzb246IElQZXJzb24sIHNlbGVjdGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSBhcnJheUZhc3RDbG9uZSh0aGlzLnN0YXRlLnVzZXJUYXJnZXRzKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkICYmICF0YXJnZXRzLmluY2x1ZGVzKHBlcnNvbi51c2VySWQpKSB7XG4gICAgICAgICAgICB0YXJnZXRzLnB1c2gocGVyc29uLnVzZXJJZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNlbGVjdGVkICYmIHRhcmdldHMuaW5jbHVkZXMocGVyc29uLnVzZXJJZCkpIHtcbiAgICAgICAgICAgIHRhcmdldHMuc3BsaWNlKHRhcmdldHMuaW5kZXhPZihwZXJzb24udXNlcklkKSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXNlclRhcmdldHM6IHRhcmdldHN9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJQZXJzb24ocGVyc29uOiBJUGVyc29uLCBrZXk6IGFueSkge1xuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gMzY7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbW11bml0eVByb3RvdHlwZUludml0ZURpYWxvZ19wZXJzb25cIiBrZXk9e2tleX0+XG4gICAgICAgICAgICAgICAgPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgdXJsPXtnZXRIdHRwVXJpRm9yTXhjKFxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEhvbWVzZXJ2ZXJVcmwoKSwgcGVyc29uLnVzZXIuZ2V0TXhjQXZhdGFyVXJsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJTaXplLCBhdmF0YXJTaXplLCBcImNyb3BcIil9XG4gICAgICAgICAgICAgICAgICAgIG5hbWU9e3BlcnNvbi51c2VyLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgIGlkTmFtZT17cGVyc29uLnVzZXIudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXthdmF0YXJTaXplfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Db21tdW5pdHlQcm90b3R5cGVJbnZpdGVEaWFsb2dfcGVyc29uSWRlbnRpZmllcnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQ29tbXVuaXR5UHJvdG90eXBlSW52aXRlRGlhbG9nX3BlcnNvbk5hbWVcIj57cGVyc29uLnVzZXIubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NvbW11bml0eVByb3RvdHlwZUludml0ZURpYWxvZ19wZXJzb25JZFwiPntwZXJzb24udXNlcklkfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3ggb25DaGFuZ2U9eyhlKSA9PiB0aGlzLnNldFBlcnNvblRvZ2dsZShwZXJzb24sIGUudGFyZ2V0LmNoZWNrZWQpfSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNob3dNb3JlUGVvcGxlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtudW1QZW9wbGU6IHRoaXMuc3RhdGUubnVtUGVvcGxlICsgNX0pOyAvLyBhcmJpdHJhcnkgaW5jcmVhc2VcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW1haWxBZGRyZXNzZXMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGF0ZS5lbWFpbFRhcmdldHMuZm9yRWFjaCgoYWRkcmVzcywgaSkgPT4ge1xuICAgICAgICAgICAgZW1haWxBZGRyZXNzZXMucHVzaCgoXG4gICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2FkZHJlc3N9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gdGhpcy5vbkFkZHJlc3NDaGFuZ2UoZSwgaSl9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVtYWlsIGFkZHJlc3NcIil9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIkVtYWlsIGFkZHJlc3NcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQmx1cj17KCkgPT4gdGhpcy5vbkFkZHJlc3NCbHVyKGkpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUHVzaCBhIGNsZWFuIGlucHV0XG4gICAgICAgIGVtYWlsQWRkcmVzc2VzLnB1c2goKFxuICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAga2V5PXtlbWFpbEFkZHJlc3Nlcy5sZW5ndGh9XG4gICAgICAgICAgICAgICAgdmFsdWU9e1wiXCJ9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB0aGlzLm9uQWRkcmVzc0NoYW5nZShlLCBlbWFpbEFkZHJlc3Nlcy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtlbWFpbEFkZHJlc3Nlcy5sZW5ndGggPiAwID8gX3QoXCJBZGQgYW5vdGhlciBlbWFpbFwiKSA6IF90KFwiRW1haWwgYWRkcmVzc1wiKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17ZW1haWxBZGRyZXNzZXMubGVuZ3RoID4gMCA/IF90KFwiQWRkIGFub3RoZXIgZW1haWxcIikgOiBfdChcIkVtYWlsIGFkZHJlc3NcIil9XG4gICAgICAgICAgICAvPlxuICAgICAgICApKTtcblxuICAgICAgICBsZXQgcGVvcGxlSW50cm8gPSBudWxsO1xuICAgICAgICBjb25zdCBwZW9wbGUgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd1Blb3BsZSkge1xuICAgICAgICAgICAgY29uc3QgaHVtYW5zVG9QcmVzZW50ID0gdGhpcy5zdGF0ZS5wZW9wbGUuc2xpY2UoMCwgdGhpcy5zdGF0ZS5udW1QZW9wbGUpO1xuICAgICAgICAgICAgaHVtYW5zVG9QcmVzZW50LmZvckVhY2goKHBlcnNvbiwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHBlb3BsZS5wdXNoKHRoaXMucmVuZGVyUGVyc29uKHBlcnNvbiwgaSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaHVtYW5zVG9QcmVzZW50Lmxlbmd0aCA8IHRoaXMuc3RhdGUucGVvcGxlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHBlb3BsZS5wdXNoKChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaG93TW9yZVBlb3BsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCIga2V5PVwibW9yZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Db21tdW5pdHlQcm90b3R5cGVJbnZpdGVEaWFsb2dfbW9yZVBlb3BsZVwiXG4gICAgICAgICAgICAgICAgICAgID57X3QoXCJTaG93IG1vcmVcIil9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBlb3BsZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwZW9wbGVJbnRybyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbW11bml0eVByb3RvdHlwZUludml0ZURpYWxvZ19wZW9wbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFwiUGVvcGxlIHlvdSBrbm93IG9uICUoYnJhbmQpc1wiLCB7YnJhbmQ6IFNka0NvbmZpZy5nZXQoKS5icmFuZH0pfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblNob3dQZW9wbGVDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5zaG93UGVvcGxlID8gX3QoXCJIaWRlXCIpIDogX3QoXCJTaG93XCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJ1dHRvblRleHQgPSBfdChcIlNraXBcIik7XG4gICAgICAgIGNvbnN0IHRhcmdldENvdW50ID0gdGhpcy5zdGF0ZS51c2VyVGFyZ2V0cy5sZW5ndGggKyB0aGlzLnN0YXRlLmVtYWlsVGFyZ2V0cy5sZW5ndGg7XG4gICAgICAgIGlmICh0YXJnZXRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGJ1dHRvblRleHQgPSBfdChcIlNlbmQgJShjb3VudClzIGludml0ZXNcIiwge2NvdW50OiB0YXJnZXRDb3VudH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ29tbXVuaXR5UHJvdG90eXBlSW52aXRlRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiSW52aXRlIHBlb3BsZSB0byBqb2luICUoY29tbXVuaXR5TmFtZSlzXCIsIHtjb21tdW5pdHlOYW1lOiB0aGlzLnByb3BzLmNvbW11bml0eU5hbWV9KX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlbWFpbEFkZHJlc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwZW9wbGVJbnRyb31cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwZW9wbGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5vblN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0NvbW11bml0eVByb3RvdHlwZUludml0ZURpYWxvZ19wcmltYXJ5QnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID57YnV0dG9uVGV4dH08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=