"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _RoomInvite = require("../../../RoomInvite");

var _EventListSummary = _interopRequireDefault(require("./EventListSummary"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
var TransitionType;

(function (TransitionType) {
  TransitionType["Joined"] = "joined";
  TransitionType["Left"] = "left";
  TransitionType["JoinedAndLeft"] = "joined_and_left";
  TransitionType["LeftAndJoined"] = "left_and_joined";
  TransitionType["InviteReject"] = "invite_reject";
  TransitionType["InviteWithdrawal"] = "invite_withdrawal";
  TransitionType["Invited"] = "invited";
  TransitionType["Banned"] = "banned";
  TransitionType["Unbanned"] = "unbanned";
  TransitionType["Kicked"] = "kicked";
  TransitionType["ChangedName"] = "changed_name";
  TransitionType["ChangedAvatar"] = "changed_avatar";
  TransitionType["NoChange"] = "no_change";
})(TransitionType || (TransitionType = {}));

const SEP = ",";

class MemberEventListSummary extends _react.default.Component
/*:: <IProps>*/
{
  shouldComponentUpdate(nextProps) {
    // Update if
    //  - The number of summarised events has changed
    //  - or if the summary is about to toggle to become collapsed
    //  - or if there are fewEvents, meaning the child eventTiles are shown as-is
    return nextProps.events.length !== this.props.events.length || nextProps.events.length < this.props.threshold;
  }
  /**
   * Generate the text for users aggregated by their transition sequences (`eventAggregates`) where
   * the sequences are ordered by `orderedTransitionSequences`.
   * @param {object} eventAggregates a map of transition sequence to array of user display names
   * or user IDs.
   * @param {string[]} orderedTransitionSequences an array which is some ordering of
   * `Object.keys(eventAggregates)`.
   * @returns {string} the textual summary of the aggregated events that occurred.
   */


  generateSummary(eventAggregates
  /*: Record<string, string[]>*/
  , orderedTransitionSequences
  /*: string[]*/
  ) {
    const summaries = orderedTransitionSequences.map(transitions => {
      const userNames = eventAggregates[transitions];
      const nameList = this.renderNameList(userNames);
      const splitTransitions = transitions.split(SEP); // Some neighbouring transitions are common, so canonicalise some into "pair"
      // transitions

      const canonicalTransitions = MemberEventListSummary.getCanonicalTransitions(splitTransitions); // Transform into consecutive repetitions of the same transition (like 5
      // consecutive 'joined_and_left's)

      const coalescedTransitions = MemberEventListSummary.coalesceRepeatedTransitions(canonicalTransitions);
      const descs = coalescedTransitions.map(t => {
        return MemberEventListSummary.getDescriptionForTransition(t.transitionType, userNames.length, t.repeats);
      });
      const desc = (0, _FormattingUtils.formatCommaSeparatedList)(descs);
      return (0, _languageHandler._t)('%(nameList)s %(transitionList)s', {
        nameList: nameList,
        transitionList: desc
      });
    });

    if (!summaries) {
      return null;
    }

    return summaries.join(", ");
  }
  /**
   * @param {string[]} users an array of user display names or user IDs.
   * @returns {string} a comma-separated list that ends with "and [n] others" if there are
   * more items in `users` than `this.props.summaryLength`, which is the number of names
   * included before "and [n] others".
   */


  renderNameList(users
  /*: string[]*/
  ) {
    return (0, _FormattingUtils.formatCommaSeparatedList)(users, this.props.summaryLength);
  }
  /**
   * Canonicalise an array of transitions such that some pairs of transitions become
   * single transitions. For example an input ['joined','left'] would result in an output
   * ['joined_and_left'].
   * @param {string[]} transitions an array of transitions.
   * @returns {string[]} an array of transitions.
   */


  static getCanonicalTransitions(transitions
  /*: TransitionType[]*/
  )
  /*: TransitionType[]*/
  {
    const modMap = {
      [TransitionType.Joined]: {
        after: TransitionType.Left,
        newTransition: TransitionType.JoinedAndLeft
      },
      [TransitionType.Left]: {
        after: TransitionType.Joined,
        newTransition: TransitionType.LeftAndJoined
      } // $currentTransition : {
      //     'after' : $nextTransition,
      //     'newTransition' : 'new_transition_type',
      // },

    };
    const res
    /*: TransitionType[]*/
    = [];

    for (let i = 0; i < transitions.length; i++) {
      const t = transitions[i];
      const t2 = transitions[i + 1];
      let transition = t;

      if (i < transitions.length - 1 && modMap[t] && modMap[t].after === t2) {
        transition = modMap[t].newTransition;
        i++;
      }

      res.push(transition);
    }

    return res;
  }
  /**
   * Transform an array of transitions into an array of transitions and how many times
   * they are repeated consecutively.
   *
   * An array of 123 "joined_and_left" transitions, would result in:
   * ```
   * [{
   *   transitionType: "joined_and_left"
   *   repeats: 123
   * }]
   * ```
   * @param {string[]} transitions the array of transitions to transform.
   * @returns {object[]} an array of coalesced transitions.
   */


  static coalesceRepeatedTransitions(transitions
  /*: TransitionType[]*/
  ) {
    const res
    /*: {
                transitionType: TransitionType;
                repeats: number;
            }[]*/
    = [];

    for (let i = 0; i < transitions.length; i++) {
      if (res.length > 0 && res[res.length - 1].transitionType === transitions[i]) {
        res[res.length - 1].repeats += 1;
      } else {
        res.push({
          transitionType: transitions[i],
          repeats: 1
        });
      }
    }

    return res;
  }
  /**
   * For a certain transition, t, describe what happened to the users that
   * underwent the transition.
   * @param {string} t the transition type.
   * @param {number} userCount number of usernames
   * @param {number} repeats the number of times the transition was repeated in a row.
   * @returns {string} the written Human Readable equivalent of the transition.
   */


  static getDescriptionForTransition(t
  /*: TransitionType*/
  , userCount
  /*: number*/
  , repeats
  /*: number*/
  ) {
    // The empty interpolations 'severalUsers' and 'oneUser'
    // are there only to show translators to non-English languages
    // that the verb is conjugated to plural or singular Subject.
    let res = null;

    switch (t) {
      case "joined":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sjoined %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)sjoined %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "left":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sleft %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)sleft %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "joined_and_left":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sjoined and left %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)sjoined and left %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "left_and_joined":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sleft and rejoined %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)sleft and rejoined %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "invite_reject":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)srejected their invitations %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)srejected their invitation %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "invite_withdrawal":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)shad their invitations withdrawn %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)shad their invitation withdrawn %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "invited":
        res = userCount > 1 ? (0, _languageHandler._t)("were invited %(count)s times", {
          count: repeats
        }) : (0, _languageHandler._t)("was invited %(count)s times", {
          count: repeats
        });
        break;

      case "banned":
        res = userCount > 1 ? (0, _languageHandler._t)("were banned %(count)s times", {
          count: repeats
        }) : (0, _languageHandler._t)("was banned %(count)s times", {
          count: repeats
        });
        break;

      case "unbanned":
        res = userCount > 1 ? (0, _languageHandler._t)("were unbanned %(count)s times", {
          count: repeats
        }) : (0, _languageHandler._t)("was unbanned %(count)s times", {
          count: repeats
        });
        break;

      case "kicked":
        res = userCount > 1 ? (0, _languageHandler._t)("were kicked %(count)s times", {
          count: repeats
        }) : (0, _languageHandler._t)("was kicked %(count)s times", {
          count: repeats
        });
        break;

      case "changed_name":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)schanged their name %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)schanged their name %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "changed_avatar":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)schanged their avatar %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)schanged their avatar %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;

      case "no_change":
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)smade no changes %(count)s times", {
          severalUsers: "",
          count: repeats
        }) : (0, _languageHandler._t)("%(oneUser)smade no changes %(count)s times", {
          oneUser: "",
          count: repeats
        });
        break;
    }

    return res;
  }

  static getTransitionSequence(events
  /*: MatrixEvent[]*/
  ) {
    return events.map(MemberEventListSummary.getTransition);
  }
  /**
   * Label a given membership event, `e`, where `getContent().membership` has
   * changed for each transition allowed by the Matrix protocol. This attempts to
   * label the membership changes that occur in `../../../TextForEvent.js`.
   * @param {MatrixEvent} e the membership change event to label.
   * @returns {string?} the transition type given to this event. This defaults to `null`
   * if a transition is not recognised.
   */


  static getTransition(e
  /*: MatrixEvent*/
  )
  /*: TransitionType*/
  {
    if (e.mxEvent.getType() === 'm.room.third_party_invite') {
      // Handle 3pid invites the same as invites so they get bundled together
      if (!(0, _RoomInvite.isValid3pidInvite)(e.mxEvent)) {
        return TransitionType.InviteWithdrawal;
      }

      return TransitionType.Invited;
    }

    switch (e.mxEvent.getContent().membership) {
      case 'invite':
        return TransitionType.Invited;

      case 'ban':
        return TransitionType.Banned;

      case 'join':
        if (e.mxEvent.getPrevContent().membership === 'join') {
          if (e.mxEvent.getContent().displayname !== e.mxEvent.getPrevContent().displayname) {
            return TransitionType.ChangedName;
          } else if (e.mxEvent.getContent().avatar_url !== e.mxEvent.getPrevContent().avatar_url) {
            return TransitionType.ChangedAvatar;
          } // console.log("MELS ignoring duplicate membership join event");


          return TransitionType.NoChange;
        } else {
          return TransitionType.Joined;
        }

      case 'leave':
        if (e.mxEvent.getSender() === e.mxEvent.getStateKey()) {
          switch (e.mxEvent.getPrevContent().membership) {
            case 'invite':
              return TransitionType.InviteReject;

            default:
              return TransitionType.Left;
          }
        }

        switch (e.mxEvent.getPrevContent().membership) {
          case 'invite':
            return TransitionType.InviteWithdrawal;

          case 'ban':
            return TransitionType.Unbanned;
          // sender is not target and made the target leave, if not from invite/ban then this is a kick

          default:
            return TransitionType.Kicked;
        }

      default:
        return null;
    }
  }

  getAggregate(userEvents
  /*: Record<string, IUserEvents[]>*/
  ) {
    // A map of aggregate type to arrays of display names. Each aggregate type
    // is a comma-delimited string of transitions, e.g. "joined,left,kicked".
    // The array of display names is the array of users who went through that
    // sequence during eventsToRender.
    const aggregate
    /*: Record<string, string[]>*/
    = {// $aggregateType : []:string
    }; // A map of aggregate types to the indices that order them (the index of
    // the first event for a given transition sequence)

    const aggregateIndices
    /*: Record<string, number>*/
    = {// $aggregateType : int
    };
    const users = Object.keys(userEvents);
    users.forEach(userId => {
      const firstEvent = userEvents[userId][0];
      const displayName = firstEvent.displayName;
      const seq = MemberEventListSummary.getTransitionSequence(userEvents[userId]).join(SEP);

      if (!aggregate[seq]) {
        aggregate[seq] = [];
        aggregateIndices[seq] = -1;
      }

      aggregate[seq].push(displayName);

      if (aggregateIndices[seq] === -1 || firstEvent.index < aggregateIndices[seq]) {
        aggregateIndices[seq] = firstEvent.index;
      }
    });
    return {
      names: aggregate,
      indices: aggregateIndices
    };
  }

  render() {
    const eventsToRender = this.props.events; // Map user IDs to latest Avatar Member. ES6 Maps are ordered by when the key was created,
    // so this works perfectly for us to match event order whilst storing the latest Avatar Member

    const latestUserAvatarMember = new Map(); // Object mapping user IDs to an array of IUserEvents

    const userEvents
    /*: Record<string, IUserEvents[]>*/
    = {};
    eventsToRender.forEach((e, index) => {
      const userId = e.getStateKey(); // Initialise a user's events

      if (!userEvents[userId]) {
        userEvents[userId] = [];
      }

      if (e.target) {
        latestUserAvatarMember.set(userId, e.target);
      }

      let displayName = userId;

      if (e.getType() === 'm.room.third_party_invite') {
        displayName = e.getContent().display_name;
      } else if (e.target) {
        displayName = e.target.name;
      }

      userEvents[userId].push({
        mxEvent: e,
        displayName,
        index: index
      });
    });
    const aggregate = this.getAggregate(userEvents); // Sort types by order of lowest event index within sequence

    const orderedTransitionSequences = Object.keys(aggregate.names).sort((seq1, seq2) => aggregate.indices[seq1] - aggregate.indices[seq2]);
    return /*#__PURE__*/_react.default.createElement(_EventListSummary.default, {
      events: this.props.events,
      threshold: this.props.threshold,
      onToggle: this.props.onToggle,
      startExpanded: this.props.startExpanded,
      children: this.props.children,
      summaryMembers: [...latestUserAvatarMember.values()],
      summaryText: this.generateSummary(aggregate.names, orderedTransitionSequences)
    });
  }

}

exports.default = MemberEventListSummary;
(0, _defineProperty2.default)(MemberEventListSummary, "defaultProps", {
  summaryLength: 1,
  threshold: 3,
  avatarsMaxLength: 5
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL01lbWJlckV2ZW50TGlzdFN1bW1hcnkudHN4Il0sIm5hbWVzIjpbIlRyYW5zaXRpb25UeXBlIiwiU0VQIiwiTWVtYmVyRXZlbnRMaXN0U3VtbWFyeSIsIlJlYWN0IiwiQ29tcG9uZW50Iiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFByb3BzIiwiZXZlbnRzIiwibGVuZ3RoIiwicHJvcHMiLCJ0aHJlc2hvbGQiLCJnZW5lcmF0ZVN1bW1hcnkiLCJldmVudEFnZ3JlZ2F0ZXMiLCJvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyIsInN1bW1hcmllcyIsIm1hcCIsInRyYW5zaXRpb25zIiwidXNlck5hbWVzIiwibmFtZUxpc3QiLCJyZW5kZXJOYW1lTGlzdCIsInNwbGl0VHJhbnNpdGlvbnMiLCJzcGxpdCIsImNhbm9uaWNhbFRyYW5zaXRpb25zIiwiZ2V0Q2Fub25pY2FsVHJhbnNpdGlvbnMiLCJjb2FsZXNjZWRUcmFuc2l0aW9ucyIsImNvYWxlc2NlUmVwZWF0ZWRUcmFuc2l0aW9ucyIsImRlc2NzIiwidCIsImdldERlc2NyaXB0aW9uRm9yVHJhbnNpdGlvbiIsInRyYW5zaXRpb25UeXBlIiwicmVwZWF0cyIsImRlc2MiLCJ0cmFuc2l0aW9uTGlzdCIsImpvaW4iLCJ1c2VycyIsInN1bW1hcnlMZW5ndGgiLCJtb2RNYXAiLCJKb2luZWQiLCJhZnRlciIsIkxlZnQiLCJuZXdUcmFuc2l0aW9uIiwiSm9pbmVkQW5kTGVmdCIsIkxlZnRBbmRKb2luZWQiLCJyZXMiLCJpIiwidDIiLCJ0cmFuc2l0aW9uIiwicHVzaCIsInVzZXJDb3VudCIsInNldmVyYWxVc2VycyIsImNvdW50Iiwib25lVXNlciIsImdldFRyYW5zaXRpb25TZXF1ZW5jZSIsImdldFRyYW5zaXRpb24iLCJlIiwibXhFdmVudCIsImdldFR5cGUiLCJJbnZpdGVXaXRoZHJhd2FsIiwiSW52aXRlZCIsImdldENvbnRlbnQiLCJtZW1iZXJzaGlwIiwiQmFubmVkIiwiZ2V0UHJldkNvbnRlbnQiLCJkaXNwbGF5bmFtZSIsIkNoYW5nZWROYW1lIiwiYXZhdGFyX3VybCIsIkNoYW5nZWRBdmF0YXIiLCJOb0NoYW5nZSIsImdldFNlbmRlciIsImdldFN0YXRlS2V5IiwiSW52aXRlUmVqZWN0IiwiVW5iYW5uZWQiLCJLaWNrZWQiLCJnZXRBZ2dyZWdhdGUiLCJ1c2VyRXZlbnRzIiwiYWdncmVnYXRlIiwiYWdncmVnYXRlSW5kaWNlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwidXNlcklkIiwiZmlyc3RFdmVudCIsImRpc3BsYXlOYW1lIiwic2VxIiwiaW5kZXgiLCJuYW1lcyIsImluZGljZXMiLCJyZW5kZXIiLCJldmVudHNUb1JlbmRlciIsImxhdGVzdFVzZXJBdmF0YXJNZW1iZXIiLCJNYXAiLCJ0YXJnZXQiLCJzZXQiLCJkaXNwbGF5X25hbWUiLCJuYW1lIiwic29ydCIsInNlcTEiLCJzZXEyIiwib25Ub2dnbGUiLCJzdGFydEV4cGFuZGVkIiwiY2hpbGRyZW4iLCJ2YWx1ZXMiLCJhdmF0YXJzTWF4TGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQXFDS0EsYzs7V0FBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0dBQUFBLGMsS0FBQUEsYzs7QUFnQkwsTUFBTUMsR0FBRyxHQUFHLEdBQVo7O0FBRWUsTUFB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QUFXLEVBQUUsS0FBSzFGLGVBQUwsQ0FBcUJnRSxTQUFTLENBQUNVLEtBQS9CLEVBQXNDeEUsMEJBQXRDO0FBUFYsTUFBUDtBQVFIOztBQTFYdUU7Ozs4QkFBdkRYLHNCLGtCQUNLO0FBQ2xCaUMsRUFBQUEsYUFBYSxFQUFFLENBREc7QUFFbEJ6QixFQUFBQSxTQUFTLEVBQUUsQ0FGTztBQUdsQjRGLEVBQUFBLGdCQUFnQixFQUFFO0FBSEEsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdENoaWxkcmVuIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QgfSBmcm9tICcuLi8uLi8uLi91dGlscy9Gb3JtYXR0aW5nVXRpbHMnO1xuaW1wb3J0IHsgaXNWYWxpZDNwaWRJbnZpdGUgfSBmcm9tIFwiLi4vLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IEV2ZW50TGlzdFN1bW1hcnkgZnJvbSBcIi4vRXZlbnRMaXN0U3VtbWFyeVwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBBbiBhcnJheSBvZiBtZW1iZXIgZXZlbnRzIHRvIHN1bW1hcmlzZVxuICAgIGV2ZW50czogTWF0cml4RXZlbnRbXTtcbiAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2YgbmFtZXMgdG8gc2hvdyBpbiBlaXRoZXIgZWFjaCBzdW1tYXJ5IGUuZy4gMiB3b3VsZCByZXN1bHQgXCJBLCBCIGFuZCAyMzQgb3RoZXJzIGxlZnRcIlxuICAgIHN1bW1hcnlMZW5ndGg/OiBudW1iZXI7XG4gICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGF2YXRhcnMgdG8gZGlzcGxheSBpbiB0aGUgc3VtbWFyeVxuICAgIGF2YXRhcnNNYXhMZW5ndGg/OiBudW1iZXI7XG4gICAgLy8gVGhlIG1pbmltdW0gbnVtYmVyIG9mIGV2ZW50cyBuZWVkZWQgdG8gdHJpZ2dlciBzdW1tYXJpc2F0aW9uXG4gICAgdGhyZXNob2xkPzogbnVtYmVyLFxuICAgIC8vIFdoZXRoZXIgb3Igbm90IHRvIGJlZ2luIHdpdGggc3RhdGUuZXhwYW5kZWQ9dHJ1ZVxuICAgIHN0YXJ0RXhwYW5kZWQ/OiBib29sZWFuLFxuICAgIC8vIEFuIGFycmF5IG9mIEV2ZW50VGlsZXMgdG8gcmVuZGVyIHdoZW4gZXhwYW5kZWRcbiAgICBjaGlsZHJlbjogUmVhY3RDaGlsZHJlbjtcbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgTUVMUyBleHBhbnNpb24gaXMgdG9nZ2xlZFxuICAgIG9uVG9nZ2xlPygpOiB2b2lkLFxufVxuXG5pbnRlcmZhY2UgSVVzZXJFdmVudHMge1xuICAgIC8vIFRoZSBvcmlnaW5hbCBldmVudFxuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xuICAgIC8vIFRoZSBkaXNwbGF5IG5hbWUgb2YgdGhlIHVzZXIgKGlmIG5vdCwgdGhlbiB1c2VyIElEKVxuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG4gICAgLy8gVGhlIG9yaWdpbmFsIGluZGV4IG9mIHRoZSBldmVudCBpbiB0aGlzLnByb3BzLmV2ZW50c1xuICAgIGluZGV4OiBudW1iZXI7XG59XG5cbmVudW0gVHJhbnNpdGlvblR5cGUge1xuICAgIEpvaW5lZCA9IFwiam9pbmVkXCIsXG4gICAgTGVmdCA9IFwibGVmdFwiLFxuICAgIEpvaW5lZEFuZExlZnQgPSBcImpvaW5lZF9hbmRfbGVmdFwiLFxuICAgIExlZnRBbmRKb2luZWQgPSBcImxlZnRfYW5kX2pvaW5lZFwiLFxuICAgIEludml0ZVJlamVjdCA9IFwiaW52aXRlX3JlamVjdFwiLFxuICAgIEludml0ZVdpdGhkcmF3YWwgPSBcImludml0ZV93aXRoZHJhd2FsXCIsXG4gICAgSW52aXRlZCA9IFwiaW52aXRlZFwiLFxuICAgIEJhbm5lZCA9IFwiYmFubmVkXCIsXG4gICAgVW5iYW5uZWQgPSBcInVuYmFubmVkXCIsXG4gICAgS2lja2VkID0gXCJraWNrZWRcIixcbiAgICBDaGFuZ2VkTmFtZSA9IFwiY2hhbmdlZF9uYW1lXCIsXG4gICAgQ2hhbmdlZEF2YXRhciA9IFwiY2hhbmdlZF9hdmF0YXJcIixcbiAgICBOb0NoYW5nZSA9IFwibm9fY2hhbmdlXCIsXG59XG5cbmNvbnN0IFNFUCA9IFwiLFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZW1iZXJFdmVudExpc3RTdW1tYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHN1bW1hcnlMZW5ndGg6IDEsXG4gICAgICAgIHRocmVzaG9sZDogMyxcbiAgICAgICAgYXZhdGFyc01heExlbmd0aDogNSxcbiAgICB9O1xuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcykge1xuICAgICAgICAvLyBVcGRhdGUgaWZcbiAgICAgICAgLy8gIC0gVGhlIG51bWJlciBvZiBzdW1tYXJpc2VkIGV2ZW50cyBoYXMgY2hhbmdlZFxuICAgICAgICAvLyAgLSBvciBpZiB0aGUgc3VtbWFyeSBpcyBhYm91dCB0byB0b2dnbGUgdG8gYmVjb21lIGNvbGxhcHNlZFxuICAgICAgICAvLyAgLSBvciBpZiB0aGVyZSBhcmUgZmV3RXZlbnRzLCBtZWFuaW5nIHRoZSBjaGlsZCBldmVudFRpbGVzIGFyZSBzaG93biBhcy1pc1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgbmV4dFByb3BzLmV2ZW50cy5sZW5ndGggIT09IHRoaXMucHJvcHMuZXZlbnRzLmxlbmd0aCB8fFxuICAgICAgICAgICAgbmV4dFByb3BzLmV2ZW50cy5sZW5ndGggPCB0aGlzLnByb3BzLnRocmVzaG9sZFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHRoZSB0ZXh0IGZvciB1c2VycyBhZ2dyZWdhdGVkIGJ5IHRoZWlyIHRyYW5zaXRpb24gc2VxdWVuY2VzIChgZXZlbnRBZ2dyZWdhdGVzYCkgd2hlcmVcbiAgICAgKiB0aGUgc2VxdWVuY2VzIGFyZSBvcmRlcmVkIGJ5IGBvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlc2AuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50QWdncmVnYXRlcyBhIG1hcCBvZiB0cmFuc2l0aW9uIHNlcXVlbmNlIHRvIGFycmF5IG9mIHVzZXIgZGlzcGxheSBuYW1lc1xuICAgICAqIG9yIHVzZXIgSURzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IG9yZGVyZWRUcmFuc2l0aW9uU2VxdWVuY2VzIGFuIGFycmF5IHdoaWNoIGlzIHNvbWUgb3JkZXJpbmcgb2ZcbiAgICAgKiBgT2JqZWN0LmtleXMoZXZlbnRBZ2dyZWdhdGVzKWAuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHRleHR1YWwgc3VtbWFyeSBvZiB0aGUgYWdncmVnYXRlZCBldmVudHMgdGhhdCBvY2N1cnJlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlU3VtbWFyeShldmVudEFnZ3JlZ2F0ZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiwgb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXM6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcmllcyA9IG9yZGVyZWRUcmFuc2l0aW9uU2VxdWVuY2VzLm1hcCgodHJhbnNpdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lcyA9IGV2ZW50QWdncmVnYXRlc1t0cmFuc2l0aW9uc107XG4gICAgICAgICAgICBjb25zdCBuYW1lTGlzdCA9IHRoaXMucmVuZGVyTmFtZUxpc3QodXNlck5hbWVzKTtcblxuICAgICAgICAgICAgY29uc3Qgc3BsaXRUcmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLnNwbGl0KFNFUCkgYXMgVHJhbnNpdGlvblR5cGVbXTtcblxuICAgICAgICAgICAgLy8gU29tZSBuZWlnaGJvdXJpbmcgdHJhbnNpdGlvbnMgYXJlIGNvbW1vbiwgc28gY2Fub25pY2FsaXNlIHNvbWUgaW50byBcInBhaXJcIlxuICAgICAgICAgICAgLy8gdHJhbnNpdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IGNhbm9uaWNhbFRyYW5zaXRpb25zID0gTWVtYmVyRXZlbnRMaXN0U3VtbWFyeS5nZXRDYW5vbmljYWxUcmFuc2l0aW9ucyhzcGxpdFRyYW5zaXRpb25zKTtcbiAgICAgICAgICAgIC8vIFRyYW5zZm9ybSBpbnRvIGNvbnNlY3V0aXZlIHJlcGV0aXRpb25zIG9mIHRoZSBzYW1lIHRyYW5zaXRpb24gKGxpa2UgNVxuICAgICAgICAgICAgLy8gY29uc2VjdXRpdmUgJ2pvaW5lZF9hbmRfbGVmdCdzKVxuICAgICAgICAgICAgY29uc3QgY29hbGVzY2VkVHJhbnNpdGlvbnMgPSBNZW1iZXJFdmVudExpc3RTdW1tYXJ5LmNvYWxlc2NlUmVwZWF0ZWRUcmFuc2l0aW9ucyhjYW5vbmljYWxUcmFuc2l0aW9ucyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlc2NzID0gY29hbGVzY2VkVHJhbnNpdGlvbnMubWFwKCh0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1lbWJlckV2ZW50TGlzdFN1bW1hcnkuZ2V0RGVzY3JpcHRpb25Gb3JUcmFuc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0LnRyYW5zaXRpb25UeXBlLCB1c2VyTmFtZXMubGVuZ3RoLCB0LnJlcGVhdHMsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBkZXNjID0gZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0KGRlc2NzKTtcblxuICAgICAgICAgICAgcmV0dXJuIF90KCclKG5hbWVMaXN0KXMgJSh0cmFuc2l0aW9uTGlzdClzJywgeyBuYW1lTGlzdDogbmFtZUxpc3QsIHRyYW5zaXRpb25MaXN0OiBkZXNjIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXN1bW1hcmllcykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3VtbWFyaWVzLmpvaW4oXCIsIFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB1c2VycyBhbiBhcnJheSBvZiB1c2VyIGRpc3BsYXkgbmFtZXMgb3IgdXNlciBJRHMuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCB0aGF0IGVuZHMgd2l0aCBcImFuZCBbbl0gb3RoZXJzXCIgaWYgdGhlcmUgYXJlXG4gICAgICogbW9yZSBpdGVtcyBpbiBgdXNlcnNgIHRoYW4gYHRoaXMucHJvcHMuc3VtbWFyeUxlbmd0aGAsIHdoaWNoIGlzIHRoZSBudW1iZXIgb2YgbmFtZXNcbiAgICAgKiBpbmNsdWRlZCBiZWZvcmUgXCJhbmQgW25dIG90aGVyc1wiLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVuZGVyTmFtZUxpc3QodXNlcnM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QodXNlcnMsIHRoaXMucHJvcHMuc3VtbWFyeUxlbmd0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2Fub25pY2FsaXNlIGFuIGFycmF5IG9mIHRyYW5zaXRpb25zIHN1Y2ggdGhhdCBzb21lIHBhaXJzIG9mIHRyYW5zaXRpb25zIGJlY29tZVxuICAgICAqIHNpbmdsZSB0cmFuc2l0aW9ucy4gRm9yIGV4YW1wbGUgYW4gaW5wdXQgWydqb2luZWQnLCdsZWZ0J10gd291bGQgcmVzdWx0IGluIGFuIG91dHB1dFxuICAgICAqIFsnam9pbmVkX2FuZF9sZWZ0J10uXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJhbnNpdGlvbnMgYW4gYXJyYXkgb2YgdHJhbnNpdGlvbnMuXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBhbiBhcnJheSBvZiB0cmFuc2l0aW9ucy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRDYW5vbmljYWxUcmFuc2l0aW9ucyh0cmFuc2l0aW9uczogVHJhbnNpdGlvblR5cGVbXSk6IFRyYW5zaXRpb25UeXBlW10ge1xuICAgICAgICBjb25zdCBtb2RNYXAgPSB7XG4gICAgICAgICAgICBbVHJhbnNpdGlvblR5cGUuSm9pbmVkXToge1xuICAgICAgICAgICAgICAgIGFmdGVyOiBUcmFuc2l0aW9uVHlwZS5MZWZ0LFxuICAgICAgICAgICAgICAgIG5ld1RyYW5zaXRpb246IFRyYW5zaXRpb25UeXBlLkpvaW5lZEFuZExlZnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW1RyYW5zaXRpb25UeXBlLkxlZnRdOiB7XG4gICAgICAgICAgICAgICAgYWZ0ZXI6IFRyYW5zaXRpb25UeXBlLkpvaW5lZCxcbiAgICAgICAgICAgICAgICBuZXdUcmFuc2l0aW9uOiBUcmFuc2l0aW9uVHlwZS5MZWZ0QW5kSm9pbmVkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vICRjdXJyZW50VHJhbnNpdGlvbiA6IHtcbiAgICAgICAgICAgIC8vICAgICAnYWZ0ZXInIDogJG5leHRUcmFuc2l0aW9uLFxuICAgICAgICAgICAgLy8gICAgICduZXdUcmFuc2l0aW9uJyA6ICduZXdfdHJhbnNpdGlvbl90eXBlJyxcbiAgICAgICAgICAgIC8vIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlczogVHJhbnNpdGlvblR5cGVbXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSB0cmFuc2l0aW9uc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHQyID0gdHJhbnNpdGlvbnNbaSArIDFdO1xuXG4gICAgICAgICAgICBsZXQgdHJhbnNpdGlvbiA9IHQ7XG5cbiAgICAgICAgICAgIGlmIChpIDwgdHJhbnNpdGlvbnMubGVuZ3RoIC0gMSAmJiBtb2RNYXBbdF0gJiYgbW9kTWFwW3RdLmFmdGVyID09PSB0Mikge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb24gPSBtb2RNYXBbdF0ubmV3VHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcy5wdXNoKHRyYW5zaXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtIGFuIGFycmF5IG9mIHRyYW5zaXRpb25zIGludG8gYW4gYXJyYXkgb2YgdHJhbnNpdGlvbnMgYW5kIGhvdyBtYW55IHRpbWVzXG4gICAgICogdGhleSBhcmUgcmVwZWF0ZWQgY29uc2VjdXRpdmVseS5cbiAgICAgKlxuICAgICAqIEFuIGFycmF5IG9mIDEyMyBcImpvaW5lZF9hbmRfbGVmdFwiIHRyYW5zaXRpb25zLCB3b3VsZCByZXN1bHQgaW46XG4gICAgICogYGBgXG4gICAgICogW3tcbiAgICAgKiAgIHRyYW5zaXRpb25UeXBlOiBcImpvaW5lZF9hbmRfbGVmdFwiXG4gICAgICogICByZXBlYXRzOiAxMjNcbiAgICAgKiB9XVxuICAgICAqIGBgYFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHRyYW5zaXRpb25zIHRoZSBhcnJheSBvZiB0cmFuc2l0aW9ucyB0byB0cmFuc2Zvcm0uXG4gICAgICogQHJldHVybnMge29iamVjdFtdfSBhbiBhcnJheSBvZiBjb2FsZXNjZWQgdHJhbnNpdGlvbnMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgY29hbGVzY2VSZXBlYXRlZFRyYW5zaXRpb25zKHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uVHlwZVtdKSB7XG4gICAgICAgIGNvbnN0IHJlczoge1xuICAgICAgICAgICAgdHJhbnNpdGlvblR5cGU6IFRyYW5zaXRpb25UeXBlO1xuICAgICAgICAgICAgcmVwZWF0czogbnVtYmVyO1xuICAgICAgICB9W10gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDAgJiYgcmVzW3Jlcy5sZW5ndGggLSAxXS50cmFuc2l0aW9uVHlwZSA9PT0gdHJhbnNpdGlvbnNbaV0pIHtcbiAgICAgICAgICAgICAgICByZXNbcmVzLmxlbmd0aCAtIDFdLnJlcGVhdHMgKz0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uVHlwZTogdHJhbnNpdGlvbnNbaV0sXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdHM6IDEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3IgYSBjZXJ0YWluIHRyYW5zaXRpb24sIHQsIGRlc2NyaWJlIHdoYXQgaGFwcGVuZWQgdG8gdGhlIHVzZXJzIHRoYXRcbiAgICAgKiB1bmRlcndlbnQgdGhlIHRyYW5zaXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHQgdGhlIHRyYW5zaXRpb24gdHlwZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdXNlckNvdW50IG51bWJlciBvZiB1c2VybmFtZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmVwZWF0cyB0aGUgbnVtYmVyIG9mIHRpbWVzIHRoZSB0cmFuc2l0aW9uIHdhcyByZXBlYXRlZCBpbiBhIHJvdy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgd3JpdHRlbiBIdW1hbiBSZWFkYWJsZSBlcXVpdmFsZW50IG9mIHRoZSB0cmFuc2l0aW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldERlc2NyaXB0aW9uRm9yVHJhbnNpdGlvbih0OiBUcmFuc2l0aW9uVHlwZSwgdXNlckNvdW50OiBudW1iZXIsIHJlcGVhdHM6IG51bWJlcikge1xuICAgICAgICAvLyBUaGUgZW1wdHkgaW50ZXJwb2xhdGlvbnMgJ3NldmVyYWxVc2VycycgYW5kICdvbmVVc2VyJ1xuICAgICAgICAvLyBhcmUgdGhlcmUgb25seSB0byBzaG93IHRyYW5zbGF0b3JzIHRvIG5vbi1FbmdsaXNoIGxhbmd1YWdlc1xuICAgICAgICAvLyB0aGF0IHRoZSB2ZXJiIGlzIGNvbmp1Z2F0ZWQgdG8gcGx1cmFsIG9yIHNpbmd1bGFyIFN1YmplY3QuXG4gICAgICAgIGxldCByZXMgPSBudWxsO1xuICAgICAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgICAgIGNhc2UgXCJqb2luZWRcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNqb2luZWQgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNqb2luZWQgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2xlZnQgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNsZWZ0ICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImpvaW5lZF9hbmRfbGVmdFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2pvaW5lZCBhbmQgbGVmdCAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2pvaW5lZCBhbmQgbGVmdCAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsZWZ0X2FuZF9qb2luZWRcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNsZWZ0IGFuZCByZWpvaW5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2xlZnQgYW5kIHJlam9pbmVkICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludml0ZV9yZWplY3RcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNyZWplY3RlZCB0aGVpciBpbnZpdGF0aW9ucyAlKGNvdW50KXMgdGltZXNcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V2ZXJhbFVzZXJzOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHJlcGVhdHMsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc3JlamVjdGVkIHRoZWlyIGludml0YXRpb24gJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW52aXRlX3dpdGhkcmF3YWxcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNoYWQgdGhlaXIgaW52aXRhdGlvbnMgd2l0aGRyYXduICUoY291bnQpcyB0aW1lc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcmFsVXNlcnM6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogcmVwZWF0cyxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzaGFkIHRoZWlyIGludml0YXRpb24gd2l0aGRyYXduICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludml0ZWRcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIndlcmUgaW52aXRlZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwid2FzIGludml0ZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiYmFubmVkXCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCJ3ZXJlIGJhbm5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwid2FzIGJhbm5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ1bmJhbm5lZFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwid2VyZSB1bmJhbm5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwid2FzIHVuYmFubmVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImtpY2tlZFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwid2VyZSBraWNrZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQ6IHJlcGVhdHMgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIndhcyBraWNrZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY2hhbmdlZF9uYW1lXCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzY2hhbmdlZCB0aGVpciBuYW1lICUoY291bnQpcyB0aW1lc1wiLCB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzY2hhbmdlZCB0aGVpciBuYW1lICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNoYW5nZWRfYXZhdGFyXCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzY2hhbmdlZCB0aGVpciBhdmF0YXIgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNjaGFuZ2VkIHRoZWlyIGF2YXRhciAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJub19jaGFuZ2VcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNtYWRlIG5vIGNoYW5nZXMgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNtYWRlIG5vIGNoYW5nZXMgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldFRyYW5zaXRpb25TZXF1ZW5jZShldmVudHM6IE1hdHJpeEV2ZW50W10pIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50cy5tYXAoTWVtYmVyRXZlbnRMaXN0U3VtbWFyeS5nZXRUcmFuc2l0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMYWJlbCBhIGdpdmVuIG1lbWJlcnNoaXAgZXZlbnQsIGBlYCwgd2hlcmUgYGdldENvbnRlbnQoKS5tZW1iZXJzaGlwYCBoYXNcbiAgICAgKiBjaGFuZ2VkIGZvciBlYWNoIHRyYW5zaXRpb24gYWxsb3dlZCBieSB0aGUgTWF0cml4IHByb3RvY29sLiBUaGlzIGF0dGVtcHRzIHRvXG4gICAgICogbGFiZWwgdGhlIG1lbWJlcnNoaXAgY2hhbmdlcyB0aGF0IG9jY3VyIGluIGAuLi8uLi8uLi9UZXh0Rm9yRXZlbnQuanNgLlxuICAgICAqIEBwYXJhbSB7TWF0cml4RXZlbnR9IGUgdGhlIG1lbWJlcnNoaXAgY2hhbmdlIGV2ZW50IHRvIGxhYmVsLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmc/fSB0aGUgdHJhbnNpdGlvbiB0eXBlIGdpdmVuIHRvIHRoaXMgZXZlbnQuIFRoaXMgZGVmYXVsdHMgdG8gYG51bGxgXG4gICAgICogaWYgYSB0cmFuc2l0aW9uIGlzIG5vdCByZWNvZ25pc2VkLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldFRyYW5zaXRpb24oZTogTWF0cml4RXZlbnQpOiBUcmFuc2l0aW9uVHlwZSB7XG4gICAgICAgIGlmIChlLm14RXZlbnQuZ2V0VHlwZSgpID09PSAnbS5yb29tLnRoaXJkX3BhcnR5X2ludml0ZScpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSAzcGlkIGludml0ZXMgdGhlIHNhbWUgYXMgaW52aXRlcyBzbyB0aGV5IGdldCBidW5kbGVkIHRvZ2V0aGVyXG4gICAgICAgICAgICBpZiAoIWlzVmFsaWQzcGlkSW52aXRlKGUubXhFdmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuSW52aXRlV2l0aGRyYXdhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uVHlwZS5JbnZpdGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChlLm14RXZlbnQuZ2V0Q29udGVudCgpLm1lbWJlcnNoaXApIHtcbiAgICAgICAgICAgIGNhc2UgJ2ludml0ZSc6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5JbnZpdGVkO1xuICAgICAgICAgICAgY2FzZSAnYmFuJzogcmV0dXJuIFRyYW5zaXRpb25UeXBlLkJhbm5lZDtcbiAgICAgICAgICAgIGNhc2UgJ2pvaW4nOlxuICAgICAgICAgICAgICAgIGlmIChlLm14RXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5tZW1iZXJzaGlwID09PSAnam9pbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUubXhFdmVudC5nZXRDb250ZW50KCkuZGlzcGxheW5hbWUgIT09XG4gICAgICAgICAgICAgICAgICAgICAgICBlLm14RXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5kaXNwbGF5bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkNoYW5nZWROYW1lO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGUubXhFdmVudC5nZXRDb250ZW50KCkuYXZhdGFyX3VybCAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgIGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLmF2YXRhcl91cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uVHlwZS5DaGFuZ2VkQXZhdGFyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiTUVMUyBpZ25vcmluZyBkdXBsaWNhdGUgbWVtYmVyc2hpcCBqb2luIGV2ZW50XCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuTm9DaGFuZ2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkpvaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdsZWF2ZSc6XG4gICAgICAgICAgICAgICAgaWYgKGUubXhFdmVudC5nZXRTZW5kZXIoKSA9PT0gZS5teEV2ZW50LmdldFN0YXRlS2V5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChlLm14RXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5tZW1iZXJzaGlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdpbnZpdGUnOiByZXR1cm4gVHJhbnNpdGlvblR5cGUuSW52aXRlUmVqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFRyYW5zaXRpb25UeXBlLkxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLm14RXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5tZW1iZXJzaGlwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ludml0ZSc6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5JbnZpdGVXaXRoZHJhd2FsO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdiYW4nOiByZXR1cm4gVHJhbnNpdGlvblR5cGUuVW5iYW5uZWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmRlciBpcyBub3QgdGFyZ2V0IGFuZCBtYWRlIHRoZSB0YXJnZXQgbGVhdmUsIGlmIG5vdCBmcm9tIGludml0ZS9iYW4gdGhlbiB0aGlzIGlzIGEga2lja1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gVHJhbnNpdGlvblR5cGUuS2lja2VkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0QWdncmVnYXRlKHVzZXJFdmVudHM6IFJlY29yZDxzdHJpbmcsIElVc2VyRXZlbnRzW10+KSB7XG4gICAgICAgIC8vIEEgbWFwIG9mIGFnZ3JlZ2F0ZSB0eXBlIHRvIGFycmF5cyBvZiBkaXNwbGF5IG5hbWVzLiBFYWNoIGFnZ3JlZ2F0ZSB0eXBlXG4gICAgICAgIC8vIGlzIGEgY29tbWEtZGVsaW1pdGVkIHN0cmluZyBvZiB0cmFuc2l0aW9ucywgZS5nLiBcImpvaW5lZCxsZWZ0LGtpY2tlZFwiLlxuICAgICAgICAvLyBUaGUgYXJyYXkgb2YgZGlzcGxheSBuYW1lcyBpcyB0aGUgYXJyYXkgb2YgdXNlcnMgd2hvIHdlbnQgdGhyb3VnaCB0aGF0XG4gICAgICAgIC8vIHNlcXVlbmNlIGR1cmluZyBldmVudHNUb1JlbmRlci5cbiAgICAgICAgY29uc3QgYWdncmVnYXRlOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7XG4gICAgICAgICAgICAvLyAkYWdncmVnYXRlVHlwZSA6IFtdOnN0cmluZ1xuICAgICAgICB9O1xuICAgICAgICAvLyBBIG1hcCBvZiBhZ2dyZWdhdGUgdHlwZXMgdG8gdGhlIGluZGljZXMgdGhhdCBvcmRlciB0aGVtICh0aGUgaW5kZXggb2ZcbiAgICAgICAgLy8gdGhlIGZpcnN0IGV2ZW50IGZvciBhIGdpdmVuIHRyYW5zaXRpb24gc2VxdWVuY2UpXG4gICAgICAgIGNvbnN0IGFnZ3JlZ2F0ZUluZGljZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7XG4gICAgICAgICAgICAvLyAkYWdncmVnYXRlVHlwZSA6IGludFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHVzZXJzID0gT2JqZWN0LmtleXModXNlckV2ZW50cyk7XG4gICAgICAgIHVzZXJzLmZvckVhY2goXG4gICAgICAgICAgICAodXNlcklkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RFdmVudCA9IHVzZXJFdmVudHNbdXNlcklkXVswXTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IGZpcnN0RXZlbnQuZGlzcGxheU5hbWU7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzZXEgPSBNZW1iZXJFdmVudExpc3RTdW1tYXJ5LmdldFRyYW5zaXRpb25TZXF1ZW5jZSh1c2VyRXZlbnRzW3VzZXJJZF0pLmpvaW4oU0VQKTtcbiAgICAgICAgICAgICAgICBpZiAoIWFnZ3JlZ2F0ZVtzZXFdKSB7XG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZVtzZXFdID0gW107XG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZUluZGljZXNbc2VxXSA9IC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZVtzZXFdLnB1c2goZGlzcGxheU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFnZ3JlZ2F0ZUluZGljZXNbc2VxXSA9PT0gLTEgfHxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RFdmVudC5pbmRleCA8IGFnZ3JlZ2F0ZUluZGljZXNbc2VxXVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBhZ2dyZWdhdGVJbmRpY2VzW3NlcV0gPSBmaXJzdEV2ZW50LmluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWVzOiBhZ2dyZWdhdGUsXG4gICAgICAgICAgICBpbmRpY2VzOiBhZ2dyZWdhdGVJbmRpY2VzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZXZlbnRzVG9SZW5kZXIgPSB0aGlzLnByb3BzLmV2ZW50cztcblxuICAgICAgICAvLyBNYXAgdXNlciBJRHMgdG8gbGF0ZXN0IEF2YXRhciBNZW1iZXIuIEVTNiBNYXBzIGFyZSBvcmRlcmVkIGJ5IHdoZW4gdGhlIGtleSB3YXMgY3JlYXRlZCxcbiAgICAgICAgLy8gc28gdGhpcyB3b3JrcyBwZXJmZWN0bHkgZm9yIHVzIHRvIG1hdGNoIGV2ZW50IG9yZGVyIHdoaWxzdCBzdG9yaW5nIHRoZSBsYXRlc3QgQXZhdGFyIE1lbWJlclxuICAgICAgICBjb25zdCBsYXRlc3RVc2VyQXZhdGFyTWVtYmVyID0gbmV3IE1hcDxzdHJpbmcsIFJvb21NZW1iZXI+KCk7XG5cbiAgICAgICAgLy8gT2JqZWN0IG1hcHBpbmcgdXNlciBJRHMgdG8gYW4gYXJyYXkgb2YgSVVzZXJFdmVudHNcbiAgICAgICAgY29uc3QgdXNlckV2ZW50czogUmVjb3JkPHN0cmluZywgSVVzZXJFdmVudHNbXT4gPSB7fTtcbiAgICAgICAgZXZlbnRzVG9SZW5kZXIuZm9yRWFjaCgoZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGUuZ2V0U3RhdGVLZXkoKTtcbiAgICAgICAgICAgIC8vIEluaXRpYWxpc2UgYSB1c2VyJ3MgZXZlbnRzXG4gICAgICAgICAgICBpZiAoIXVzZXJFdmVudHNbdXNlcklkXSkge1xuICAgICAgICAgICAgICAgIHVzZXJFdmVudHNbdXNlcklkXSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZS50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICBsYXRlc3RVc2VyQXZhdGFyTWVtYmVyLnNldCh1c2VySWQsIGUudGFyZ2V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRpc3BsYXlOYW1lID0gdXNlcklkO1xuICAgICAgICAgICAgaWYgKGUuZ2V0VHlwZSgpID09PSAnbS5yb29tLnRoaXJkX3BhcnR5X2ludml0ZScpIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZSA9IGUuZ2V0Q29udGVudCgpLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZSA9IGUudGFyZ2V0Lm5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVzZXJFdmVudHNbdXNlcklkXS5wdXNoKHtcbiAgICAgICAgICAgICAgICBteEV2ZW50OiBlLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBhZ2dyZWdhdGUgPSB0aGlzLmdldEFnZ3JlZ2F0ZSh1c2VyRXZlbnRzKTtcblxuICAgICAgICAvLyBTb3J0IHR5cGVzIGJ5IG9yZGVyIG9mIGxvd2VzdCBldmVudCBpbmRleCB3aXRoaW4gc2VxdWVuY2VcbiAgICAgICAgY29uc3Qgb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXMgPSBPYmplY3Qua2V5cyhhZ2dyZWdhdGUubmFtZXMpLnNvcnQoXG4gICAgICAgICAgICAoc2VxMSwgc2VxMikgPT4gYWdncmVnYXRlLmluZGljZXNbc2VxMV0gLSBhZ2dyZWdhdGUuaW5kaWNlc1tzZXEyXSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gPEV2ZW50TGlzdFN1bW1hcnlcbiAgICAgICAgICAgIGV2ZW50cz17dGhpcy5wcm9wcy5ldmVudHN9XG4gICAgICAgICAgICB0aHJlc2hvbGQ9e3RoaXMucHJvcHMudGhyZXNob2xkfVxuICAgICAgICAgICAgb25Ub2dnbGU9e3RoaXMucHJvcHMub25Ub2dnbGV9XG4gICAgICAgICAgICBzdGFydEV4cGFuZGVkPXt0aGlzLnByb3BzLnN0YXJ0RXhwYW5kZWR9XG4gICAgICAgICAgICBjaGlsZHJlbj17dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICAgIHN1bW1hcnlNZW1iZXJzPXtbLi4ubGF0ZXN0VXNlckF2YXRhck1lbWJlci52YWx1ZXMoKV19XG4gICAgICAgICAgICBzdW1tYXJ5VGV4dD17dGhpcy5nZW5lcmF0ZVN1bW1hcnkoYWdncmVnYXRlLm5hbWVzLCBvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyl9IC8+O1xuICAgIH1cbn1cbiJdfQ==