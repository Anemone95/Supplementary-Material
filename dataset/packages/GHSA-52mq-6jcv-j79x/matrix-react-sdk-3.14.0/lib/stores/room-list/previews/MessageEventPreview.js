"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageEventPreview = void 0;

var _languageHandler = require("../../../languageHandler");

var _utils = require("./utils");

var _ReplyThread = _interopRequireDefault(require("../../../components/views/elements/ReplyThread"));

var _HtmlUtils = require("../../../HtmlUtils");

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
class MessageEventPreview
/*:: implements IPreview*/
{
  getTextFor(event
  /*: MatrixEvent*/
  , tagId
  /*: TagID*/
  )
  /*: string*/
  {
    let eventContent = event.getContent();

    if (event.isRelation("m.replace")) {
      // It's an edit, generate the preview on the new text
      eventContent = event.getContent()['m.new_content'];
    }

    if (!eventContent || !eventContent['body']) return null; // invalid for our purposes

    let body = (eventContent['body'] || '').trim();
    const msgtype = eventContent['msgtype'];
    if (!body || !msgtype) return null; // invalid event, no preview

    const hasHtml = eventContent.format === "org.matrix.custom.html" && eventContent.formatted_body;

    if (hasHtml) {
      body = eventContent.formatted_body;
    } // XXX: Newer relations have a getRelation() function which is not compatible with replies.


    const mRelatesTo = event.getWireContent()['m.relates_to'];

    if (mRelatesTo && mRelatesTo['m.in_reply_to']) {
      // If this is a reply, get the real reply and use that
      if (hasHtml) {
        body = (_ReplyThread.default.stripHTMLReply(body) || '').trim();
      } else {
        body = (_ReplyThread.default.stripPlainReply(body) || '').trim();
      }

      if (!body) return null; // invalid event, no preview
    }

    if (hasHtml) {
      body = (0, _HtmlUtils.sanitizedHtmlNodeInnerText)(body);
    }

    if (msgtype === 'm.emote') {
      return (0, _languageHandler._t)("* %(senderName)s %(emote)s", {
        senderName: (0, _utils.getSenderName)(event),
        emote: body
      });
    }

    if ((0, _utils.isSelf)(event) || !(0, _utils.shouldPrefixMessagesIn)(event.getRoomId(), tagId)) {
      return body;
    } else {
      return (0, _languageHandler._t)("%(senderName)s: %(message)s", {
        senderName: (0, _utils.getSenderName)(event),
        message: body
      });
    }
  }

}

exports.MessageEventPreview = MessageEventPreview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL01lc3NhZ2VFdmVudFByZXZpZXcudHMiXSwibmFtZXMiOlsiTWVzc2FnZUV2ZW50UHJldmlldyIsImdldFRleHRGb3IiLCJldmVudCIsInRhZ0lkIiwiZXZlbnRDb250ZW50IiwiZ2V0Q29udGVudCIsImlzUmVsYXRpb24iLCJib2R5IiwidHJpbSIsIm1zZ3R5cGUiLCJoYXNIdG1sIiwiZm9ybWF0IiwiZm9ybWF0dGVkX2JvZHkiLCJtUmVsYXRlc1RvIiwiZ2V0V2lyZUNvbnRlbnQiLCJSZXBseVRocmVhZCIsInN0cmlwSFRNTFJlcGx5Iiwic3RyaXBQbGFpblJlcGx5Iiwic2VuZGVyTmFtZSIsImVtb3RlIiwiZ2V0Um9vbUlkIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVTyxNQUFNQTtBQUFOO0FBQThDO0FBQzFDQyxFQUFBQSxVQUFQLENBQWtCQztBQUFsQjtBQUFBLElBQXNDQztBQUF0QztBQUFBO0FBQUE7QUFBNkQ7QUFDekQsUUFBSUMsWUFBWSxHQUFHRixLQUFLLENBQUNHLFVBQU4sRUFBbkI7O0FBRUEsUUFBSUgsS0FBSyxDQUFDSSxVQUFOLENBQWlCLFdBQWpCLENBQUosRUFBbUM7QUFDL0I7QUFDQUYsTUFBQUEsWUFBWSxHQUFHRixLQUFLLENBQUNHLFVBQU4sR0FBbUIsZUFBbkIsQ0FBZjtBQUNIOztBQUVELFFBQUksQ0FBQ0QsWUFBRCxJQUFpQixDQUFDQSxZQUFZLENBQUMsTUFBRCxDQUFsQyxFQUE0QyxPQUFPLElBQVAsQ0FSYSxDQVFBOztBQUV6RCxRQUFJRyxJQUFJLEdBQUcsQ0FBQ0gsWUFBWSxDQUFDLE1BQUQsQ0FBWixJQUF3QixFQUF6QixFQUE2QkksSUFBN0IsRUFBWDtBQUNBLFVBQU1DLE9BQU8sR0FBR0wsWUFBWSxDQUFDLFNBQUQsQ0FBNUI7QUFDQSxRQUFJLENBQUNHLElBQUQsSUFBUyxDQUFDRSxPQUFkLEVBQXVCLE9BQU8sSUFBUCxDQVprQyxDQVlyQjs7QUFFcEMsVUFBTUMsT0FBTyxHQUFHTixZQUFZLENBQUNPLE1BQWIsS0FBd0Isd0JBQXhCLElBQW9EUCxZQUFZLENBQUNRLGNBQWpGOztBQUNBLFFBQUlGLE9BQUosRUFBYTtBQUNUSCxNQUFBQSxJQUFJLEdBQUdILFlBQVksQ0FBQ1EsY0FBcEI7QUFDSCxLQWpCd0QsQ0FtQnpEOzs7QUFDQSxVQUFNQyxVQUFVLEdBQUdYLEtBQUssQ0FBQ1ksY0FBTixHQUF1QixjQUF2QixDQUFuQjs7QUFDQSxRQUFJRCxVQUFVLElBQUlBLFVBQVUsQ0FBQyxlQUFELENBQTVCLEVBQStDO0FBQzNDO0FBQ0EsVUFBSUgsT0FBSixFQUFhO0FBQ1RILFFBQUFBLElBQUksR0FBRyxDQUFDUSxxQkFBWUMsY0FBWixDQUEyQlQsSUFBM0IsS0FBb0MsRUFBckMsRUFBeUNDLElBQXpDLEVBQVA7QUFDSCxPQUZELE1BRU87QUFDSEQsUUFBQUEsSUFBSSxHQUFHLENBQUNRLHFCQUFZRSxlQUFaLENBQTRCVixJQUE1QixLQUFxQyxFQUF0QyxFQUEwQ0MsSUFBMUMsRUFBUDtBQUNIOztBQUNELFVBQUksQ0FBQ0QsSUFBTCxFQUFXLE9BQU8sSUFBUCxDQVBnQyxDQU9uQjtBQUMzQjs7QUFFRCxRQUFJRyxPQUFKLEVBQWE7QUFDVEgsTUFBQUEsSUFBSSxHQUFHLDJDQUEyQkEsSUFBM0IsQ0FBUDtBQUNIOztBQUVELFFBQUlFLE9BQU8sS0FBSyxTQUFoQixFQUEyQjtBQUN2QixhQUFPLHlCQUFHLDRCQUFILEVBQWlDO0FBQUNTLFFBQUFBLFVBQVUsRUFBRSwwQkFBY2hCLEtBQWQsQ0FBYjtBQUFtQ2lCLFFBQUFBLEtBQUssRUFBRVo7QUFBMUMsT0FBakMsQ0FBUDtBQUNIOztBQUVELFFBQUksbUJBQU9MLEtBQVAsS0FBaUIsQ0FBQyxtQ0FBdUJBLEtBQUssQ0FBQ2tCLFNBQU4sRUFBdkIsRUFBMENqQixLQUExQyxDQUF0QixFQUF3RTtBQUNwRSxhQUFPSSxJQUFQO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsYUFBTyx5QkFBRyw2QkFBSCxFQUFrQztBQUFDVyxRQUFBQSxVQUFVLEVBQUUsMEJBQWNoQixLQUFkLENBQWI7QUFBbUNtQixRQUFBQSxPQUFPLEVBQUVkO0FBQTVDLE9BQWxDLENBQVA7QUFDSDtBQUNKOztBQTdDZ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBJUHJldmlldyB9IGZyb20gXCIuL0lQcmV2aWV3XCI7XG5pbXBvcnQgeyBUYWdJRCB9IGZyb20gXCIuLi9tb2RlbHNcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBnZXRTZW5kZXJOYW1lLCBpc1NlbGYsIHNob3VsZFByZWZpeE1lc3NhZ2VzSW4gfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IFJlcGx5VGhyZWFkIGZyb20gXCIuLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1JlcGx5VGhyZWFkXCI7XG5pbXBvcnQgeyBzYW5pdGl6ZWRIdG1sTm9kZUlubmVyVGV4dCB9IGZyb20gXCIuLi8uLi8uLi9IdG1sVXRpbHNcIjtcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VFdmVudFByZXZpZXcgaW1wbGVtZW50cyBJUHJldmlldyB7XG4gICAgcHVibGljIGdldFRleHRGb3IoZXZlbnQ6IE1hdHJpeEV2ZW50LCB0YWdJZD86IFRhZ0lEKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGV2ZW50Q29udGVudCA9IGV2ZW50LmdldENvbnRlbnQoKTtcblxuICAgICAgICBpZiAoZXZlbnQuaXNSZWxhdGlvbihcIm0ucmVwbGFjZVwiKSkge1xuICAgICAgICAgICAgLy8gSXQncyBhbiBlZGl0LCBnZW5lcmF0ZSB0aGUgcHJldmlldyBvbiB0aGUgbmV3IHRleHRcbiAgICAgICAgICAgIGV2ZW50Q29udGVudCA9IGV2ZW50LmdldENvbnRlbnQoKVsnbS5uZXdfY29udGVudCddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFldmVudENvbnRlbnQgfHwgIWV2ZW50Q29udGVudFsnYm9keSddKSByZXR1cm4gbnVsbDsgLy8gaW52YWxpZCBmb3Igb3VyIHB1cnBvc2VzXG5cbiAgICAgICAgbGV0IGJvZHkgPSAoZXZlbnRDb250ZW50Wydib2R5J10gfHwgJycpLnRyaW0oKTtcbiAgICAgICAgY29uc3QgbXNndHlwZSA9IGV2ZW50Q29udGVudFsnbXNndHlwZSddO1xuICAgICAgICBpZiAoIWJvZHkgfHwgIW1zZ3R5cGUpIHJldHVybiBudWxsOyAvLyBpbnZhbGlkIGV2ZW50LCBubyBwcmV2aWV3XG5cbiAgICAgICAgY29uc3QgaGFzSHRtbCA9IGV2ZW50Q29udGVudC5mb3JtYXQgPT09IFwib3JnLm1hdHJpeC5jdXN0b20uaHRtbFwiICYmIGV2ZW50Q29udGVudC5mb3JtYXR0ZWRfYm9keTtcbiAgICAgICAgaWYgKGhhc0h0bWwpIHtcbiAgICAgICAgICAgIGJvZHkgPSBldmVudENvbnRlbnQuZm9ybWF0dGVkX2JvZHk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBYWFg6IE5ld2VyIHJlbGF0aW9ucyBoYXZlIGEgZ2V0UmVsYXRpb24oKSBmdW5jdGlvbiB3aGljaCBpcyBub3QgY29tcGF0aWJsZSB3aXRoIHJlcGxpZXMuXG4gICAgICAgIGNvbnN0IG1SZWxhdGVzVG8gPSBldmVudC5nZXRXaXJlQ29udGVudCgpWydtLnJlbGF0ZXNfdG8nXTtcbiAgICAgICAgaWYgKG1SZWxhdGVzVG8gJiYgbVJlbGF0ZXNUb1snbS5pbl9yZXBseV90byddKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgcmVwbHksIGdldCB0aGUgcmVhbCByZXBseSBhbmQgdXNlIHRoYXRcbiAgICAgICAgICAgIGlmIChoYXNIdG1sKSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IChSZXBseVRocmVhZC5zdHJpcEhUTUxSZXBseShib2R5KSB8fCAnJykudHJpbSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib2R5ID0gKFJlcGx5VGhyZWFkLnN0cmlwUGxhaW5SZXBseShib2R5KSB8fCAnJykudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFib2R5KSByZXR1cm4gbnVsbDsgLy8gaW52YWxpZCBldmVudCwgbm8gcHJldmlld1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc0h0bWwpIHtcbiAgICAgICAgICAgIGJvZHkgPSBzYW5pdGl6ZWRIdG1sTm9kZUlubmVyVGV4dChib2R5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtc2d0eXBlID09PSAnbS5lbW90ZScpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiogJShzZW5kZXJOYW1lKXMgJShlbW90ZSlzXCIsIHtzZW5kZXJOYW1lOiBnZXRTZW5kZXJOYW1lKGV2ZW50KSwgZW1vdGU6IGJvZHl9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1NlbGYoZXZlbnQpIHx8ICFzaG91bGRQcmVmaXhNZXNzYWdlc0luKGV2ZW50LmdldFJvb21JZCgpLCB0YWdJZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBib2R5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXM6ICUobWVzc2FnZSlzXCIsIHtzZW5kZXJOYW1lOiBnZXRTZW5kZXJOYW1lKGV2ZW50KSwgbWVzc2FnZTogYm9keX0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19