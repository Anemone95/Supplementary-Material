"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatCount = formatCount;
exports.formatCountLong = formatCountLong;
exports.formatBytes = formatBytes;
exports.formatCryptoKey = formatCryptoKey;
exports.hashCode = hashCode;
exports.getUserNameColorClass = getUserNameColorClass;
exports.formatCommaSeparatedList = formatCommaSeparatedList;

var _languageHandler = require("../languageHandler");

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

/**
 * formats numbers to fit into ~3 characters, suitable for badge counts
 * e.g: 999, 9.9K, 99K, 0.9M, 9.9M, 99M, 0.9B, 9.9B
 */
function formatCount(count
/*: number*/
)
/*: string*/
{
  if (count < 1000) return count.toString();
  if (count < 10000) return (count / 1000).toFixed(1) + "K";
  if (count < 100000) return (count / 1000).toFixed(0) + "K";
  if (count < 10000000) return (count / 1000000).toFixed(1) + "M";
  if (count < 100000000) return (count / 1000000).toFixed(0) + "M";
  return (count / 1000000000).toFixed(1) + "B"; // 10B is enough for anyone, right? :S
}
/**
 * Format a count showing the whole number but making it a bit more readable.
 * e.g: 1000 => 1,000
 */


function formatCountLong(count
/*: number*/
)
/*: string*/
{
  const formatter = new Intl.NumberFormat();
  return formatter.format(count);
}
/**
 * format a size in bytes into a human readable form
 * e.g: 1024 -> 1.00 KB
 */


function formatBytes(bytes
/*: number*/
, decimals = 2)
/*: string*/
{
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * format a key into groups of 4 characters, for easier visual inspection
 *
 * @param {string} key key to format
 *
 * @return {string}
 */


function formatCryptoKey(key
/*: string*/
)
/*: string*/
{
  return key.match(/.{1,4}/g).join(" ");
}
/**
 * calculates a numeric hash for a given string
 *
 * @param {string} str string to hash
 *
 * @return {number}
 */


function hashCode(str
/*: string*/
)
/*: number*/
{
  let hash = 0;
  let i;
  let chr;

  if (str.length === 0) {
    return hash;
  }

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return Math.abs(hash);
}

function getUserNameColorClass(userId
/*: string*/
)
/*: string*/
{
  const colorNumber = hashCode(userId) % 8 + 1;
  return `mx_Username_color${colorNumber}`;
}
/**
 * Constructs a written English string representing `items`, with an optional
 * limit on the number of items included in the result. If specified and if the
 * length of `items` is greater than the limit, the string "and n others" will
 * be appended onto the result. If `items` is empty, returns the empty string.
 * If there is only one item, return it.
 * @param {string[]} items the items to construct a string from.
 * @param {number?} itemLimit the number by which to limit the list.
 * @returns {string} a string constructed by joining `items` with a comma
 * between each item, but with the last item appended as " and [lastItem]".
 */


function formatCommaSeparatedList(items
/*: string[]*/
, itemLimit
/*: number*/
)
/*: string*/
{
  const remaining = itemLimit === undefined ? 0 : Math.max(items.length - itemLimit, 0);

  if (items.length === 0) {
    return "";
  } else if (items.length === 1) {
    return items[0];
  } else if (remaining > 0) {
    items = items.slice(0, itemLimit);
    return (0, _languageHandler._t)("%(items)s and %(count)s others", {
      items: items.join(', '),
      count: remaining
    });
  } else {
    const lastItem = items.pop();
    return (0, _languageHandler._t)("%(items)s and %(lastItem)s", {
      items: items.join(', '),
      lastItem: lastItem
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9Gb3JtYXR0aW5nVXRpbHMudHMiXSwibmFtZXMiOlsiZm9ybWF0Q291bnQiLCJjb3VudCIsInRvU3RyaW5nIiwidG9GaXhlZCIsImZvcm1hdENvdW50TG9uZyIsImZvcm1hdHRlciIsIkludGwiLCJOdW1iZXJGb3JtYXQiLCJmb3JtYXQiLCJmb3JtYXRCeXRlcyIsImJ5dGVzIiwiZGVjaW1hbHMiLCJrIiwiZG0iLCJzaXplcyIsImkiLCJNYXRoIiwiZmxvb3IiLCJsb2ciLCJwYXJzZUZsb2F0IiwicG93IiwiZm9ybWF0Q3J5cHRvS2V5Iiwia2V5IiwibWF0Y2giLCJqb2luIiwiaGFzaENvZGUiLCJzdHIiLCJoYXNoIiwiY2hyIiwibGVuZ3RoIiwiY2hhckNvZGVBdCIsImFicyIsImdldFVzZXJOYW1lQ29sb3JDbGFzcyIsInVzZXJJZCIsImNvbG9yTnVtYmVyIiwiZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IiwiaXRlbXMiLCJpdGVtTGltaXQiLCJyZW1haW5pbmciLCJ1bmRlZmluZWQiLCJtYXgiLCJzbGljZSIsImxhc3RJdGVtIiwicG9wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLFNBQVNBLFdBQVQsQ0FBcUJDO0FBQXJCO0FBQUE7QUFBQTtBQUE0QztBQUMvQyxNQUFJQSxLQUFLLEdBQUcsSUFBWixFQUFrQixPQUFPQSxLQUFLLENBQUNDLFFBQU4sRUFBUDtBQUNsQixNQUFJRCxLQUFLLEdBQUcsS0FBWixFQUFtQixPQUFPLENBQUNBLEtBQUssR0FBRyxJQUFULEVBQWVFLE9BQWYsQ0FBdUIsQ0FBdkIsSUFBNEIsR0FBbkM7QUFDbkIsTUFBSUYsS0FBSyxHQUFHLE1BQVosRUFBb0IsT0FBTyxDQUFDQSxLQUFLLEdB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TUFBQUEsUUFBUSxFQUFFQTtBQUFyQyxLQUFqQyxDQUFQO0FBQ0g7QUFDSiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uL2xhbmd1YWdlSGFuZGxlcic7XG5cbi8qKlxuICogZm9ybWF0cyBudW1iZXJzIHRvIGZpdCBpbnRvIH4zIGNoYXJhY3RlcnMsIHN1aXRhYmxlIGZvciBiYWRnZSBjb3VudHNcbiAqIGUuZzogOTk5LCA5LjlLLCA5OUssIDAuOU0sIDkuOU0sIDk5TSwgMC45QiwgOS45QlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Q291bnQoY291bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgaWYgKGNvdW50IDwgMTAwMCkgcmV0dXJuIGNvdW50LnRvU3RyaW5nKCk7XG4gICAgaWYgKGNvdW50IDwgMTAwMDApIHJldHVybiAoY291bnQgLyAxMDAwKS50b0ZpeGVkKDEpICsgXCJLXCI7XG4gICAgaWYgKGNvdW50IDwgMTAwMDAwKSByZXR1cm4gKGNvdW50IC8gMTAwMCkudG9GaXhlZCgwKSArIFwiS1wiO1xuICAgIGlmIChjb3VudCA8IDEwMDAwMDAwKSByZXR1cm4gKGNvdW50IC8gMTAwMDAwMCkudG9GaXhlZCgxKSArIFwiTVwiO1xuICAgIGlmIChjb3VudCA8IDEwMDAwMDAwMCkgcmV0dXJuIChjb3VudCAvIDEwMDAwMDApLnRvRml4ZWQoMCkgKyBcIk1cIjtcbiAgICByZXR1cm4gKGNvdW50IC8gMTAwMDAwMDAwMCkudG9GaXhlZCgxKSArIFwiQlwiOyAvLyAxMEIgaXMgZW5vdWdoIGZvciBhbnlvbmUsIHJpZ2h0PyA6U1xufVxuXG4vKipcbiAqIEZvcm1hdCBhIGNvdW50IHNob3dpbmcgdGhlIHdob2xlIG51bWJlciBidXQgbWFraW5nIGl0IGEgYml0IG1vcmUgcmVhZGFibGUuXG4gKiBlLmc6IDEwMDAgPT4gMSwwMDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdENvdW50TG9uZyhjb3VudDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoKTtcbiAgICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdChjb3VudCk7XG59XG5cbi8qKlxuICogZm9ybWF0IGEgc2l6ZSBpbiBieXRlcyBpbnRvIGEgaHVtYW4gcmVhZGFibGUgZm9ybVxuICogZS5nOiAxMDI0IC0+IDEuMDAgS0JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEJ5dGVzKGJ5dGVzOiBudW1iZXIsIGRlY2ltYWxzID0gMik6IHN0cmluZyB7XG4gICAgaWYgKGJ5dGVzID09PSAwKSByZXR1cm4gJzAgQnl0ZXMnO1xuXG4gICAgY29uc3QgayA9IDEwMjQ7XG4gICAgY29uc3QgZG0gPSBkZWNpbWFscyA8IDAgPyAwIDogZGVjaW1hbHM7XG4gICAgY29uc3Qgc2l6ZXMgPSBbJ0J5dGVzJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ107XG5cbiAgICBjb25zdCBpID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZyhrKSk7XG5cbiAgICByZXR1cm4gcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZChkbSkpICsgJyAnICsgc2l6ZXNbaV07XG59XG5cbi8qKlxuICogZm9ybWF0IGEga2V5IGludG8gZ3JvdXBzIG9mIDQgY2hhcmFjdGVycywgZm9yIGVhc2llciB2aXN1YWwgaW5zcGVjdGlvblxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkga2V5IHRvIGZvcm1hdFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdENyeXB0b0tleShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvLnsxLDR9L2cpLmpvaW4oXCIgXCIpO1xufVxuLyoqXG4gKiBjYWxjdWxhdGVzIGEgbnVtZXJpYyBoYXNoIGZvciBhIGdpdmVuIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgc3RyaW5nIHRvIGhhc2hcbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNoQ29kZShzdHI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgbGV0IGhhc2ggPSAwO1xuICAgIGxldCBpO1xuICAgIGxldCBjaHI7XG4gICAgaWYgKHN0ci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGhhc2g7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hyID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNocjtcbiAgICAgICAgaGFzaCB8PSAwO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5hYnMoaGFzaCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyTmFtZUNvbG9yQ2xhc3ModXNlcklkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvbG9yTnVtYmVyID0gKGhhc2hDb2RlKHVzZXJJZCkgJSA4KSArIDE7XG4gICAgcmV0dXJuIGBteF9Vc2VybmFtZV9jb2xvciR7Y29sb3JOdW1iZXJ9YDtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgd3JpdHRlbiBFbmdsaXNoIHN0cmluZyByZXByZXNlbnRpbmcgYGl0ZW1zYCwgd2l0aCBhbiBvcHRpb25hbFxuICogbGltaXQgb24gdGhlIG51bWJlciBvZiBpdGVtcyBpbmNsdWRlZCBpbiB0aGUgcmVzdWx0LiBJZiBzcGVjaWZpZWQgYW5kIGlmIHRoZVxuICogbGVuZ3RoIG9mIGBpdGVtc2AgaXMgZ3JlYXRlciB0aGFuIHRoZSBsaW1pdCwgdGhlIHN0cmluZyBcImFuZCBuIG90aGVyc1wiIHdpbGxcbiAqIGJlIGFwcGVuZGVkIG9udG8gdGhlIHJlc3VsdC4gSWYgYGl0ZW1zYCBpcyBlbXB0eSwgcmV0dXJucyB0aGUgZW1wdHkgc3RyaW5nLlxuICogSWYgdGhlcmUgaXMgb25seSBvbmUgaXRlbSwgcmV0dXJuIGl0LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gaXRlbXMgdGhlIGl0ZW1zIHRvIGNvbnN0cnVjdCBhIHN0cmluZyBmcm9tLlxuICogQHBhcmFtIHtudW1iZXI/fSBpdGVtTGltaXQgdGhlIG51bWJlciBieSB3aGljaCB0byBsaW1pdCB0aGUgbGlzdC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IGEgc3RyaW5nIGNvbnN0cnVjdGVkIGJ5IGpvaW5pbmcgYGl0ZW1zYCB3aXRoIGEgY29tbWFcbiAqIGJldHdlZW4gZWFjaCBpdGVtLCBidXQgd2l0aCB0aGUgbGFzdCBpdGVtIGFwcGVuZGVkIGFzIFwiIGFuZCBbbGFzdEl0ZW1dXCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QoaXRlbXM6IHN0cmluZ1tdLCBpdGVtTGltaXQ/OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlbWFpbmluZyA9IGl0ZW1MaW1pdCA9PT0gdW5kZWZpbmVkID8gMCA6IE1hdGgubWF4KFxuICAgICAgICBpdGVtcy5sZW5ndGggLSBpdGVtTGltaXQsIDAsXG4gICAgKTtcbiAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH0gZWxzZSBpZiAoaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBpdGVtc1swXTtcbiAgICB9IGVsc2UgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgICAgaXRlbXMgPSBpdGVtcy5zbGljZSgwLCBpdGVtTGltaXQpO1xuICAgICAgICByZXR1cm4gX3QoXCIlKGl0ZW1zKXMgYW5kICUoY291bnQpcyBvdGhlcnNcIiwgeyBpdGVtczogaXRlbXMuam9pbignLCAnKSwgY291bnQ6IHJlbWFpbmluZyB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGFzdEl0ZW0gPSBpdGVtcy5wb3AoKTtcbiAgICAgICAgcmV0dXJuIF90KFwiJShpdGVtcylzIGFuZCAlKGxhc3RJdGVtKXNcIiwgeyBpdGVtczogaXRlbXMuam9pbignLCAnKSwgbGFzdEl0ZW06IGxhc3RJdGVtIH0pO1xuICAgIH1cbn1cbiJdfQ==