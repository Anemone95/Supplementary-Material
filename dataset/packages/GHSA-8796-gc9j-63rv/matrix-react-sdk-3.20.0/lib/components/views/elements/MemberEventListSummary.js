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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

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
let MemberEventListSummary = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.MemberEventListSummary"), _dec(_class = (_temp = _class2 = class MemberEventListSummary extends _react.default.Component
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

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  summaryLength: 1,
  threshold: 3,
  avatarsMaxLength: 5
}), _temp)) || _class);
exports.default = MemberEventListSummary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL01lbWJlckV2ZW50TGlzdFN1bW1hcnkudHN4Il0sIm5hbWVzIjpbIlRyYW5zaXRpb25UeXBlIiwiU0VQIiwiTWVtYmVyRXZlbnRMaXN0U3VtbWFyeSIsIlJlYWN0IiwiQ29tcG9uZW50Iiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFByb3BzIiwiZXZlbnRzIiwibGVuZ3RoIiwicHJvcHMiLCJ0aHJlc2hvbGQiLCJnZW5lcmF0ZVN1bW1hcnkiLCJldmVudEFnZ3JlZ2F0ZXMiLCJvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyIsInN1bW1hcmllcyIsIm1hcCIsInRyYW5zaXRpb25zIiwidXNlck5hbWVzIiwibmFtZUxpc3QiLCJyZW5kZXJOYW1lTGlzdCIsInNwbGl0VHJhbnNpdGlvbnMiLCJzcGxpdCIsImNhbm9uaWNhbFRyYW5zaXRpb25zIiwiZ2V0Q2Fub25pY2FsVHJhbnNpdGlvbnMiLCJjb2FsZXNjZWRUcmFuc2l0aW9ucyIsImNvYWxlc2NlUmVwZWF0ZWRUcmFuc2l0aW9ucyIsImRlc2NzIiwidCIsImdldERlc2NyaXB0aW9uRm9yVHJhbnNpdGlvbiIsInRyYW5zaXRpb25UeXBlIiwicmVwZWF0cyIsImRlc2MiLCJ0cmFuc2l0aW9uTGlzdCIsImpvaW4iLCJ1c2VycyIsInN1bW1hcnlMZW5ndGgiLCJtb2RNYXAiLCJKb2luZWQiLCJhZnRlciIsIkxlZnQiLCJuZXdUcmFuc2l0aW9uIiwiSm9pbmVkQW5kTGVmdCIsIkxlZnRBbmRKb2luZWQiLCJyZXMiLCJpIiwidDIiLCJ0cmFuc2l0aW9uIiwicHVzaCIsInVzZXJDb3VudCIsInNldmVyYWxVc2VycyIsImNvdW50Iiwib25lVXNlciIsImdldFRyYW5zaXRpb25TZXF1ZW5jZSIsImdldFRyYW5zaXRpb24iLCJlIiwibXhFdmVudCIsImdldFR5cGUiLCJJbnZpdGVXaXRoZHJhd2FsIiwiSW52aXRlZCIsImdldENvbnRlbnQiLCJtZW1iZXJzaGlwIiwiQmFubmVkIiwiZ2V0UHJldkNvbnRlbnQiLCJkaXNwbGF5bmFtZSIsIkNoYW5nZWROYW1lIiwiYXZhdGFyX3VybCIsIkNoYW5nZWRBdmF0YXIiLCJOb0NoYW5nZSIsImdldFNlbmRlciIsImdldFN0YXRlS2V5IiwiSW52aXRlUmVqZWN0IiwiVW5iYW5uZWQiLCJLaWNrZWQiLCJnZXRBZ2dyZWdhdGUiLCJ1c2VyRXZlbnRzIiwiYWdncmVnYXRlIiwiYWdncmVnYXRlSW5kaWNlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwidXNlcklkIiwiZmlyc3RFdmVudCIsImRpc3BsYXlOYW1lIiwic2VxIiwiaW5kZXgiLCJuYW1lcyIsImluZGljZXMiLCJyZW5kZXIiLCJldmVudHNUb1JlbmRlciIsImxhdGVzdFVzZXJBdmF0YXJNZW1iZXIiLCJNYXAiLCJ0YXJnZXQiLCJzZXQiLCJkaXNwbGF5X25hbWUiLCJuYW1lIiwic29ydCIsInNlcTEiLCJzZXEyIiwib25Ub2dnbGUiLCJzdGFydEV4cGFuZGVkIiwiY2hpbGRyZW4iLCJ2YWx1ZXMiLCJhdmF0YXJzTWF4TGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQTRCS0EsYzs7V0FBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0FBQUFBLEVBQUFBLGM7QUFBQUEsRUFBQUEsYztBQUFBQSxFQUFBQSxjO0dBQUFBLGMsS0FBQUEsYzs7QUFnQkwsTUFBTUMsR0FBRyxHQUFHLEdBQVo7SUFHcUJDLHNCLFdBRHBCLGdEQUFxQix1Q0FBckIsQyxtQ0FBRCxNQUNxQkEsc0JBRHJCLFNBQ29EQyxlQUFNQztBQUQxRDtBQUM0RTtBQU94RUMsRUFB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QixFQUFzQ3hFLDBCQUF0QztBQVBWLE1BQVA7QUFRSDs7QUExWHVFLEMseURBQ2xEO0FBQ2xCc0IsRUFBQUEsYUFBYSxFQUFFLENBREc7QUFFbEJ6QixFQUFBQSxTQUFTLEVBQUUsQ0FGTztBQUdsQjRGLEVBQUFBLGdCQUFnQixFQUFFO0FBSEEsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdENoaWxkcmVuIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QgfSBmcm9tICcuLi8uLi8uLi91dGlscy9Gb3JtYXR0aW5nVXRpbHMnO1xuaW1wb3J0IHsgaXNWYWxpZDNwaWRJbnZpdGUgfSBmcm9tIFwiLi4vLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IEV2ZW50TGlzdFN1bW1hcnkgZnJvbSBcIi4vRXZlbnRMaXN0U3VtbWFyeVwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIEFuIGFycmF5IG9mIG1lbWJlciBldmVudHMgdG8gc3VtbWFyaXNlXG4gICAgZXZlbnRzOiBNYXRyaXhFdmVudFtdO1xuICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBuYW1lcyB0byBzaG93IGluIGVpdGhlciBlYWNoIHN1bW1hcnkgZS5nLiAyIHdvdWxkIHJlc3VsdCBcIkEsIEIgYW5kIDIzNCBvdGhlcnMgbGVmdFwiXG4gICAgc3VtbWFyeUxlbmd0aD86IG51bWJlcjtcbiAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXZhdGFycyB0byBkaXNwbGF5IGluIHRoZSBzdW1tYXJ5XG4gICAgYXZhdGFyc01heExlbmd0aD86IG51bWJlcjtcbiAgICAvLyBUaGUgbWluaW11bSBudW1iZXIgb2YgZXZlbnRzIG5lZWRlZCB0byB0cmlnZ2VyIHN1bW1hcmlzYXRpb25cbiAgICB0aHJlc2hvbGQ/OiBudW1iZXIsXG4gICAgLy8gV2hldGhlciBvciBub3QgdG8gYmVnaW4gd2l0aCBzdGF0ZS5leHBhbmRlZD10cnVlXG4gICAgc3RhcnRFeHBhbmRlZD86IGJvb2xlYW4sXG4gICAgLy8gQW4gYXJyYXkgb2YgRXZlbnRUaWxlcyB0byByZW5kZXIgd2hlbiBleHBhbmRlZFxuICAgIGNoaWxkcmVuOiBSZWFjdENoaWxkcmVuO1xuICAgIC8vIENhbGxlZCB3aGVuIHRoZSBNRUxTIGV4cGFuc2lvbiBpcyB0b2dnbGVkXG4gICAgb25Ub2dnbGU/KCk6IHZvaWQsXG59XG5cbmludGVyZmFjZSBJVXNlckV2ZW50cyB7XG4gICAgLy8gVGhlIG9yaWdpbmFsIGV2ZW50XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgLy8gVGhlIGRpc3BsYXkgbmFtZSBvZiB0aGUgdXNlciAoaWYgbm90LCB0aGVuIHVzZXIgSUQpXG4gICAgZGlzcGxheU5hbWU6IHN0cmluZztcbiAgICAvLyBUaGUgb3JpZ2luYWwgaW5kZXggb2YgdGhlIGV2ZW50IGluIHRoaXMucHJvcHMuZXZlbnRzXG4gICAgaW5kZXg6IG51bWJlcjtcbn1cblxuZW51bSBUcmFuc2l0aW9uVHlwZSB7XG4gICAgSm9pbmVkID0gXCJqb2luZWRcIixcbiAgICBMZWZ0ID0gXCJsZWZ0XCIsXG4gICAgSm9pbmVkQW5kTGVmdCA9IFwiam9pbmVkX2FuZF9sZWZ0XCIsXG4gICAgTGVmdEFuZEpvaW5lZCA9IFwibGVmdF9hbmRfam9pbmVkXCIsXG4gICAgSW52aXRlUmVqZWN0ID0gXCJpbnZpdGVfcmVqZWN0XCIsXG4gICAgSW52aXRlV2l0aGRyYXdhbCA9IFwiaW52aXRlX3dpdGhkcmF3YWxcIixcbiAgICBJbnZpdGVkID0gXCJpbnZpdGVkXCIsXG4gICAgQmFubmVkID0gXCJiYW5uZWRcIixcbiAgICBVbmJhbm5lZCA9IFwidW5iYW5uZWRcIixcbiAgICBLaWNrZWQgPSBcImtpY2tlZFwiLFxuICAgIENoYW5nZWROYW1lID0gXCJjaGFuZ2VkX25hbWVcIixcbiAgICBDaGFuZ2VkQXZhdGFyID0gXCJjaGFuZ2VkX2F2YXRhclwiLFxuICAgIE5vQ2hhbmdlID0gXCJub19jaGFuZ2VcIixcbn1cblxuY29uc3QgU0VQID0gXCIsXCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLk1lbWJlckV2ZW50TGlzdFN1bW1hcnlcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbWJlckV2ZW50TGlzdFN1bW1hcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgc3VtbWFyeUxlbmd0aDogMSxcbiAgICAgICAgdGhyZXNob2xkOiAzLFxuICAgICAgICBhdmF0YXJzTWF4TGVuZ3RoOiA1LFxuICAgIH07XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBpZlxuICAgICAgICAvLyAgLSBUaGUgbnVtYmVyIG9mIHN1bW1hcmlzZWQgZXZlbnRzIGhhcyBjaGFuZ2VkXG4gICAgICAgIC8vICAtIG9yIGlmIHRoZSBzdW1tYXJ5IGlzIGFib3V0IHRvIHRvZ2dsZSB0byBiZWNvbWUgY29sbGFwc2VkXG4gICAgICAgIC8vICAtIG9yIGlmIHRoZXJlIGFyZSBmZXdFdmVudHMsIG1lYW5pbmcgdGhlIGNoaWxkIGV2ZW50VGlsZXMgYXJlIHNob3duIGFzLWlzXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBuZXh0UHJvcHMuZXZlbnRzLmxlbmd0aCAhPT0gdGhpcy5wcm9wcy5ldmVudHMubGVuZ3RoIHx8XG4gICAgICAgICAgICBuZXh0UHJvcHMuZXZlbnRzLmxlbmd0aCA8IHRoaXMucHJvcHMudGhyZXNob2xkXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdGhlIHRleHQgZm9yIHVzZXJzIGFnZ3JlZ2F0ZWQgYnkgdGhlaXIgdHJhbnNpdGlvbiBzZXF1ZW5jZXMgKGBldmVudEFnZ3JlZ2F0ZXNgKSB3aGVyZVxuICAgICAqIHRoZSBzZXF1ZW5jZXMgYXJlIG9yZGVyZWQgYnkgYG9yZGVyZWRUcmFuc2l0aW9uU2VxdWVuY2VzYC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnRBZ2dyZWdhdGVzIGEgbWFwIG9mIHRyYW5zaXRpb24gc2VxdWVuY2UgdG8gYXJyYXkgb2YgdXNlciBkaXNwbGF5IG5hbWVzXG4gICAgICogb3IgdXNlciBJRHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXMgYW4gYXJyYXkgd2hpY2ggaXMgc29tZSBvcmRlcmluZyBvZlxuICAgICAqIGBPYmplY3Qua2V5cyhldmVudEFnZ3JlZ2F0ZXMpYC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgdGV4dHVhbCBzdW1tYXJ5IG9mIHRoZSBhZ2dyZWdhdGVkIGV2ZW50cyB0aGF0IG9jY3VycmVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTdW1tYXJ5KGV2ZW50QWdncmVnYXRlczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+LCBvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlczogc3RyaW5nW10pIHtcbiAgICAgICAgY29uc3Qgc3VtbWFyaWVzID0gb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXMubWFwKCh0cmFuc2l0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXNlck5hbWVzID0gZXZlbnRBZ2dyZWdhdGVzW3RyYW5zaXRpb25zXTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVMaXN0ID0gdGhpcy5yZW5kZXJOYW1lTGlzdCh1c2VyTmFtZXMpO1xuXG4gICAgICAgICAgICBjb25zdCBzcGxpdFRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuc3BsaXQoU0VQKSBhcyBUcmFuc2l0aW9uVHlwZVtdO1xuXG4gICAgICAgICAgICAvLyBTb21lIG5laWdoYm91cmluZyB0cmFuc2l0aW9ucyBhcmUgY29tbW9uLCBzbyBjYW5vbmljYWxpc2Ugc29tZSBpbnRvIFwicGFpclwiXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgY29uc3QgY2Fub25pY2FsVHJhbnNpdGlvbnMgPSBNZW1iZXJFdmVudExpc3RTdW1tYXJ5LmdldENhbm9uaWNhbFRyYW5zaXRpb25zKHNwbGl0VHJhbnNpdGlvbnMpO1xuICAgICAgICAgICAgLy8gVHJhbnNmb3JtIGludG8gY29uc2VjdXRpdmUgcmVwZXRpdGlvbnMgb2YgdGhlIHNhbWUgdHJhbnNpdGlvbiAobGlrZSA1XG4gICAgICAgICAgICAvLyBjb25zZWN1dGl2ZSAnam9pbmVkX2FuZF9sZWZ0J3MpXG4gICAgICAgICAgICBjb25zdCBjb2FsZXNjZWRUcmFuc2l0aW9ucyA9IE1lbWJlckV2ZW50TGlzdFN1bW1hcnkuY29hbGVzY2VSZXBlYXRlZFRyYW5zaXRpb25zKGNhbm9uaWNhbFRyYW5zaXRpb25zKTtcblxuICAgICAgICAgICAgY29uc3QgZGVzY3MgPSBjb2FsZXNjZWRUcmFuc2l0aW9ucy5tYXAoKHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVtYmVyRXZlbnRMaXN0U3VtbWFyeS5nZXREZXNjcmlwdGlvbkZvclRyYW5zaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHQudHJhbnNpdGlvblR5cGUsIHVzZXJOYW1lcy5sZW5ndGgsIHQucmVwZWF0cyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QoZGVzY3MpO1xuXG4gICAgICAgICAgICByZXR1cm4gX3QoJyUobmFtZUxpc3QpcyAlKHRyYW5zaXRpb25MaXN0KXMnLCB7IG5hbWVMaXN0OiBuYW1lTGlzdCwgdHJhbnNpdGlvbkxpc3Q6IGRlc2MgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc3VtbWFyaWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdW1tYXJpZXMuam9pbihcIiwgXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHVzZXJzIGFuIGFycmF5IG9mIHVzZXIgZGlzcGxheSBuYW1lcyBvciB1c2VyIElEcy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IHRoYXQgZW5kcyB3aXRoIFwiYW5kIFtuXSBvdGhlcnNcIiBpZiB0aGVyZSBhcmVcbiAgICAgKiBtb3JlIGl0ZW1zIGluIGB1c2Vyc2AgdGhhbiBgdGhpcy5wcm9wcy5zdW1tYXJ5TGVuZ3RoYCwgd2hpY2ggaXMgdGhlIG51bWJlciBvZiBuYW1lc1xuICAgICAqIGluY2x1ZGVkIGJlZm9yZSBcImFuZCBbbl0gb3RoZXJzXCIuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZW5kZXJOYW1lTGlzdCh1c2Vyczogc3RyaW5nW10pIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdENvbW1hU2VwYXJhdGVkTGlzdCh1c2VycywgdGhpcy5wcm9wcy5zdW1tYXJ5TGVuZ3RoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW5vbmljYWxpc2UgYW4gYXJyYXkgb2YgdHJhbnNpdGlvbnMgc3VjaCB0aGF0IHNvbWUgcGFpcnMgb2YgdHJhbnNpdGlvbnMgYmVjb21lXG4gICAgICogc2luZ2xlIHRyYW5zaXRpb25zLiBGb3IgZXhhbXBsZSBhbiBpbnB1dCBbJ2pvaW5lZCcsJ2xlZnQnXSB3b3VsZCByZXN1bHQgaW4gYW4gb3V0cHV0XG4gICAgICogWydqb2luZWRfYW5kX2xlZnQnXS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB0cmFuc2l0aW9ucyBhbiBhcnJheSBvZiB0cmFuc2l0aW9ucy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGFuIGFycmF5IG9mIHRyYW5zaXRpb25zLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldENhbm9uaWNhbFRyYW5zaXRpb25zKHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uVHlwZVtdKTogVHJhbnNpdGlvblR5cGVbXSB7XG4gICAgICAgIGNvbnN0IG1vZE1hcCA9IHtcbiAgICAgICAgICAgIFtUcmFuc2l0aW9uVHlwZS5Kb2luZWRdOiB7XG4gICAgICAgICAgICAgICAgYWZ0ZXI6IFRyYW5zaXRpb25UeXBlLkxlZnQsXG4gICAgICAgICAgICAgICAgbmV3VHJhbnNpdGlvbjogVHJhbnNpdGlvblR5cGUuSm9pbmVkQW5kTGVmdCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbVHJhbnNpdGlvblR5cGUuTGVmdF06IHtcbiAgICAgICAgICAgICAgICBhZnRlcjogVHJhbnNpdGlvblR5cGUuSm9pbmVkLFxuICAgICAgICAgICAgICAgIG5ld1RyYW5zaXRpb246IFRyYW5zaXRpb25UeXBlLkxlZnRBbmRKb2luZWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gJGN1cnJlbnRUcmFuc2l0aW9uIDoge1xuICAgICAgICAgICAgLy8gICAgICdhZnRlcicgOiAkbmV4dFRyYW5zaXRpb24sXG4gICAgICAgICAgICAvLyAgICAgJ25ld1RyYW5zaXRpb24nIDogJ25ld190cmFuc2l0aW9uX3R5cGUnLFxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzOiBUcmFuc2l0aW9uVHlwZVtdID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdCA9IHRyYW5zaXRpb25zW2ldO1xuICAgICAgICAgICAgY29uc3QgdDIgPSB0cmFuc2l0aW9uc1tpICsgMV07XG5cbiAgICAgICAgICAgIGxldCB0cmFuc2l0aW9uID0gdDtcblxuICAgICAgICAgICAgaWYgKGkgPCB0cmFuc2l0aW9ucy5sZW5ndGggLSAxICYmIG1vZE1hcFt0XSAmJiBtb2RNYXBbdF0uYWZ0ZXIgPT09IHQyKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbiA9IG1vZE1hcFt0XS5uZXdUcmFuc2l0aW9uO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzLnB1c2godHJhbnNpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm0gYW4gYXJyYXkgb2YgdHJhbnNpdGlvbnMgaW50byBhbiBhcnJheSBvZiB0cmFuc2l0aW9ucyBhbmQgaG93IG1hbnkgdGltZXNcbiAgICAgKiB0aGV5IGFyZSByZXBlYXRlZCBjb25zZWN1dGl2ZWx5LlxuICAgICAqXG4gICAgICogQW4gYXJyYXkgb2YgMTIzIFwiam9pbmVkX2FuZF9sZWZ0XCIgdHJhbnNpdGlvbnMsIHdvdWxkIHJlc3VsdCBpbjpcbiAgICAgKiBgYGBcbiAgICAgKiBbe1xuICAgICAqICAgdHJhbnNpdGlvblR5cGU6IFwiam9pbmVkX2FuZF9sZWZ0XCJcbiAgICAgKiAgIHJlcGVhdHM6IDEyM1xuICAgICAqIH1dXG4gICAgICogYGBgXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJhbnNpdGlvbnMgdGhlIGFycmF5IG9mIHRyYW5zaXRpb25zIHRvIHRyYW5zZm9ybS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0W119IGFuIGFycmF5IG9mIGNvYWxlc2NlZCB0cmFuc2l0aW9ucy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBjb2FsZXNjZVJlcGVhdGVkVHJhbnNpdGlvbnModHJhbnNpdGlvbnM6IFRyYW5zaXRpb25UeXBlW10pIHtcbiAgICAgICAgY29uc3QgcmVzOiB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uVHlwZTogVHJhbnNpdGlvblR5cGU7XG4gICAgICAgICAgICByZXBlYXRzOiBudW1iZXI7XG4gICAgICAgIH1bXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMCAmJiByZXNbcmVzLmxlbmd0aCAtIDFdLnRyYW5zaXRpb25UeXBlID09PSB0cmFuc2l0aW9uc1tpXSkge1xuICAgICAgICAgICAgICAgIHJlc1tyZXMubGVuZ3RoIC0gMV0ucmVwZWF0cyArPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25UeXBlOiB0cmFuc2l0aW9uc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0czogMSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvciBhIGNlcnRhaW4gdHJhbnNpdGlvbiwgdCwgZGVzY3JpYmUgd2hhdCBoYXBwZW5lZCB0byB0aGUgdXNlcnMgdGhhdFxuICAgICAqIHVuZGVyd2VudCB0aGUgdHJhbnNpdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdCB0aGUgdHJhbnNpdGlvbiB0eXBlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB1c2VyQ291bnQgbnVtYmVyIG9mIHVzZXJuYW1lc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZXBlYXRzIHRoZSBudW1iZXIgb2YgdGltZXMgdGhlIHRyYW5zaXRpb24gd2FzIHJlcGVhdGVkIGluIGEgcm93LlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB3cml0dGVuIEh1bWFuIFJlYWRhYmxlIGVxdWl2YWxlbnQgb2YgdGhlIHRyYW5zaXRpb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0RGVzY3JpcHRpb25Gb3JUcmFuc2l0aW9uKHQ6IFRyYW5zaXRpb25UeXBlLCB1c2VyQ291bnQ6IG51bWJlciwgcmVwZWF0czogbnVtYmVyKSB7XG4gICAgICAgIC8vIFRoZSBlbXB0eSBpbnRlcnBvbGF0aW9ucyAnc2V2ZXJhbFVzZXJzJyBhbmQgJ29uZVVzZXInXG4gICAgICAgIC8vIGFyZSB0aGVyZSBvbmx5IHRvIHNob3cgdHJhbnNsYXRvcnMgdG8gbm9uLUVuZ2xpc2ggbGFuZ3VhZ2VzXG4gICAgICAgIC8vIHRoYXQgdGhlIHZlcmIgaXMgY29uanVnYXRlZCB0byBwbHVyYWwgb3Igc2luZ3VsYXIgU3ViamVjdC5cbiAgICAgICAgbGV0IHJlcyA9IG51bGw7XG4gICAgICAgIHN3aXRjaCAodCkge1xuICAgICAgICAgICAgY2FzZSBcImpvaW5lZFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2pvaW5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2pvaW5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsZWZ0XCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzbGVmdCAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2xlZnQgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiam9pbmVkX2FuZF9sZWZ0XCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2Vycylzam9pbmVkIGFuZCBsZWZ0ICUoY291bnQpcyB0aW1lc1wiLCB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzam9pbmVkIGFuZCBsZWZ0ICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxlZnRfYW5kX2pvaW5lZFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2xlZnQgYW5kIHJlam9pbmVkICUoY291bnQpcyB0aW1lc1wiLCB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzbGVmdCBhbmQgcmVqb2luZWQgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW52aXRlX3JlamVjdFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc3JlamVjdGVkIHRoZWlyIGludml0YXRpb25zICUoY291bnQpcyB0aW1lc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcmFsVXNlcnM6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogcmVwZWF0cyxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzcmVqZWN0ZWQgdGhlaXIgaW52aXRhdGlvbiAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpbnZpdGVfd2l0aGRyYXdhbFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2hhZCB0aGVpciBpbnZpdGF0aW9ucyB3aXRoZHJhd24gJShjb3VudClzIHRpbWVzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldmVyYWxVc2VyczogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiByZXBlYXRzLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNoYWQgdGhlaXIgaW52aXRhdGlvbiB3aXRoZHJhd24gJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW52aXRlZFwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwid2VyZSBpbnZpdGVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJ3YXMgaW52aXRlZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJiYW5uZWRcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIndlcmUgYmFubmVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJ3YXMgYmFubmVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInVuYmFubmVkXCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCJ3ZXJlIHVuYmFubmVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJ3YXMgdW5iYW5uZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwia2lja2VkXCI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCJ3ZXJlIGtpY2tlZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwid2FzIGtpY2tlZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VkX25hbWVcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNjaGFuZ2VkIHRoZWlyIG5hbWUgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNjaGFuZ2VkIHRoZWlyIG5hbWUgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQ6IHJlcGVhdHMgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY2hhbmdlZF9hdmF0YXJcIjpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNjaGFuZ2VkIHRoZWlyIGF2YXRhciAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2NoYW5nZWQgdGhlaXIgYXZhdGFyICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm5vX2NoYW5nZVwiOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc21hZGUgbm8gY2hhbmdlcyAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50OiByZXBlYXRzIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc21hZGUgbm8gY2hhbmdlcyAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudDogcmVwZWF0cyB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VHJhbnNpdGlvblNlcXVlbmNlKGV2ZW50czogTWF0cml4RXZlbnRbXSkge1xuICAgICAgICByZXR1cm4gZXZlbnRzLm1hcChNZW1iZXJFdmVudExpc3RTdW1tYXJ5LmdldFRyYW5zaXRpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExhYmVsIGEgZ2l2ZW4gbWVtYmVyc2hpcCBldmVudCwgYGVgLCB3aGVyZSBgZ2V0Q29udGVudCgpLm1lbWJlcnNoaXBgIGhhc1xuICAgICAqIGNoYW5nZWQgZm9yIGVhY2ggdHJhbnNpdGlvbiBhbGxvd2VkIGJ5IHRoZSBNYXRyaXggcHJvdG9jb2wuIFRoaXMgYXR0ZW1wdHMgdG9cbiAgICAgKiBsYWJlbCB0aGUgbWVtYmVyc2hpcCBjaGFuZ2VzIHRoYXQgb2NjdXIgaW4gYC4uLy4uLy4uL1RleHRGb3JFdmVudC5qc2AuXG4gICAgICogQHBhcmFtIHtNYXRyaXhFdmVudH0gZSB0aGUgbWVtYmVyc2hpcCBjaGFuZ2UgZXZlbnQgdG8gbGFiZWwuXG4gICAgICogQHJldHVybnMge3N0cmluZz99IHRoZSB0cmFuc2l0aW9uIHR5cGUgZ2l2ZW4gdG8gdGhpcyBldmVudC4gVGhpcyBkZWZhdWx0cyB0byBgbnVsbGBcbiAgICAgKiBpZiBhIHRyYW5zaXRpb24gaXMgbm90IHJlY29nbmlzZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VHJhbnNpdGlvbihlOiBNYXRyaXhFdmVudCk6IFRyYW5zaXRpb25UeXBlIHtcbiAgICAgICAgaWYgKGUubXhFdmVudC5nZXRUeXBlKCkgPT09ICdtLnJvb20udGhpcmRfcGFydHlfaW52aXRlJykge1xuICAgICAgICAgICAgLy8gSGFuZGxlIDNwaWQgaW52aXRlcyB0aGUgc2FtZSBhcyBpbnZpdGVzIHNvIHRoZXkgZ2V0IGJ1bmRsZWQgdG9nZXRoZXJcbiAgICAgICAgICAgIGlmICghaXNWYWxpZDNwaWRJbnZpdGUoZS5teEV2ZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uVHlwZS5JbnZpdGVXaXRoZHJhd2FsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkludml0ZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKGUubXhFdmVudC5nZXRDb250ZW50KCkubWVtYmVyc2hpcCkge1xuICAgICAgICAgICAgY2FzZSAnaW52aXRlJzogcmV0dXJuIFRyYW5zaXRpb25UeXBlLkludml0ZWQ7XG4gICAgICAgICAgICBjYXNlICdiYW4nOiByZXR1cm4gVHJhbnNpdGlvblR5cGUuQmFubmVkO1xuICAgICAgICAgICAgY2FzZSAnam9pbic6XG4gICAgICAgICAgICAgICAgaWYgKGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLm1lbWJlcnNoaXAgPT09ICdqb2luJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5teEV2ZW50LmdldENvbnRlbnQoKS5kaXNwbGF5bmFtZSAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgIGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLmRpc3BsYXluYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuQ2hhbmdlZE5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5teEV2ZW50LmdldENvbnRlbnQoKS5hdmF0YXJfdXJsICE9PVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5teEV2ZW50LmdldFByZXZDb250ZW50KCkuYXZhdGFyX3VybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkNoYW5nZWRBdmF0YXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJNRUxTIGlnbm9yaW5nIGR1cGxpY2F0ZSBtZW1iZXJzaGlwIGpvaW4gZXZlbnRcIik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uVHlwZS5Ob0NoYW5nZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuSm9pbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2xlYXZlJzpcbiAgICAgICAgICAgICAgICBpZiAoZS5teEV2ZW50LmdldFNlbmRlcigpID09PSBlLm14RXZlbnQuZ2V0U3RhdGVLZXkoKSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLm1lbWJlcnNoaXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ludml0ZSc6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5JbnZpdGVSZWplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gVHJhbnNpdGlvblR5cGUuTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLm1lbWJlcnNoaXApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW52aXRlJzogcmV0dXJuIFRyYW5zaXRpb25UeXBlLkludml0ZVdpdGhkcmF3YWw7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Jhbic6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5VbmJhbm5lZDtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VuZGVyIGlzIG5vdCB0YXJnZXQgYW5kIG1hZGUgdGhlIHRhcmdldCBsZWF2ZSwgaWYgbm90IGZyb20gaW52aXRlL2JhbiB0aGVuIHRoaXMgaXMgYSBraWNrXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5LaWNrZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRBZ2dyZWdhdGUodXNlckV2ZW50czogUmVjb3JkPHN0cmluZywgSVVzZXJFdmVudHNbXT4pIHtcbiAgICAgICAgLy8gQSBtYXAgb2YgYWdncmVnYXRlIHR5cGUgdG8gYXJyYXlzIG9mIGRpc3BsYXkgbmFtZXMuIEVhY2ggYWdncmVnYXRlIHR5cGVcbiAgICAgICAgLy8gaXMgYSBjb21tYS1kZWxpbWl0ZWQgc3RyaW5nIG9mIHRyYW5zaXRpb25zLCBlLmcuIFwiam9pbmVkLGxlZnQsa2lja2VkXCIuXG4gICAgICAgIC8vIFRoZSBhcnJheSBvZiBkaXNwbGF5IG5hbWVzIGlzIHRoZSBhcnJheSBvZiB1c2VycyB3aG8gd2VudCB0aHJvdWdoIHRoYXRcbiAgICAgICAgLy8gc2VxdWVuY2UgZHVyaW5nIGV2ZW50c1RvUmVuZGVyLlxuICAgICAgICBjb25zdCBhZ2dyZWdhdGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcbiAgICAgICAgICAgIC8vICRhZ2dyZWdhdGVUeXBlIDogW106c3RyaW5nXG4gICAgICAgIH07XG4gICAgICAgIC8vIEEgbWFwIG9mIGFnZ3JlZ2F0ZSB0eXBlcyB0byB0aGUgaW5kaWNlcyB0aGF0IG9yZGVyIHRoZW0gKHRoZSBpbmRleCBvZlxuICAgICAgICAvLyB0aGUgZmlyc3QgZXZlbnQgZm9yIGEgZ2l2ZW4gdHJhbnNpdGlvbiBzZXF1ZW5jZSlcbiAgICAgICAgY29uc3QgYWdncmVnYXRlSW5kaWNlczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHtcbiAgICAgICAgICAgIC8vICRhZ2dyZWdhdGVUeXBlIDogaW50XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdXNlcnMgPSBPYmplY3Qua2V5cyh1c2VyRXZlbnRzKTtcbiAgICAgICAgdXNlcnMuZm9yRWFjaChcbiAgICAgICAgICAgICh1c2VySWQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdEV2ZW50ID0gdXNlckV2ZW50c1t1c2VySWRdWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gZmlyc3RFdmVudC5kaXNwbGF5TmFtZTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcSA9IE1lbWJlckV2ZW50TGlzdFN1bW1hcnkuZ2V0VHJhbnNpdGlvblNlcXVlbmNlKHVzZXJFdmVudHNbdXNlcklkXSkuam9pbihTRVApO1xuICAgICAgICAgICAgICAgIGlmICghYWdncmVnYXRlW3NlcV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlW3NlcV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlSW5kaWNlc1tzZXFdID0gLTE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYWdncmVnYXRlW3NlcV0ucHVzaChkaXNwbGF5TmFtZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYWdncmVnYXRlSW5kaWNlc1tzZXFdID09PSAtMSB8fFxuICAgICAgICAgICAgICAgICAgICBmaXJzdEV2ZW50LmluZGV4IDwgYWdncmVnYXRlSW5kaWNlc1tzZXFdXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZUluZGljZXNbc2VxXSA9IGZpcnN0RXZlbnQuaW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZXM6IGFnZ3JlZ2F0ZSxcbiAgICAgICAgICAgIGluZGljZXM6IGFnZ3JlZ2F0ZUluZGljZXMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBldmVudHNUb1JlbmRlciA9IHRoaXMucHJvcHMuZXZlbnRzO1xuXG4gICAgICAgIC8vIE1hcCB1c2VyIElEcyB0byBsYXRlc3QgQXZhdGFyIE1lbWJlci4gRVM2IE1hcHMgYXJlIG9yZGVyZWQgYnkgd2hlbiB0aGUga2V5IHdhcyBjcmVhdGVkLFxuICAgICAgICAvLyBzbyB0aGlzIHdvcmtzIHBlcmZlY3RseSBmb3IgdXMgdG8gbWF0Y2ggZXZlbnQgb3JkZXIgd2hpbHN0IHN0b3JpbmcgdGhlIGxhdGVzdCBBdmF0YXIgTWVtYmVyXG4gICAgICAgIGNvbnN0IGxhdGVzdFVzZXJBdmF0YXJNZW1iZXIgPSBuZXcgTWFwPHN0cmluZywgUm9vbU1lbWJlcj4oKTtcblxuICAgICAgICAvLyBPYmplY3QgbWFwcGluZyB1c2VyIElEcyB0byBhbiBhcnJheSBvZiBJVXNlckV2ZW50c1xuICAgICAgICBjb25zdCB1c2VyRXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCBJVXNlckV2ZW50c1tdPiA9IHt9O1xuICAgICAgICBldmVudHNUb1JlbmRlci5mb3JFYWNoKChlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gZS5nZXRTdGF0ZUtleSgpO1xuICAgICAgICAgICAgLy8gSW5pdGlhbGlzZSBhIHVzZXIncyBldmVudHNcbiAgICAgICAgICAgIGlmICghdXNlckV2ZW50c1t1c2VySWRdKSB7XG4gICAgICAgICAgICAgICAgdXNlckV2ZW50c1t1c2VySWRdID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIGxhdGVzdFVzZXJBdmF0YXJNZW1iZXIuc2V0KHVzZXJJZCwgZS50YXJnZXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZGlzcGxheU5hbWUgPSB1c2VySWQ7XG4gICAgICAgICAgICBpZiAoZS5nZXRUeXBlKCkgPT09ICdtLnJvb20udGhpcmRfcGFydHlfaW52aXRlJykge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lID0gZS5nZXRDb250ZW50KCkuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lID0gZS50YXJnZXQubmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXNlckV2ZW50c1t1c2VySWRdLnB1c2goe1xuICAgICAgICAgICAgICAgIG14RXZlbnQ6IGUsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFnZ3JlZ2F0ZSA9IHRoaXMuZ2V0QWdncmVnYXRlKHVzZXJFdmVudHMpO1xuXG4gICAgICAgIC8vIFNvcnQgdHlwZXMgYnkgb3JkZXIgb2YgbG93ZXN0IGV2ZW50IGluZGV4IHdpdGhpbiBzZXF1ZW5jZVxuICAgICAgICBjb25zdCBvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyA9IE9iamVjdC5rZXlzKGFnZ3JlZ2F0ZS5uYW1lcykuc29ydChcbiAgICAgICAgICAgIChzZXExLCBzZXEyKSA9PiBhZ2dyZWdhdGUuaW5kaWNlc1tzZXExXSAtIGFnZ3JlZ2F0ZS5pbmRpY2VzW3NlcTJdLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiA8RXZlbnRMaXN0U3VtbWFyeVxuICAgICAgICAgICAgZXZlbnRzPXt0aGlzLnByb3BzLmV2ZW50c31cbiAgICAgICAgICAgIHRocmVzaG9sZD17dGhpcy5wcm9wcy50aHJlc2hvbGR9XG4gICAgICAgICAgICBvblRvZ2dsZT17dGhpcy5wcm9wcy5vblRvZ2dsZX1cbiAgICAgICAgICAgIHN0YXJ0RXhwYW5kZWQ9e3RoaXMucHJvcHMuc3RhcnRFeHBhbmRlZH1cbiAgICAgICAgICAgIGNoaWxkcmVuPXt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgc3VtbWFyeU1lbWJlcnM9e1suLi5sYXRlc3RVc2VyQXZhdGFyTWVtYmVyLnZhbHVlcygpXX1cbiAgICAgICAgICAgIHN1bW1hcnlUZXh0PXt0aGlzLmdlbmVyYXRlU3VtbWFyeShhZ2dyZWdhdGUubmFtZXMsIG9yZGVyZWRUcmFuc2l0aW9uU2VxdWVuY2VzKX0gLz47XG4gICAgfVxufVxuIl19