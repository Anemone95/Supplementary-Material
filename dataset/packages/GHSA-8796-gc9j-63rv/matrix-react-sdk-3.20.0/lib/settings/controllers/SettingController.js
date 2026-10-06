"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
Copyright 2017 Travis Ralston
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

/**
 * Represents a controller for individual settings to alter the reading behaviour
 * based upon environmental conditions, or to react to changes and therefore update
 * the working environment.
 *
 * This is not intended to replace the functionality of a SettingsHandler, it is only
 * intended to handle environmental factors for specific settings.
 */
class SettingController {
  /**
   * Gets the overridden value for the setting, if any. This must return null if the
   * value is not to be overridden, otherwise it must return the new value.
   * @param {string} level The level at which the value was requested at.
   * @param {String} roomId The room ID, may be null.
   * @param {*} calculatedValue The value that the handlers think the setting should be,
   * may be null.
   * @param {SettingLevel} calculatedAtLevel The level for which the calculated value was
   * calculated at. May be null.
   * @return {*} The value that should be used, or null if no override is applicable.
   */
  getValueOverride(level
  /*: SettingLevel*/
  , roomId
  /*: string*/
  , calculatedValue
  /*: any*/
  , calculatedAtLevel
  /*: SettingLevel*/
  )
  /*: any*/
  {
    return null; // no override
  }
  /**
   * Called when the setting value has been changed.
   * @param {string} level The level at which the setting has been modified.
   * @param {String} roomId The room ID, may be null.
   * @param {*} newValue The new value for the setting, may be null.
   */


  onChange(level
  /*: SettingLevel*/
  , roomId
  /*: string*/
  , newValue
  /*: any*/
  ) {// do nothing by default
  }
  /**
   * Gets whether the setting has been disabled due to this controller.
   */


  get settingDisabled() {
    return false;
  }

}

exports.default = SettingController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXR0aW5ncy9jb250cm9sbGVycy9TZXR0aW5nQ29udHJvbGxlci50cyJdLCJuYW1lcyI6WyJTZXR0aW5nQ29udHJvbGxlciIsImdldFZhbHVlT3ZlcnJpZGUiLCJsZXZlbCIsInJvb21JZCIsImNhbGN1bGF0ZWRWYWx1ZSIsImNhbGN1bGF0ZWRBdExldmVsIiwib25DaGFuZ2UiLCJuZXdWYWx1ZSIsInNldHRpbmdEaXNhYmxlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFlQSxpQkFBZixDQUFpQztBQUM1QztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ1dDLEVBQUFBLGdCQUFQLENBQ0lDO0FBREo7QUFBQSxJQUVJQztBQUZKO0FBQUEsSUFHSUM7QUFISjtBQUFBLElBSUlDO0FBSko7QUFBQTtBQUFBO0FBS087QUFDSCxXQUFPLElBQVAsQ0FERyxDQUNVO0FBQ2hCO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDV0MsRUFBQUEsUUFBUCxDQUFnQko7QUFBaEI7QUFBQSxJQUFxQ0M7QUFBckM7QUFBQSxJQUFxREk7QUFBckQ7QUFBQSxJQUFvRSxDQUNoRTtBQUNIO0FBRUQ7QUFDSjtBQUNBOzs7QUFDSSxNQUFXQyxlQUFYLEdBQTZCO0FBQ3pCLFdBQU8sS0FBUDtBQUNIOztBQXBDMkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVHJhdmlzIFJhbHN0b25cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uL1NldHRpbmdMZXZlbFwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb250cm9sbGVyIGZvciBpbmRpdmlkdWFsIHNldHRpbmdzIHRvIGFsdGVyIHRoZSByZWFkaW5nIGJlaGF2aW91clxuICogYmFzZWQgdXBvbiBlbnZpcm9ubWVudGFsIGNvbmRpdGlvbnMsIG9yIHRvIHJlYWN0IHRvIGNoYW5nZXMgYW5kIHRoZXJlZm9yZSB1cGRhdGVcbiAqIHRoZSB3b3JraW5nIGVudmlyb25tZW50LlxuICpcbiAqIFRoaXMgaXMgbm90IGludGVuZGVkIHRvIHJlcGxhY2UgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgYSBTZXR0aW5nc0hhbmRsZXIsIGl0IGlzIG9ubHlcbiAqIGludGVuZGVkIHRvIGhhbmRsZSBlbnZpcm9ubWVudGFsIGZhY3RvcnMgZm9yIHNwZWNpZmljIHNldHRpbmdzLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBTZXR0aW5nQ29udHJvbGxlciB7XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgb3ZlcnJpZGRlbiB2YWx1ZSBmb3IgdGhlIHNldHRpbmcsIGlmIGFueS4gVGhpcyBtdXN0IHJldHVybiBudWxsIGlmIHRoZVxuICAgICAqIHZhbHVlIGlzIG5vdCB0byBiZSBvdmVycmlkZGVuLCBvdGhlcndpc2UgaXQgbXVzdCByZXR1cm4gdGhlIG5ldyB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGV2ZWwgVGhlIGxldmVsIGF0IHdoaWNoIHRoZSB2YWx1ZSB3YXMgcmVxdWVzdGVkIGF0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQsIG1heSBiZSBudWxsLlxuICAgICAqIEBwYXJhbSB7Kn0gY2FsY3VsYXRlZFZhbHVlIFRoZSB2YWx1ZSB0aGF0IHRoZSBoYW5kbGVycyB0aGluayB0aGUgc2V0dGluZyBzaG91bGQgYmUsXG4gICAgICogbWF5IGJlIG51bGwuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx9IGNhbGN1bGF0ZWRBdExldmVsIFRoZSBsZXZlbCBmb3Igd2hpY2ggdGhlIGNhbGN1bGF0ZWQgdmFsdWUgd2FzXG4gICAgICogY2FsY3VsYXRlZCBhdC4gTWF5IGJlIG51bGwuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHVzZWQsIG9yIG51bGwgaWYgbm8gb3ZlcnJpZGUgaXMgYXBwbGljYWJsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VmFsdWVPdmVycmlkZShcbiAgICAgICAgbGV2ZWw6IFNldHRpbmdMZXZlbCxcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcsXG4gICAgICAgIGNhbGN1bGF0ZWRWYWx1ZTogYW55LFxuICAgICAgICBjYWxjdWxhdGVkQXRMZXZlbDogU2V0dGluZ0xldmVsLFxuICAgICk6IGFueSB7XG4gICAgICAgIHJldHVybiBudWxsOyAvLyBubyBvdmVycmlkZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBzZXR0aW5nIHZhbHVlIGhhcyBiZWVuIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxldmVsIFRoZSBsZXZlbCBhdCB3aGljaCB0aGUgc2V0dGluZyBoYXMgYmVlbiBtb2RpZmllZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcm9vbUlkIFRoZSByb29tIElELCBtYXkgYmUgbnVsbC5cbiAgICAgKiBAcGFyYW0geyp9IG5ld1ZhbHVlIFRoZSBuZXcgdmFsdWUgZm9yIHRoZSBzZXR0aW5nLCBtYXkgYmUgbnVsbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgb25DaGFuZ2UobGV2ZWw6IFNldHRpbmdMZXZlbCwgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZyBieSBkZWZhdWx0XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB3aGV0aGVyIHRoZSBzZXR0aW5nIGhhcyBiZWVuIGRpc2FibGVkIGR1ZSB0byB0aGlzIGNvbnRyb2xsZXIuXG4gICAgICovXG4gICAgcHVibGljIGdldCBzZXR0aW5nRGlzYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iXX0=