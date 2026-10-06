"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentRules = exports.KIND = exports.SCOPE = void 0;

var _PushRuleVectorState = require("./PushRuleVectorState");

/*
Copyright 2016 OpenMarket Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const SCOPE = "global";
exports.SCOPE = SCOPE;
const KIND = "content";
exports.KIND = KIND;

class ContentRules {
  /**
   * Extract the keyword rules from a list of rules, and parse them
   * into a form which is useful for Vector's UI.
   *
   * Returns an object containing:
   *   rules: the primary list of keyword rules
   *   vectorState: a PushRuleVectorState indicating whether those rules are
   *      OFF/ON/LOUD
   *   externalRules: a list of other keyword rules, with states other than
   *      vectorState
   */
  static parseContentRules(rulesets
  /*: IRuleSets*/
  )
  /*: IContentRules*/
  {
    // first categorise the keyword rules in terms of their actions
    const contentRules = this._categoriseContentRules(rulesets); // Decide which content rules to display in Vector UI.
    // Vector displays a single global rule for a list of keywords
    // whereas Matrix has a push rule per keyword.
    // Vector can set the unique rule in ON, LOUD or OFF state.
    // Matrix has enabled/disabled plus a combination of (highlight, sound) tweaks.
    // The code below determines which set of user's content push rules can be
    // displayed by the vector UI.
    // Push rules that does not fit, ie defined by another Matrix client, ends
    // in externalRules.
    // There is priority in the determination of which set will be the displayed one.
    // The set with rules that have LOUD tweaks is the first choice. Then, the ones
    // with ON tweaks (no tweaks).


    if (contentRules.loud.length) {
      return {
        vectorState: _PushRuleVectorState.State.Loud,
        rules: contentRules.loud,
        externalRules: [...contentRules.loud_but_disabled, ...contentRules.on, ...contentRules.on_but_disabled, ...contentRules.other]
      };
    } else if (contentRules.loud_but_disabled.length) {
      return {
        vectorState: _PushRuleVectorState.State.Off,
        rules: contentRules.loud_but_disabled,
        externalRules: [...contentRules.on, ...contentRules.on_but_disabled, ...contentRules.other]
      };
    } else if (contentRules.on.length) {
      return {
        vectorState: _PushRuleVectorState.State.On,
        rules: contentRules.on,
        externalRules: [...contentRules.on_but_disabled, ...contentRules.other]
      };
    } else if (contentRules.on_but_disabled.length) {
      return {
        vectorState: _PushRuleVectorState.State.Off,
        rules: contentRules.on_but_disabled,
        externalRules: contentRules.other
      };
    } else {
      return {
        vectorState: _PushRuleVectorState.State.On,
        rules: [],
        externalRules: contentRules.other
      };
    }
  }

  static _categoriseContentRules(rulesets
  /*: IRuleSets*/
  ) {
    const contentRules
    /*: Record<"on"|"on_but_disabled"|"loud"|"loud_but_disabled"|"other", IExtendedPushRule[]>*/
    = {
      on: [],
      on_but_disabled: [],
      loud: [],
      loud_but_disabled: [],
      other: []
    };

    for (const kind in rulesets.global) {
      for (let i = 0; i < Object.keys(rulesets.global[kind]).length; ++i) {
        const r = rulesets.global[kind][i]; // check it's not a default rule

        if (r.rule_id[0] === '.' || kind !== "content") {
          continue;
        } // this is needed as we are flattening an object of arrays into a single array


        r.kind = kind;

        switch (_PushRuleVectorState.PushRuleVectorState.contentRuleVectorStateKind(r)) {
          case _PushRuleVectorState.State.On:
            if (r.enabled) {
              contentRules.on.push(r);
            } else {
              contentRules.on_but_disabled.push(r);
            }

            break;

          case _PushRuleVectorState.State.Loud:
            if (r.enabled) {
              contentRules.loud.push(r);
            } else {
              contentRules.loud_but_disabled.push(r);
            }

            break;

          default:
            contentRules.other.push(r);
            break;
        }
      }
    }

    return contentRules;
  }

}

exports.ContentRules = ContentRules;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub3RpZmljYXRpb25zL0NvbnRlbnRSdWxlcy50cyJdLCJuYW1lcyI6WyJTQ09QRSIsIktJTkQiLCJDb250ZW50UnVsZXMiLCJwYXJzZUNvbnRlbnRSdWxlcyIsInJ1bGVzZXRzIiwiY29udGVudFJ1bGVzIiwiX2NhdGVnb3Jpc2VDb250ZW50UnVsZXMiLCJsb3VkIiwibGVuZ3RoIiwidmVjdG9yU3RhdGUiLCJTdGF0ZSIsIkxvdWQiLCJydWxlcyIsImV4dGVybmFsUnVsZXMiLCJsb3VkX2J1dF9kaXNhYmxlZCIsIm9uIiwib25fYnV0X2Rpc2FibGVkIiwib3RoZXIiLCJPZmYiLCJPbiIsImtpbmQiLCJnbG9iYWwiLCJpIiwiT2JqZWN0Iiwia2V5cyIsInIiLCJydWxlX2lkIiwiUHVzaFJ1bGVWZWN0b3JTdGF0ZSIsImNvbnRlbnRSdWxlVmVjdG9yU3RhdGVLaW5kIiwiZW5hYmxlZCIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFpQkE7O0FBakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBV08sTUFBTUEsS0FBSyxHQUFHLFFBQWQ7O0FBQ0EsTUFBTUMsSUFBSSxHQUFHLFNBQWI7OztBQUVBLE1BQU1DLFlBQU4sQ0FBbUI7QUFDdEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJLFNBQU9DLGlCQUFQLENBQXlCQztBQUF6QjtBQUFBO0FBQUE7QUFBNkQ7QUFDekQ7QUFDQSxVQUFNQyxZQUFZLEdBQUcsS0FBS0MsdUJBQUwsQ0FBNkJGLFFBQTdCLENBQXJCLENBRnlELENBSXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUEsUUFBSUMsWUFBWSxDQUFDRSxJQUFiLENBQWtCQyxNQUF0QixFQUE4QjtBQUMxQixhQUFPO0FB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QUFBQSxZQUFZLENBQUNVLEVBQWIsQ0FBZ0JlLElBQWhCLENBQXFCTCxDQUFyQjtBQUNILGFBRkQsTUFFTztBQUNIcEIsY0FBQUEsWUFBWSxDQUFDVyxlQUFiLENBQTZCYyxJQUE3QixDQUFrQ0wsQ0FBbEM7QUFDSDs7QUFDRDs7QUFDSixlQUFLZiwyQkFBTUMsSUFBWDtBQUNJLGdCQUFJYyxDQUFDLENBQUNJLE9BQU4sRUFBZTtBQUNYeEIsY0FBQUEsWUFBWSxDQUFDRSxJQUFiLENBQWtCdUIsSUFBbEIsQ0FBdUJMLENBQXZCO0FBQ0gsYUFGRCxNQUVPO0FBQ0hwQixjQUFBQSxZQUFZLENBQUNTLGlCQUFiLENBQStCZ0IsSUFBL0IsQ0FBb0NMLENBQXBDO0FBQ0g7O0FBQ0Q7O0FBQ0o7QUFDSXBCLFlBQUFBLFlBQVksQ0FBQ1ksS0FBYixDQUFtQmEsSUFBbkIsQ0FBd0JMLENBQXhCO0FBQ0E7QUFqQlI7QUFtQkg7QUFDSjs7QUFDRCxXQUFPcEIsWUFBUDtBQUNIOztBQS9HcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtQdXNoUnVsZVZlY3RvclN0YXRlLCBTdGF0ZX0gZnJvbSBcIi4vUHVzaFJ1bGVWZWN0b3JTdGF0ZVwiO1xuaW1wb3J0IHtJRXh0ZW5kZWRQdXNoUnVsZSwgSVJ1bGVTZXRzfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElDb250ZW50UnVsZXMge1xuICAgIHZlY3RvclN0YXRlOiBTdGF0ZTtcbiAgICBydWxlczogSUV4dGVuZGVkUHVzaFJ1bGVbXTtcbiAgICBleHRlcm5hbFJ1bGVzOiBJRXh0ZW5kZWRQdXNoUnVsZVtdO1xufVxuXG5leHBvcnQgY29uc3QgU0NPUEUgPSBcImdsb2JhbFwiO1xuZXhwb3J0IGNvbnN0IEtJTkQgPSBcImNvbnRlbnRcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRlbnRSdWxlcyB7XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCB0aGUga2V5d29yZCBydWxlcyBmcm9tIGEgbGlzdCBvZiBydWxlcywgYW5kIHBhcnNlIHRoZW1cbiAgICAgKiBpbnRvIGEgZm9ybSB3aGljaCBpcyB1c2VmdWwgZm9yIFZlY3RvcidzIFVJLlxuICAgICAqXG4gICAgICogUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZzpcbiAgICAgKiAgIHJ1bGVzOiB0aGUgcHJpbWFyeSBsaXN0IG9mIGtleXdvcmQgcnVsZXNcbiAgICAgKiAgIHZlY3RvclN0YXRlOiBhIFB1c2hSdWxlVmVjdG9yU3RhdGUgaW5kaWNhdGluZyB3aGV0aGVyIHRob3NlIHJ1bGVzIGFyZVxuICAgICAqICAgICAgT0ZGL09OL0xPVURcbiAgICAgKiAgIGV4dGVybmFsUnVsZXM6IGEgbGlzdCBvZiBvdGhlciBrZXl3b3JkIHJ1bGVzLCB3aXRoIHN0YXRlcyBvdGhlciB0aGFuXG4gICAgICogICAgICB2ZWN0b3JTdGF0ZVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUNvbnRlbnRSdWxlcyhydWxlc2V0czogSVJ1bGVTZXRzKTogSUNvbnRlbnRSdWxlcyB7XG4gICAgICAgIC8vIGZpcnN0IGNhdGVnb3Jpc2UgdGhlIGtleXdvcmQgcnVsZXMgaW4gdGVybXMgb2YgdGhlaXIgYWN0aW9uc1xuICAgICAgICBjb25zdCBjb250ZW50UnVsZXMgPSB0aGlzLl9jYXRlZ29yaXNlQ29udGVudFJ1bGVzKHJ1bGVzZXRzKTtcblxuICAgICAgICAvLyBEZWNpZGUgd2hpY2ggY29udGVudCBydWxlcyB0byBkaXNwbGF5IGluIFZlY3RvciBVSS5cbiAgICAgICAgLy8gVmVjdG9yIGRpc3BsYXlzIGEgc2luZ2xlIGdsb2JhbCBydWxlIGZvciBhIGxpc3Qgb2Yga2V5d29yZHNcbiAgICAgICAgLy8gd2hlcmVhcyBNYXRyaXggaGFzIGEgcHVzaCBydWxlIHBlciBrZXl3b3JkLlxuICAgICAgICAvLyBWZWN0b3IgY2FuIHNldCB0aGUgdW5pcXVlIHJ1bGUgaW4gT04sIExPVUQgb3IgT0ZGIHN0YXRlLlxuICAgICAgICAvLyBNYXRyaXggaGFzIGVuYWJsZWQvZGlzYWJsZWQgcGx1cyBhIGNvbWJpbmF0aW9uIG9mIChoaWdobGlnaHQsIHNvdW5kKSB0d2Vha3MuXG5cbiAgICAgICAgLy8gVGhlIGNvZGUgYmVsb3cgZGV0ZXJtaW5lcyB3aGljaCBzZXQgb2YgdXNlcidzIGNvbnRlbnQgcHVzaCBydWxlcyBjYW4gYmVcbiAgICAgICAgLy8gZGlzcGxheWVkIGJ5IHRoZSB2ZWN0b3IgVUkuXG4gICAgICAgIC8vIFB1c2ggcnVsZXMgdGhhdCBkb2VzIG5vdCBmaXQsIGllIGRlZmluZWQgYnkgYW5vdGhlciBNYXRyaXggY2xpZW50LCBlbmRzXG4gICAgICAgIC8vIGluIGV4dGVybmFsUnVsZXMuXG4gICAgICAgIC8vIFRoZXJlIGlzIHByaW9yaXR5IGluIHRoZSBkZXRlcm1pbmF0aW9uIG9mIHdoaWNoIHNldCB3aWxsIGJlIHRoZSBkaXNwbGF5ZWQgb25lLlxuICAgICAgICAvLyBUaGUgc2V0IHdpdGggcnVsZXMgdGhhdCBoYXZlIExPVUQgdHdlYWtzIGlzIHRoZSBmaXJzdCBjaG9pY2UuIFRoZW4sIHRoZSBvbmVzXG4gICAgICAgIC8vIHdpdGggT04gdHdlYWtzIChubyB0d2Vha3MpLlxuXG4gICAgICAgIGlmIChjb250ZW50UnVsZXMubG91ZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmVjdG9yU3RhdGU6IFN0YXRlLkxvdWQsXG4gICAgICAgICAgICAgICAgcnVsZXM6IGNvbnRlbnRSdWxlcy5sb3VkLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsUnVsZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgLi4uY29udGVudFJ1bGVzLmxvdWRfYnV0X2Rpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAuLi5jb250ZW50UnVsZXMub24sXG4gICAgICAgICAgICAgICAgICAgIC4uLmNvbnRlbnRSdWxlcy5vbl9idXRfZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIC4uLmNvbnRlbnRSdWxlcy5vdGhlcixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50UnVsZXMubG91ZF9idXRfZGlzYWJsZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZlY3RvclN0YXRlOiBTdGF0ZS5PZmYsXG4gICAgICAgICAgICAgICAgcnVsZXM6IGNvbnRlbnRSdWxlcy5sb3VkX2J1dF9kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBleHRlcm5hbFJ1bGVzOiBbLi4uY29udGVudFJ1bGVzLm9uLCAuLi5jb250ZW50UnVsZXMub25fYnV0X2Rpc2FibGVkLCAuLi5jb250ZW50UnVsZXMub3RoZXJdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50UnVsZXMub24ubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZlY3RvclN0YXRlOiBTdGF0ZS5PbixcbiAgICAgICAgICAgICAgICBydWxlczogY29udGVudFJ1bGVzLm9uLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsUnVsZXM6IFsuLi5jb250ZW50UnVsZXMub25fYnV0X2Rpc2FibGVkLCAuLi5jb250ZW50UnVsZXMub3RoZXJdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50UnVsZXMub25fYnV0X2Rpc2FibGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2ZWN0b3JTdGF0ZTogU3RhdGUuT2ZmLFxuICAgICAgICAgICAgICAgIHJ1bGVzOiBjb250ZW50UnVsZXMub25fYnV0X2Rpc2FibGVkLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsUnVsZXM6IGNvbnRlbnRSdWxlcy5vdGhlcixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZlY3RvclN0YXRlOiBTdGF0ZS5PbixcbiAgICAgICAgICAgICAgICBydWxlczogW10sXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxSdWxlczogY29udGVudFJ1bGVzLm90aGVyLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfY2F0ZWdvcmlzZUNvbnRlbnRSdWxlcyhydWxlc2V0czogSVJ1bGVTZXRzKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRSdWxlczogUmVjb3JkPFwib25cInxcIm9uX2J1dF9kaXNhYmxlZFwifFwibG91ZFwifFwibG91ZF9idXRfZGlzYWJsZWRcInxcIm90aGVyXCIsIElFeHRlbmRlZFB1c2hSdWxlW10+ID0ge1xuICAgICAgICAgICAgb246IFtdLFxuICAgICAgICAgICAgb25fYnV0X2Rpc2FibGVkOiBbXSxcbiAgICAgICAgICAgIGxvdWQ6IFtdLFxuICAgICAgICAgICAgbG91ZF9idXRfZGlzYWJsZWQ6IFtdLFxuICAgICAgICAgICAgb3RoZXI6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3Qga2luZCBpbiBydWxlc2V0cy5nbG9iYWwpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgT2JqZWN0LmtleXMocnVsZXNldHMuZ2xvYmFsW2tpbmRdKS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBydWxlc2V0cy5nbG9iYWxba2luZF1baV07XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpdCdzIG5vdCBhIGRlZmF1bHQgcnVsZVxuICAgICAgICAgICAgICAgIGlmIChyLnJ1bGVfaWRbMF0gPT09ICcuJyB8fCBraW5kICE9PSBcImNvbnRlbnRcIikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIG5lZWRlZCBhcyB3ZSBhcmUgZmxhdHRlbmluZyBhbiBvYmplY3Qgb2YgYXJyYXlzIGludG8gYSBzaW5nbGUgYXJyYXlcbiAgICAgICAgICAgICAgICByLmtpbmQgPSBraW5kO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChQdXNoUnVsZVZlY3RvclN0YXRlLmNvbnRlbnRSdWxlVmVjdG9yU3RhdGVLaW5kKHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgU3RhdGUuT246XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoci5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudFJ1bGVzLm9uLnB1c2gocik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRSdWxlcy5vbl9idXRfZGlzYWJsZWQucHVzaChyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFN0YXRlLkxvdWQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoci5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudFJ1bGVzLmxvdWQucHVzaChyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudFJ1bGVzLmxvdWRfYnV0X2Rpc2FibGVkLnB1c2gocik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRSdWxlcy5vdGhlci5wdXNoKHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZW50UnVsZXM7XG4gICAgfVxufVxuIl19