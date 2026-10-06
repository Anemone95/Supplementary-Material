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
      body = (0, _HtmlUtils.getHtmlText)(body);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL01lc3NhZ2VFdmVudFByZXZpZXcudHMiXSwibmFtZXMiOlsiTWVzc2FnZUV2ZW50UHJldmlldyIsImdldFRleHRGb3IiLCJldmVudCIsInRhZ0lkIiwiZXZlbnRDb250ZW50IiwiZ2V0Q29udGVudCIsImlzUmVsYXRpb24iLCJib2R5IiwidHJpbSIsIm1zZ3R5cGUiLCJoYXNIdG1sIiwiZm9ybWF0IiwiZm9ybWF0dGVkX2JvZHkiLCJtUmVsYXRlc1RvIiwiZ2V0V2lyZUNvbnRlbnQiLCJSZXBseVRocmVhZCIsInN0cmlwSFRNTFJlcGx5Iiwic3RyaXBQbGFpblJlcGx5Iiwic2VuZGVyTmFtZSIsImVtb3RlIiwiZ2V0Um9vbUlkIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVTyxNQUFNQTtBQUFOO0FBQThDO0FBQzFDQyxFQUFBQSxVQUFQLENBQWtCQztBQUFsQjtBQUFBLElBQXNDQztBQUF0QztBQUFBO0FBQUE7QUFBNkQ7QUFDekQsUUFBSUMsWUFBWSxHQUFHRixLQUFLLENBQUNHLFVBQU4sRUFBbkI7O0FBRUEsUUFBSUgsS0FBSyxDQUFDSSxVQUFOLENBQWlCLFdBQWpCLENBQUosRUFBbUM7QUFDL0I7QUFDQUYsTUFBQUEsWUFBWSxHQUFHRixLQUFLLENBQUNHLFVBQU4sR0FBbUIsZUFBbkIsQ0FBZjtBQUNIOztBQUVELFFBQUksQ0FBQ0QsWUFBRCxJQUFpQixDQUFDQSxZQUFZLENBQUMsTUFBRCxDQUFsQyxFQUE0QyxPQUFPLElBQVAsQ0FSYSxDQVFBOztBQUV6RCxRQUFJRyxJQUFJLEdBQUcsQ0FBQ0gsWUFBWSxDQUFDLE1BQUQsQ0FBWixJQUF3QixFQUF6QixFQUE2QkksSUFBN0IsRUFBWDtBQUNBLFVBQU1DLE9BQU8sR0FBR0wsWUFBWSxDQUFDLFNBQUQsQ0FBNUI7QUFDQSxRQUFJLENBQUNHLElBQUQsSUFBUyxDQUFDRSxPQUFkLEVBQXVCLE9BQU8sSUFBUCxDQVprQyxDQVlyQjs7QUFFcEMsVUFBTUMsT0FBTyxHQUFHTixZQUFZLENBQUNPLE1BQWIsS0FBd0Isd0JBQXhCLElBQW9EUCxZQUFZLENBQUNRLGNBQWpGOztBQUNBLFFBQUlGLE9BQUosRUFBYTtBQUNUSCxNQUFBQSxJQUFJLEdBQUdILFlBQVksQ0FBQ1EsY0FBcEI7QUFDSCxLQWpCd0QsQ0FtQnpEOzs7QUFDQSxVQUFNQyxVQUFVLEdBQUdYLEtBQUssQ0FBQ1ksY0FBTixHQUF1QixjQUF2QixDQUFuQjs7QUFDQSxRQUFJRCxVQUFVLElBQUlBLFVBQVUsQ0FBQyxlQUFELENBQTVCLEVBQStDO0FBQzNDO0FBQ0EsVUFBSUgsT0FBSixFQUFhO0FBQ1RILFFBQUFBLElBQUksR0FBRyxDQUFDUSxxQkFBWUMsY0FBWixDQUEyQlQsSUFBM0IsS0FBb0MsRUFBckMsRUFBeUNDLElBQXpDLEVBQVA7QUFDSCxPQUZELE1BRU87QUFDSEQsUUFBQUEsSUFBSSxHQUFHLENBQUNRLHFCQUFZRSxlQUFaLENBQTRCVixJQUE1QixLQUFxQyxFQUF0QyxFQUEwQ0MsSUFBMUMsRUFBUDtBQUNIOztBQUNELFVBQUksQ0FBQ0QsSUFBTCxFQUFXLE9BQU8sSUFBUCxDQVBnQyxDQU9uQjtBQUMzQjs7QUFFRCxRQUFJRyxPQUFKLEVBQWE7QUFDVEgsTUFBQUEsSUFBSSxHQUFHLDRCQUFZQSxJQUFaLENBQVA7QUFDSDs7QUFFRCxRQUFJRSxPQUFPLEtBQUssU0FBaEIsRUFBMkI7QUFDdkIsYUFBTyx5QkFBRyw0QkFBSCxFQUFpQztBQUFDUyxRQUFBQSxVQUFVLEVBQUUsMEJBQWNoQixLQUFkLENBQWI7QUFBbUNpQixRQUFBQSxLQUFLLEVBQUVaO0FBQTFDLE9BQWpDLENBQVA7QUFDSDs7QUFFRCxRQUFJLG1CQUFPTCxLQUFQLEtBQWlCLENBQUMsbUNBQXVCQSxLQUFLLENBQUNrQixTQUFOLEVBQXZCLEVBQTBDakIsS0FBMUMsQ0FBdEIsRUFBd0U7QUFDcEUsYUFBT0ksSUFBUDtBQUNILEtBRkQsTUFFTztBQUNILGFBQU8seUJBQUcsNkJBQUgsRUFBa0M7QUFBQ1csUUFBQUEsVUFBVSxFQUFFLDBCQUFjaEIsS0FBZCxDQUFiO0FBQW1DbUIsUUFBQUEsT0FBTyxFQUFFZDtBQUE1QyxPQUFsQyxDQUFQO0FBQ0g7QUFDSjs7QUE3Q2dEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgSVByZXZpZXcgfSBmcm9tIFwiLi9JUHJldmlld1wiO1xuaW1wb3J0IHsgVGFnSUQgfSBmcm9tIFwiLi4vbW9kZWxzXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgZ2V0U2VuZGVyTmFtZSwgaXNTZWxmLCBzaG91bGRQcmVmaXhNZXNzYWdlc0luIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBSZXBseVRocmVhZCBmcm9tIFwiLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9SZXBseVRocmVhZFwiO1xuaW1wb3J0IHsgZ2V0SHRtbFRleHQgfSBmcm9tIFwiLi4vLi4vLi4vSHRtbFV0aWxzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlRXZlbnRQcmV2aWV3IGltcGxlbWVudHMgSVByZXZpZXcge1xuICAgIHB1YmxpYyBnZXRUZXh0Rm9yKGV2ZW50OiBNYXRyaXhFdmVudCwgdGFnSWQ/OiBUYWdJRCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBldmVudENvbnRlbnQgPSBldmVudC5nZXRDb250ZW50KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LmlzUmVsYXRpb24oXCJtLnJlcGxhY2VcIikpIHtcbiAgICAgICAgICAgIC8vIEl0J3MgYW4gZWRpdCwgZ2VuZXJhdGUgdGhlIHByZXZpZXcgb24gdGhlIG5ldyB0ZXh0XG4gICAgICAgICAgICBldmVudENvbnRlbnQgPSBldmVudC5nZXRDb250ZW50KClbJ20ubmV3X2NvbnRlbnQnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXZlbnRDb250ZW50IHx8ICFldmVudENvbnRlbnRbJ2JvZHknXSkgcmV0dXJuIG51bGw7IC8vIGludmFsaWQgZm9yIG91ciBwdXJwb3Nlc1xuXG4gICAgICAgIGxldCBib2R5ID0gKGV2ZW50Q29udGVudFsnYm9keSddIHx8ICcnKS50cmltKCk7XG4gICAgICAgIGNvbnN0IG1zZ3R5cGUgPSBldmVudENvbnRlbnRbJ21zZ3R5cGUnXTtcbiAgICAgICAgaWYgKCFib2R5IHx8ICFtc2d0eXBlKSByZXR1cm4gbnVsbDsgLy8gaW52YWxpZCBldmVudCwgbm8gcHJldmlld1xuXG4gICAgICAgIGNvbnN0IGhhc0h0bWwgPSBldmVudENvbnRlbnQuZm9ybWF0ID09PSBcIm9yZy5tYXRyaXguY3VzdG9tLmh0bWxcIiAmJiBldmVudENvbnRlbnQuZm9ybWF0dGVkX2JvZHk7XG4gICAgICAgIGlmIChoYXNIdG1sKSB7XG4gICAgICAgICAgICBib2R5ID0gZXZlbnRDb250ZW50LmZvcm1hdHRlZF9ib2R5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gWFhYOiBOZXdlciByZWxhdGlvbnMgaGF2ZSBhIGdldFJlbGF0aW9uKCkgZnVuY3Rpb24gd2hpY2ggaXMgbm90IGNvbXBhdGlibGUgd2l0aCByZXBsaWVzLlxuICAgICAgICBjb25zdCBtUmVsYXRlc1RvID0gZXZlbnQuZ2V0V2lyZUNvbnRlbnQoKVsnbS5yZWxhdGVzX3RvJ107XG4gICAgICAgIGlmIChtUmVsYXRlc1RvICYmIG1SZWxhdGVzVG9bJ20uaW5fcmVwbHlfdG8nXSkge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHJlcGx5LCBnZXQgdGhlIHJlYWwgcmVwbHkgYW5kIHVzZSB0aGF0XG4gICAgICAgICAgICBpZiAoaGFzSHRtbCkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSAoUmVwbHlUaHJlYWQuc3RyaXBIVE1MUmVwbHkoYm9keSkgfHwgJycpLnRyaW0oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IChSZXBseVRocmVhZC5zdHJpcFBsYWluUmVwbHkoYm9keSkgfHwgJycpLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9keSkgcmV0dXJuIG51bGw7IC8vIGludmFsaWQgZXZlbnQsIG5vIHByZXZpZXdcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNIdG1sKSB7XG4gICAgICAgICAgICBib2R5ID0gZ2V0SHRtbFRleHQoYm9keSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobXNndHlwZSA9PT0gJ20uZW1vdGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIqICUoc2VuZGVyTmFtZSlzICUoZW1vdGUpc1wiLCB7c2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCksIGVtb3RlOiBib2R5fSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNTZWxmKGV2ZW50KSB8fCAhc2hvdWxkUHJlZml4TWVzc2FnZXNJbihldmVudC5nZXRSb29tSWQoKSwgdGFnSWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gYm9keTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzOiAlKG1lc3NhZ2Upc1wiLCB7c2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCksIG1lc3NhZ2U6IGJvZHl9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==