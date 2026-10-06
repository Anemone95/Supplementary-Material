"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withValidation;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

/*
Copyright 2019 New Vector Ltd
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

/* eslint-disable babel/no-invalid-this */

/**
 * Creates a validation function from a set of rules describing what to validate.
 * Generic T is the "this" type passed to the rule methods
 *
 * @param {Function} description
 *     Function that returns a string summary of the kind of value that will
 *     meet the validation rules. Shown at the top of the validation feedback.
 * @param {Boolean} hideDescriptionIfValid
 *     If true, don't show the description if the validation passes validation.
 * @param {Function} deriveData
 *     Optional function that returns a Promise to an object of generic type D.
 *     The result of this Promise is passed to rule methods `skip`, `test`, `valid`, and `invalid`.
 *     Useful for doing calculations per-value update once rather than in each of the above rule methods.
 * @param {Object} rules
 *     An array of rules describing how to check to input value. Each rule in an object
 *     and may have the following properties:
 *     - `key`: A unique ID for the rule. Required.
 *     - `skip`: A function used to determine whether the rule should even be evaluated.
 *     - `test`: A function used to determine the rule's current validity. Required.
 *     - `valid`: Function returning text to show when the rule is valid. Only shown if set.
 *     - `invalid`: Function returning text to show when the rule is invalid. Only shown if set.
 *     - `final`: A Boolean if true states that this rule will only be considered if all rules before it returned valid.
 * @returns {Function}
 *     A validation function that takes in the current input value and returns
 *     the overall validity and a feedback UI that can be rendered for more detail.
 */
function withValidation
/*:: <T = undefined, D = void>*/
({
  description,
  hideDescriptionIfValid,
  deriveData,
  rules
}
/*: IArgs<T, D>*/
) {
  return async function onValidate({
    value,
    focused,
    allowEmpty = true
  }
  /*: IFieldState*/
  )
  /*: Promise<IValidationResult>*/
  {
    if (!value && allowEmpty) {
      return {
        valid: null,
        feedback: null
      };
    }

    const data = {
      value,
      allowEmpty
    };
    const derivedData = deriveData ? await deriveData(data) : undefined;
    const results = [];
    let valid = true;

    if (rules && rules.length) {
      for (const rule of rules) {
        if (!rule.key || !rule.test) {
          continue;
        }

        if (!valid && rule.final) {
          continue;
        }

        if (rule.skip && rule.skip.call(this, data, derivedData)) {
          continue;
        } // We're setting `this` to whichever component holds the validation
        // function. That allows rules to access the state of the component.


        const ruleValid = await rule.test.call(this, data, derivedData);
        valid = valid && ruleValid;

        if (ruleValid && rule.valid) {
          // If the rule's result is valid and has text to show for
          // the valid state, show it.
          const text = rule.valid.call(this, derivedData);

          if (!text) {
            continue;
          }

          results.push({
            key: rule.key,
            valid: true,
            text
          });
        } else if (!ruleValid && rule.invalid) {
          // If the rule's result is invalid and has text to show for
          // the invalid state, show it.
          const text = rule.invalid.call(this, derivedData);

          if (!text) {
            continue;
          }

          results.push({
            key: rule.key,
            valid: false,
            text
          });
        }
      }
    } // Hide feedback when not focused


    if (!focused) {
      return {
        valid,
        feedback: null
      };
    }

    let details;

    if (results && results.length) {
      details = /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_Validation_details"
      }, results.map(result => {
        const classes = (0, _classnames.default)({
          "mx_Validation_detail": true,
          "mx_Validation_valid": result.valid,
          "mx_Validation_invalid": !result.valid
        });
        return /*#__PURE__*/_react.default.createElement("li", {
          key: result.key,
          className: classes
        }, result.text);
      }));
    }

    let summary;

    if (description && (details || !hideDescriptionIfValid)) {
      // We're setting `this` to whichever component holds the validation
      // function. That allows rules to access the state of the component.
      const content = description.call(this, derivedData);
      summary = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Validation_description"
      }, content);
    }

    let feedback;

    if (summary || details) {
      feedback = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Validation"
      }, summary, details);
    }

    return {
      valid,
      feedback
    };
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1ZhbGlkYXRpb24udHN4Il0sIm5hbWVzIjpbIndpdGhWYWxpZGF0aW9uIiwiZGVzY3JpcHRpb24iLCJoaWRlRGVzY3JpcHRpb25JZlZhbGlkIiwiZGVyaXZlRGF0YSIsInJ1bGVzIiwib25WYWxpZGF0ZSIsInZhbHVlIiwiZm9jdXNlZCIsImFsbG93RW1wdHkiLCJ2YWxpZCIsImZlZWRiYWNrIiwiZGF0YSIsImRlcml2ZWREYXRhIiwidW5kZWZpbmVkIiwicmVzdWx0cyIsImxlbmd0aCIsInJ1bGUiLCJrZXkiLCJ0ZXN0IiwiZmluYWwiLCJza2lwIiwiY2FsbCIsInJ1bGVWYWxpZCIsInRleHQiLCJwdXNoIiwiaW52YWxpZCIsImRldGFpbHMiLCJtYXAiLCJyZXN1bHQiLCJjbGFzc2VzIiwic3VtbWFyeSIsImNvbnRlbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBaUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxTQUFTQTtBQUFUO0FBQUEsQ0FBaUQ7QUFDNURDLEVBQUFBLFdBRDREO0FBQy9DQyxFQUFBQSxzQkFEK0M7QUFDdkJDLEVBQUFBLFVBRHVCO0FBQ1hDLEVBQUFBO0FBRFc7QUFBakQ7QUFBQSxFQUVDO0FBQ1osU0FBTyxlQUFlQyxVQUFmLENBQTBCO0FBQUVDLElBQUFBLEtBQUY7QUFBU0MsSUFBQUEsT0FBVDtBQUFrQkMsSUFBQUEsVUFBVSxHQUFHO0FBQS9CO0FBQTFCO0FBQUE7QUFBQTtBQUEw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QVgsQ0FBaEI7QUFLQSw0QkFBTztBQUFJLFVBQUEsR0FBRyxFQUFFbUIsTUFBTSxDQUFDWCxHQUFoQjtBQUFxQixVQUFBLFNBQVMsRUFBRVk7QUFBaEMsV0FDRkQsTUFBTSxDQUFDTCxJQURMLENBQVA7QUFHSCxPQVRBLENBREssQ0FBVjtBQVlIOztBQUVELFFBQUlPLE9BQUo7O0FBQ0EsUUFBSTdCLFdBQVcsS0FBS3lCLE9BQU8sSUFBSSxDQUFDeEIsc0JBQWpCLENBQWYsRUFBeUQ7QUFDckQ7QUFDQTtBQUNBLFlBQU02QixPQUFPLEdBQUc5QixXQUFXLENBQUNvQixJQUFaLENBQWlCLElBQWpCLEVBQXVCVCxXQUF2QixDQUFoQjtBQUNBa0IsTUFBQUEsT0FBTyxnQkFBRztBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsU0FBNENDLE9BQTVDLENBQVY7QUFDSDs7QUFFRCxRQUFJckIsUUFBSjs7QUFDQSxRQUFJb0IsT0FBTyxJQUFJSixPQUFmLEVBQXdCO0FBQ3BCaEIsTUFBQUEsUUFBUSxnQkFBRztBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsU0FDTm9CLE9BRE0sRUFFTkosT0FGTSxDQUFYO0FBSUg7O0FBRUQsV0FBTztBQUNIakIsTUFBQUEsS0FERztBQUVIQyxNQUFBQTtBQUZHLEtBQVA7QUFJSCxHQXZHRDtBQXdHSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1pbnZhbGlkLXRoaXMgKi9cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbnR5cGUgRGF0YSA9IFBpY2s8SUZpZWxkU3RhdGUsIFwidmFsdWVcIiB8IFwiYWxsb3dFbXB0eVwiPjtcblxuaW50ZXJmYWNlIElSdWxlPFQsIEQgPSB2b2lkPiB7XG4gICAga2V5OiBzdHJpbmc7XG4gICAgZmluYWw/OiBib29sZWFuO1xuICAgIHNraXA/KHRoaXM6IFQsIGRhdGE6IERhdGEsIGRlcml2ZWREYXRhOiBEKTogYm9vbGVhbjtcbiAgICB0ZXN0KHRoaXM6IFQsIGRhdGE6IERhdGEsIGRlcml2ZWREYXRhOiBEKTogYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj47XG4gICAgdmFsaWQ/KHRoaXM6IFQsIGRlcml2ZWREYXRhOiBEKTogc3RyaW5nO1xuICAgIGludmFsaWQ/KHRoaXM6IFQsIGRlcml2ZWREYXRhOiBEKTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSUFyZ3M8VCwgRCA9IHZvaWQ+IHtcbiAgICBydWxlczogSVJ1bGU8VCwgRD5bXTtcbiAgICBkZXNjcmlwdGlvbj8odGhpczogVCwgZGVyaXZlZERhdGE6IEQpOiBSZWFjdC5SZWFjdENoaWxkO1xuICAgIGhpZGVEZXNjcmlwdGlvbklmVmFsaWQ/OiBib29sZWFuO1xuICAgIGRlcml2ZURhdGE/KGRhdGE6IERhdGEpOiBQcm9taXNlPEQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElGaWVsZFN0YXRlIHtcbiAgICB2YWx1ZTogc3RyaW5nO1xuICAgIGZvY3VzZWQ6IGJvb2xlYW47XG4gICAgYWxsb3dFbXB0eTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgdmFsaWQ/OiBib29sZWFuO1xuICAgIGZlZWRiYWNrPzogUmVhY3QuUmVhY3RDaGlsZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiBmcm9tIGEgc2V0IG9mIHJ1bGVzIGRlc2NyaWJpbmcgd2hhdCB0byB2YWxpZGF0ZS5cbiAqIEdlbmVyaWMgVCBpcyB0aGUgXCJ0aGlzXCIgdHlwZSBwYXNzZWQgdG8gdGhlIHJ1bGUgbWV0aG9kc1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRlc2NyaXB0aW9uXG4gKiAgICAgRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIHN1bW1hcnkgb2YgdGhlIGtpbmQgb2YgdmFsdWUgdGhhdCB3aWxsXG4gKiAgICAgbWVldCB0aGUgdmFsaWRhdGlvbiBydWxlcy4gU2hvd24gYXQgdGhlIHRvcCBvZiB0aGUgdmFsaWRhdGlvbiBmZWVkYmFjay5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaGlkZURlc2NyaXB0aW9uSWZWYWxpZFxuICogICAgIElmIHRydWUsIGRvbid0IHNob3cgdGhlIGRlc2NyaXB0aW9uIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcyB2YWxpZGF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGVyaXZlRGF0YVxuICogICAgIE9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgdG8gYW4gb2JqZWN0IG9mIGdlbmVyaWMgdHlwZSBELlxuICogICAgIFRoZSByZXN1bHQgb2YgdGhpcyBQcm9taXNlIGlzIHBhc3NlZCB0byBydWxlIG1ldGhvZHMgYHNraXBgLCBgdGVzdGAsIGB2YWxpZGAsIGFuZCBgaW52YWxpZGAuXG4gKiAgICAgVXNlZnVsIGZvciBkb2luZyBjYWxjdWxhdGlvbnMgcGVyLXZhbHVlIHVwZGF0ZSBvbmNlIHJhdGhlciB0aGFuIGluIGVhY2ggb2YgdGhlIGFib3ZlIHJ1bGUgbWV0aG9kcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBydWxlc1xuICogICAgIEFuIGFycmF5IG9mIHJ1bGVzIGRlc2NyaWJpbmcgaG93IHRvIGNoZWNrIHRvIGlucHV0IHZhbHVlLiBFYWNoIHJ1bGUgaW4gYW4gb2JqZWN0XG4gKiAgICAgYW5kIG1heSBoYXZlIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAgICAtIGBrZXlgOiBBIHVuaXF1ZSBJRCBmb3IgdGhlIHJ1bGUuIFJlcXVpcmVkLlxuICogICAgIC0gYHNraXBgOiBBIGZ1bmN0aW9uIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIHJ1bGUgc2hvdWxkIGV2ZW4gYmUgZXZhbHVhdGVkLlxuICogICAgIC0gYHRlc3RgOiBBIGZ1bmN0aW9uIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBydWxlJ3MgY3VycmVudCB2YWxpZGl0eS4gUmVxdWlyZWQuXG4gKiAgICAgLSBgdmFsaWRgOiBGdW5jdGlvbiByZXR1cm5pbmcgdGV4dCB0byBzaG93IHdoZW4gdGhlIHJ1bGUgaXMgdmFsaWQuIE9ubHkgc2hvd24gaWYgc2V0LlxuICogICAgIC0gYGludmFsaWRgOiBGdW5jdGlvbiByZXR1cm5pbmcgdGV4dCB0byBzaG93IHdoZW4gdGhlIHJ1bGUgaXMgaW52YWxpZC4gT25seSBzaG93biBpZiBzZXQuXG4gKiAgICAgLSBgZmluYWxgOiBBIEJvb2xlYW4gaWYgdHJ1ZSBzdGF0ZXMgdGhhdCB0aGlzIHJ1bGUgd2lsbCBvbmx5IGJlIGNvbnNpZGVyZWQgaWYgYWxsIHJ1bGVzIGJlZm9yZSBpdCByZXR1cm5lZCB2YWxpZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqICAgICBBIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCB0YWtlcyBpbiB0aGUgY3VycmVudCBpbnB1dCB2YWx1ZSBhbmQgcmV0dXJuc1xuICogICAgIHRoZSBvdmVyYWxsIHZhbGlkaXR5IGFuZCBhIGZlZWRiYWNrIFVJIHRoYXQgY2FuIGJlIHJlbmRlcmVkIGZvciBtb3JlIGRldGFpbC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd2l0aFZhbGlkYXRpb248VCA9IHVuZGVmaW5lZCwgRCA9IHZvaWQ+KHtcbiAgICBkZXNjcmlwdGlvbiwgaGlkZURlc2NyaXB0aW9uSWZWYWxpZCwgZGVyaXZlRGF0YSwgcnVsZXMsXG59OiBJQXJnczxULCBEPikge1xuICAgIHJldHVybiBhc3luYyBmdW5jdGlvbiBvblZhbGlkYXRlKHsgdmFsdWUsIGZvY3VzZWQsIGFsbG93RW1wdHkgPSB0cnVlIH06IElGaWVsZFN0YXRlKTogUHJvbWlzZTxJVmFsaWRhdGlvblJlc3VsdD4ge1xuICAgICAgICBpZiAoIXZhbHVlICYmIGFsbG93RW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgZmVlZGJhY2s6IG51bGwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHsgdmFsdWUsIGFsbG93RW1wdHkgfTtcbiAgICAgICAgY29uc3QgZGVyaXZlZERhdGEgPSBkZXJpdmVEYXRhID8gYXdhaXQgZGVyaXZlRGF0YShkYXRhKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIGxldCB2YWxpZCA9IHRydWU7XG4gICAgICAgIGlmIChydWxlcyAmJiBydWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBydWxlcykge1xuICAgICAgICAgICAgICAgIGlmICghcnVsZS5rZXkgfHwgIXJ1bGUudGVzdCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkICYmIHJ1bGUuZmluYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUuc2tpcCAmJiBydWxlLnNraXAuY2FsbCh0aGlzLCBkYXRhLCBkZXJpdmVkRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgc2V0dGluZyBgdGhpc2AgdG8gd2hpY2hldmVyIGNvbXBvbmVudCBob2xkcyB0aGUgdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uLiBUaGF0IGFsbG93cyBydWxlcyB0byBhY2Nlc3MgdGhlIHN0YXRlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZVZhbGlkID0gYXdhaXQgcnVsZS50ZXN0LmNhbGwodGhpcywgZGF0YSwgZGVyaXZlZERhdGEpO1xuICAgICAgICAgICAgICAgIHZhbGlkID0gdmFsaWQgJiYgcnVsZVZhbGlkO1xuICAgICAgICAgICAgICAgIGlmIChydWxlVmFsaWQgJiYgcnVsZS52YWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcnVsZSdzIHJlc3VsdCBpcyB2YWxpZCBhbmQgaGFzIHRleHQgdG8gc2hvdyBmb3JcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHZhbGlkIHN0YXRlLCBzaG93IGl0LlxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gcnVsZS52YWxpZC5jYWxsKHRoaXMsIGRlcml2ZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBydWxlLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghcnVsZVZhbGlkICYmIHJ1bGUuaW52YWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcnVsZSdzIHJlc3VsdCBpcyBpbnZhbGlkIGFuZCBoYXMgdGV4dCB0byBzaG93IGZvclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgaW52YWxpZCBzdGF0ZSwgc2hvdyBpdC5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHJ1bGUuaW52YWxpZC5jYWxsKHRoaXMsIGRlcml2ZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBydWxlLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhpZGUgZmVlZGJhY2sgd2hlbiBub3QgZm9jdXNlZFxuICAgICAgICBpZiAoIWZvY3VzZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsaWQsXG4gICAgICAgICAgICAgICAgZmVlZGJhY2s6IG51bGwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRldGFpbHM7XG4gICAgICAgIGlmIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZXRhaWxzID0gPHVsIGNsYXNzTmFtZT1cIm14X1ZhbGlkYXRpb25fZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgIHtyZXN1bHRzLm1hcChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIm14X1ZhbGlkYXRpb25fZGV0YWlsXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm14X1ZhbGlkYXRpb25fdmFsaWRcIjogcmVzdWx0LnZhbGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJteF9WYWxpZGF0aW9uX2ludmFsaWRcIjogIXJlc3VsdC52YWxpZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8bGkga2V5PXtyZXN1bHQua2V5fSBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3Jlc3VsdC50ZXh0fVxuICAgICAgICAgICAgICAgICAgICA8L2xpPjtcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvdWw+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN1bW1hcnk7XG4gICAgICAgIGlmIChkZXNjcmlwdGlvbiAmJiAoZGV0YWlscyB8fCAhaGlkZURlc2NyaXB0aW9uSWZWYWxpZCkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHNldHRpbmcgYHRoaXNgIHRvIHdoaWNoZXZlciBjb21wb25lbnQgaG9sZHMgdGhlIHZhbGlkYXRpb25cbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uLiBUaGF0IGFsbG93cyBydWxlcyB0byBhY2Nlc3MgdGhlIHN0YXRlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZGVzY3JpcHRpb24uY2FsbCh0aGlzLCBkZXJpdmVkRGF0YSk7XG4gICAgICAgICAgICBzdW1tYXJ5ID0gPGRpdiBjbGFzc05hbWU9XCJteF9WYWxpZGF0aW9uX2Rlc2NyaXB0aW9uXCI+e2NvbnRlbnR9PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZlZWRiYWNrO1xuICAgICAgICBpZiAoc3VtbWFyeSB8fCBkZXRhaWxzKSB7XG4gICAgICAgICAgICBmZWVkYmFjayA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVmFsaWRhdGlvblwiPlxuICAgICAgICAgICAgICAgIHtzdW1tYXJ5fVxuICAgICAgICAgICAgICAgIHtkZXRhaWxzfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbGlkLFxuICAgICAgICAgICAgZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfTtcbn1cbiJdfQ==