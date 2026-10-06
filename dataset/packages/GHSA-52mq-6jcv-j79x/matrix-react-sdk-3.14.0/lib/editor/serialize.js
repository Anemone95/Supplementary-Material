"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mdSerialize = mdSerialize;
exports.htmlSerializeIfNeeded = htmlSerializeIfNeeded;
exports.textSerialize = textSerialize;
exports.containsEmote = containsEmote;
exports.startsWith = startsWith;
exports.stripEmoteCommand = stripEmoteCommand;
exports.stripPrefix = stripPrefix;
exports.unescapeMessage = unescapeMessage;

var _Markdown = _interopRequireDefault(require("../Markdown"));

var _Permalinks = require("../utils/permalinks/Permalinks");

var _htmlEntities = require("html-entities");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _cheerio = _interopRequireDefault(require("cheerio"));

/*
Copyright 2019 New Vector Ltd
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
function mdSerialize(model
/*: EditorModel*/
) {
  return model.parts.reduce((html, part) => {
    switch (part.type) {
      case "newline":
        return html + "\n";

      case "plain":
      case "command":
      case "pill-candidate":
      case "at-room-pill":
        return html + part.text;

      case "room-pill":
      case "user-pill":
        return html + `[${part.text.replace(/[[\\\]]/g, c => "\\" + c)}](${(0, _Permalinks.makeGenericPermalink)(part.resourceId)})`;
    }
  }, "");
}

function htmlSerializeIfNeeded(model
/*: EditorModel*/
, {
  forceHTML = false
} = {}) {
  let md = mdSerialize(model);

  if (_SettingsStore.default.getValue("feature_latex_maths")) {
    const displayPattern = (_SdkConfig.default.get()['latex_maths_delims'] || {})['display_pattern'] || "\\$\\$(([^$]|\\\\\\$)*)\\$\\$";
    const inlinePattern = (_SdkConfig.default.get()['latex_maths_delims'] || {})['inline_pattern'] || "\\$(([^$]|\\\\\\$)*)\\$";
    md = md.replace(RegExp(displayPattern, "gm"), function (m, p1) {
      const p1e = _htmlEntities.AllHtmlEntities.encode(p1);

      return `<div data-mx-maths="${p1e}">\n\n</div>\n\n`;
    });
    md = md.replace(RegExp(inlinePattern, "gm"), function (m, p1) {
      const p1e = _htmlEntities.AllHtmlEntities.encode(p1);

      return `<span data-mx-maths="${p1e}"></span>`;
    }); // make sure div tags always start on a new line, otherwise it will confuse
    // the markdown parser

    md = md.replace(/(.)<div/g, function (m, p1) {
      return `${p1}\n<div`;
    });
  }

  const parser = new _Markdown.default(md);

  if (!parser.isPlainText() || forceHTML) {
    // feed Markdown output to HTML parser
    const phtml = _cheerio.default.load(parser.toHTML(), {
      _useHtmlParser2: true,
      decodeEntities: false
    }); // add fallback output for latex math, which should not be interpreted as markdown


    phtml('div, span').each(function (i, e) {
      const tex = phtml(e).attr('data-mx-maths');

      if (tex) {
        phtml(e).html(`<code>${tex}</code>`);
      }
    });
    return phtml.html();
  } // ensure removal of escape backslashes in non-Markdown messages


  if (md.indexOf("\\") > -1) {
    return parser.toPlaintext();
  }
}

function textSerialize(model
/*: EditorModel*/
) {
  return model.parts.reduce((text, part) => {
    switch (part.type) {
      case "newline":
        return text + "\n";

      case "plain":
      case "command":
      case "pill-candidate":
      case "at-room-pill":
        return text + part.text;

      case "room-pill":
      case "user-pill":
        return text + `${part.text}`;
    }
  }, "");
}

function containsEmote(model
/*: EditorModel*/
) {
  return startsWith(model, "/me ", false);
}

function startsWith(model
/*: EditorModel*/
, prefix
/*: string*/
, caseSensitive = true) {
  const firstPart = model.parts[0]; // part type will be "plain" while editing,
  // and "command" while composing a message.

  let text = firstPart && firstPart.text;

  if (!caseSensitive) {
    prefix = prefix.toLowerCase();
    text = text.toLowerCase();
  }

  return firstPart && (firstPart.type === "plain" || firstPart.type === "command") && text.startsWith(prefix);
}

function stripEmoteCommand(model
/*: EditorModel*/
) {
  // trim "/me "
  return stripPrefix(model, "/me ");
}

function stripPrefix(model
/*: EditorModel*/
, prefix
/*: string*/
) {
  model = model.clone();
  model.removeText({
    index: 0,
    offset: 0
  }, prefix.length);
  return model;
}

function unescapeMessage(model
/*: EditorModel*/
) {
  const {
    parts
  } = model;

  if (parts.length) {
    const firstPart = parts[0]; // only unescape \/ to / at start of editor

    if (firstPart.type === "plain" && firstPart.text.startsWith("\\/")) {
      model = model.clone();
      model.removeText({
        index: 0,
        offset: 0
      }, 1);
    }
  }

  return model;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3Ivc2VyaWFsaXplLnRzIl0sIm5hbWVzIjpbIm1kU2VyaWFsaXplIiwibW9kZWwiLCJwYXJ0cyIsInJlZHVjZSIsImh0bWwiLCJwYXJ0IiwidHlwZSIsInRleHQiLCJyZXBsYWNlIiwiYyIsInJlc291cmNlSWQiLCJodG1sU2VyaWFsaXplSWZOZWVkZWQiLCJmb3JjZUhUTUwiLCJtZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImRpc3BsYXlQYXR0ZXJuIiwiU2RrQ29uZmlnIiwiZ2V0IiwiaW5saW5lUGF0dGVybiIsIlJlZ0V4cCIsIm0iLCJwMSIsInAxZSIsIkFsbEh0bWxFbnRpdGllcyIsImVuY29kZSIsInBhcnNlciIsIk1hcmtkb3duIiwiaXNQbGFpblRleHQiLCJwaHRtbCIsImNoZWVyaW8iLCJsb2FkIiwidG9IVE1MIiwiX3VzZUh0bWxQYXJzZXIyIiwiZGVjb2RlRW50aXRpZXMiLCJlYWNoIiwiaSIsImUiLCJ0ZXgiLCJhdHRyIiwiaW5kZXhPZiIsInRvUGxhaW50ZXh0IiwidGV4dFNlcmlhbGl6ZSIsImNvbnRhaW5zRW1vdGUiLCJzdGFydHNXaXRoIiwicHJlZml4IiwiY2FzZVNlbnNpdGl2ZSIsImZpcnN0UGFydCIsInRvTG93ZXJDYXNlIiwic3RyaXBFbW90ZUNvbW1hbmQiLCJzdHJpcFByZWZpeCIsImNsb25lIiwicmVtb3ZlVGV4dCIsImluZGV4Iiwib2Zmc2V0IiwibGVuZ3RoIiwidW5lc2NhcGVNZXNzYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVPLFNBQVNBLFdBQVQsQ0FBcUJDO0FBQXJCO0FBQUEsRUFBeUM7QUFDNUMsU0FBT0EsS0FBSyxDQUFDQyxLQUFOLENBQVlD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VixDQUFlcUMsVUFBZixDQUEwQixLQUExQixDQUFsQyxFQUFvRTtBQUNoRTNDLE1BQUFBLEtBQUssR0FBR0EsS0FBSyxDQUFDa0QsS0FBTixFQUFSO0FBQ0FsRCxNQUFBQSxLQUFLLENBQUNtRCxVQUFOLENBQWlCO0FBQUNDLFFBQUFBLEtBQUssRUFBRSxDQUFSO0FBQVdDLFFBQUFBLE1BQU0sRUFBRTtBQUFuQixPQUFqQixFQUF3QyxDQUF4QztBQUNIO0FBQ0o7O0FBQ0QsU0FBT3JELEtBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgTWFya2Rvd24gZnJvbSAnLi4vTWFya2Rvd24nO1xuaW1wb3J0IHttYWtlR2VuZXJpY1Blcm1hbGlua30gZnJvbSBcIi4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IEVkaXRvck1vZGVsIGZyb20gXCIuL21vZGVsXCI7XG5pbXBvcnQgeyBBbGxIdG1sRW50aXRpZXMgfSBmcm9tICdodG1sLWVudGl0aWVzJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi9TZGtDb25maWcnO1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZFNlcmlhbGl6ZShtb2RlbDogRWRpdG9yTW9kZWwpIHtcbiAgICByZXR1cm4gbW9kZWwucGFydHMucmVkdWNlKChodG1sLCBwYXJ0KSA9PiB7XG4gICAgICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwibmV3bGluZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBodG1sICsgXCJcXG5cIjtcbiAgICAgICAgICAgIGNhc2UgXCJwbGFpblwiOlxuICAgICAgICAgICAgY2FzZSBcImNvbW1hbmRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJwaWxsLWNhbmRpZGF0ZVwiOlxuICAgICAgICAgICAgY2FzZSBcImF0LXJvb20tcGlsbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBodG1sICsgcGFydC50ZXh0O1xuICAgICAgICAgICAgY2FzZSBcInJvb20tcGlsbFwiOlxuICAgICAgICAgICAgY2FzZSBcInVzZXItcGlsbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBodG1sICtcbiAgICAgICAgICAgICAgICAgICAgYFske3BhcnQudGV4dC5yZXBsYWNlKC9bW1xcXFxcXF1dL2csIGMgPT4gXCJcXFxcXCIgKyBjKX1dKCR7bWFrZUdlbmVyaWNQZXJtYWxpbmsocGFydC5yZXNvdXJjZUlkKX0pYDtcbiAgICAgICAgfVxuICAgIH0sIFwiXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHRtbFNlcmlhbGl6ZUlmTmVlZGVkKG1vZGVsOiBFZGl0b3JNb2RlbCwge2ZvcmNlSFRNTCA9IGZhbHNlfSA9IHt9KSB7XG4gICAgbGV0IG1kID0gbWRTZXJpYWxpemUobW9kZWwpO1xuXG4gICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2xhdGV4X21hdGhzXCIpKSB7XG4gICAgICAgIGNvbnN0IGRpc3BsYXlQYXR0ZXJuID0gKFNka0NvbmZpZy5nZXQoKVsnbGF0ZXhfbWF0aHNfZGVsaW1zJ10gfHwge30pWydkaXNwbGF5X3BhdHRlcm4nXSB8fFxuICAgICAgICAgICAgXCJcXFxcJFxcXFwkKChbXiRdfFxcXFxcXFxcXFxcXCQpKilcXFxcJFxcXFwkXCI7XG4gICAgICAgIGNvbnN0IGlubGluZVBhdHRlcm4gPSAoU2RrQ29uZmlnLmdldCgpWydsYXRleF9tYXRoc19kZWxpbXMnXSB8fCB7fSlbJ2lubGluZV9wYXR0ZXJuJ10gfHxcbiAgICAgICAgICAgIFwiXFxcXCQoKFteJF18XFxcXFxcXFxcXFxcJCkqKVxcXFwkXCI7XG5cbiAgICAgICAgbWQgPSBtZC5yZXBsYWNlKFJlZ0V4cChkaXNwbGF5UGF0dGVybiwgXCJnbVwiKSwgZnVuY3Rpb24obSwgcDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHAxZSA9IEFsbEh0bWxFbnRpdGllcy5lbmNvZGUocDEpO1xuICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IGRhdGEtbXgtbWF0aHM9XCIke3AxZX1cIj5cXG5cXG48L2Rpdj5cXG5cXG5gO1xuICAgICAgICB9KTtcblxuICAgICAgICBtZCA9IG1kLnJlcGxhY2UoUmVnRXhwKGlubGluZVBhdHRlcm4sIFwiZ21cIiksIGZ1bmN0aW9uKG0sIHAxKSB7XG4gICAgICAgICAgICBjb25zdCBwMWUgPSBBbGxIdG1sRW50aXRpZXMuZW5jb2RlKHAxKTtcbiAgICAgICAgICAgIHJldHVybiBgPHNwYW4gZGF0YS1teC1tYXRocz1cIiR7cDFlfVwiPjwvc3Bhbj5gO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgZGl2IHRhZ3MgYWx3YXlzIHN0YXJ0IG9uIGEgbmV3IGxpbmUsIG90aGVyd2lzZSBpdCB3aWxsIGNvbmZ1c2VcbiAgICAgICAgLy8gdGhlIG1hcmtkb3duIHBhcnNlclxuICAgICAgICBtZCA9IG1kLnJlcGxhY2UoLyguKTxkaXYvZywgZnVuY3Rpb24obSwgcDEpIHsgcmV0dXJuIGAke3AxfVxcbjxkaXZgOyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgTWFya2Rvd24obWQpO1xuICAgIGlmICghcGFyc2VyLmlzUGxhaW5UZXh0KCkgfHwgZm9yY2VIVE1MKSB7XG4gICAgICAgIC8vIGZlZWQgTWFya2Rvd24gb3V0cHV0IHRvIEhUTUwgcGFyc2VyXG4gICAgICAgIGNvbnN0IHBodG1sID0gY2hlZXJpby5sb2FkKHBhcnNlci50b0hUTUwoKSxcbiAgICAgICAgICAgIHsgX3VzZUh0bWxQYXJzZXIyOiB0cnVlLCBkZWNvZGVFbnRpdGllczogZmFsc2UgfSlcblxuICAgICAgICAvLyBhZGQgZmFsbGJhY2sgb3V0cHV0IGZvciBsYXRleCBtYXRoLCB3aGljaCBzaG91bGQgbm90IGJlIGludGVycHJldGVkIGFzIG1hcmtkb3duXG4gICAgICAgIHBodG1sKCdkaXYsIHNwYW4nKS5lYWNoKGZ1bmN0aW9uKGksIGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleCA9IHBodG1sKGUpLmF0dHIoJ2RhdGEtbXgtbWF0aHMnKVxuICAgICAgICAgICAgaWYgKHRleCkge1xuICAgICAgICAgICAgICAgIHBodG1sKGUpLmh0bWwoYDxjb2RlPiR7dGV4fTwvY29kZT5gKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBodG1sLmh0bWwoKTtcbiAgICB9XG4gICAgLy8gZW5zdXJlIHJlbW92YWwgb2YgZXNjYXBlIGJhY2tzbGFzaGVzIGluIG5vbi1NYXJrZG93biBtZXNzYWdlc1xuICAgIGlmIChtZC5pbmRleE9mKFwiXFxcXFwiKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIudG9QbGFpbnRleHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0U2VyaWFsaXplKG1vZGVsOiBFZGl0b3JNb2RlbCkge1xuICAgIHJldHVybiBtb2RlbC5wYXJ0cy5yZWR1Y2UoKHRleHQsIHBhcnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXJ0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJuZXdsaW5lXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBcIlxcblwiO1xuICAgICAgICAgICAgY2FzZSBcInBsYWluXCI6XG4gICAgICAgICAgICBjYXNlIFwiY29tbWFuZFwiOlxuICAgICAgICAgICAgY2FzZSBcInBpbGwtY2FuZGlkYXRlXCI6XG4gICAgICAgICAgICBjYXNlIFwiYXQtcm9vbS1waWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBwYXJ0LnRleHQ7XG4gICAgICAgICAgICBjYXNlIFwicm9vbS1waWxsXCI6XG4gICAgICAgICAgICBjYXNlIFwidXNlci1waWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBgJHtwYXJ0LnRleHR9YDtcbiAgICAgICAgfVxuICAgIH0sIFwiXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNFbW90ZShtb2RlbDogRWRpdG9yTW9kZWwpIHtcbiAgICByZXR1cm4gc3RhcnRzV2l0aChtb2RlbCwgXCIvbWUgXCIsIGZhbHNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0c1dpdGgobW9kZWw6IEVkaXRvck1vZGVsLCBwcmVmaXg6IHN0cmluZywgY2FzZVNlbnNpdGl2ZSA9IHRydWUpIHtcbiAgICBjb25zdCBmaXJzdFBhcnQgPSBtb2RlbC5wYXJ0c1swXTtcbiAgICAvLyBwYXJ0IHR5cGUgd2lsbCBiZSBcInBsYWluXCIgd2hpbGUgZWRpdGluZyxcbiAgICAvLyBhbmQgXCJjb21tYW5kXCIgd2hpbGUgY29tcG9zaW5nIGEgbWVzc2FnZS5cbiAgICBsZXQgdGV4dCA9IGZpcnN0UGFydCAmJiBmaXJzdFBhcnQudGV4dDtcbiAgICBpZiAoIWNhc2VTZW5zaXRpdmUpIHtcbiAgICAgICAgcHJlZml4ID0gcHJlZml4LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpcnN0UGFydCAmJiAoZmlyc3RQYXJ0LnR5cGUgPT09IFwicGxhaW5cIiB8fCBmaXJzdFBhcnQudHlwZSA9PT0gXCJjb21tYW5kXCIpICYmIHRleHQuc3RhcnRzV2l0aChwcmVmaXgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBFbW90ZUNvbW1hbmQobW9kZWw6IEVkaXRvck1vZGVsKSB7XG4gICAgLy8gdHJpbSBcIi9tZSBcIlxuICAgIHJldHVybiBzdHJpcFByZWZpeChtb2RlbCwgXCIvbWUgXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBQcmVmaXgobW9kZWw6IEVkaXRvck1vZGVsLCBwcmVmaXg6IHN0cmluZykge1xuICAgIG1vZGVsID0gbW9kZWwuY2xvbmUoKTtcbiAgICBtb2RlbC5yZW1vdmVUZXh0KHtpbmRleDogMCwgb2Zmc2V0OiAwfSwgcHJlZml4Lmxlbmd0aCk7XG4gICAgcmV0dXJuIG1vZGVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVNZXNzYWdlKG1vZGVsOiBFZGl0b3JNb2RlbCkge1xuICAgIGNvbnN0IHtwYXJ0c30gPSBtb2RlbDtcbiAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFydCA9IHBhcnRzWzBdO1xuICAgICAgICAvLyBvbmx5IHVuZXNjYXBlIFxcLyB0byAvIGF0IHN0YXJ0IG9mIGVkaXRvclxuICAgICAgICBpZiAoZmlyc3RQYXJ0LnR5cGUgPT09IFwicGxhaW5cIiAmJiBmaXJzdFBhcnQudGV4dC5zdGFydHNXaXRoKFwiXFxcXC9cIikpIHtcbiAgICAgICAgICAgIG1vZGVsID0gbW9kZWwuY2xvbmUoKTtcbiAgICAgICAgICAgIG1vZGVsLnJlbW92ZVRleHQoe2luZGV4OiAwLCBvZmZzZXQ6IDB9LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbW9kZWw7XG59XG4iXX0=