"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.looksValid = looksValid;

/*
Copyright 2016 OpenMarket Ltd

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
// Regexp based on Simpler Version from https://gist.github.com/gregseth/5582254 - matches RFC2822
const EMAIL_ADDRESS_REGEX = new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*" + // localpart
"@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$", "i");

function looksValid(email
/*: string*/
)
/*: boolean*/
{
  return EMAIL_ADDRESS_REGEX.test(email);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9lbWFpbC50cyJdLCJuYW1lcyI6WyJFTUFJTF9BRERSRVNTX1JFR0VYIiwiUmVnRXhwIiwibG9va3NWYWxpZCIsImVtYWlsIiwidGVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsTUFBTUEsbUJBQW1CLEdBQUcsSUFBSUMsTUFBSixDQUN4QixzRUFBc0U7QUFDdEUsMEVBRndCLEVBRW9ELEdBRnBELENBQTVCOztBQUlPLFNBQVNDLFVBQVQsQ0FBb0JDO0FBQXBCO0FBQUE7QUFBQTtBQUE0QztBQUMvQyxTQUFPSCxtQkFBbUIsQ0FBQ0ksSUFBcEIsQ0FBeUJELEtBQXpCLENBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8vIFJlZ2V4cCBiYXNlZCBvbiBTaW1wbGVyIFZlcnNpb24gZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmVnc2V0aC81NTgyMjU0IC0gbWF0Y2hlcyBSRkMyODIyXG5jb25zdCBFTUFJTF9BRERSRVNTX1JFR0VYID0gbmV3IFJlZ0V4cChcbiAgICBcIl5bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKD86XFxcXC5bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSpcIiArIC8vIGxvY2FscGFydFxuICAgIFwiQCg/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXFxcLikrW2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pPyRcIiwgXCJpXCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9va3NWYWxpZChlbWFpbDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEVNQUlMX0FERFJFU1NfUkVHRVgudGVzdChlbWFpbCk7XG59XG4iXX0=