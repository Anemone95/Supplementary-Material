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
        // Here we use the resourceId for compatibility with non-rich text clients
        // See https://github.com/vector-im/element-web/issues/16660
        return html + `[${part.resourceId.replace(/[[\\\]]/g, c => "\\" + c)}](${(0, _Permalinks.makeGenericPermalink)(part.resourceId)})`;

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
  let md = mdSerialize(model); // copy of raw input to remove unwanted math later

  const orig = md;

  if (_SettingsStore.default.getValue("feature_latex_maths")) {
    const patternNames = ['tex', 'latex'];
    const patternTypes = ['display', 'inline'];
    const patternDefaults = {
      "tex": {
        // detect math with tex delimiters, inline: $...$, display $$...$$
        // preferably use negative lookbehinds, not supported in all major browsers:
        // const displayPattern = "^(?<!\\\\)\\$\\$(?![ \\t])(([^$]|\\\\\\$)+?)\\$\\$$";
        // const inlinePattern = "(?:^|\\s)(?<!\\\\)\\$(?!\\s)(([^$]|\\\\\\$)+?)(?<!\\\\|\\s)\\$";
        // conditions for display math detection $$...$$:
        // - pattern starts and ends on a new line
        // - left delimiter ($$) is not escaped by backslash
        "display": "(^)\\$\\$(([^$]|\\\\\\$)+?)\\$\\$$",
        // conditions for inline math detection $...$:
        // - pattern starts at beginning of line, follows whitespace character or punctuation
        // - pattern is on a single line
        // - left and right delimiters ($) are not escaped by backslashes
        // - left delimiter is not followed by whitespace character
        // - right delimiter is not prefixed with whitespace character
        "inline": "(^|\\s|[.,!?:;])(?!\\\\)\\$(?!\\s)(([^$\\n]|\\\\\\$)*([^\\\\\\s\\$]|\\\\\\$)(?:\\\\\\$)?)\\$"
      },
      "latex": {
        // detect math with latex delimiters, inline: \(...\), display \[...\]
        // conditions for display math detection \[...\]:
        // - pattern starts and ends on a new line
        // - pattern is not empty
        "display": "(^)\\\\\\[(?!\\\\\\])(.*?)\\\\\\]$",
        // conditions for inline math detection \(...\):
        // - pattern starts at beginning of line or is not prefixed with backslash
        // - pattern is not empty
        "inline": "(^|[^\\\\])\\\\\\((?!\\\\\\))(.*?)\\\\\\)"
      }
    };
    patternNames.forEach(function (patternName) {
      patternTypes.forEach(function (patternType) {
        // get the regex replace pattern from config or use the default
        const pattern = (((_SdkConfig.default.get()["latex_maths_delims"] || {})[patternType] || {})["pattern"] || {})[patternName] || patternDefaults[patternName][patternType];
        md = md.replace(RegExp(pattern, "gms"), function (m, p1, p2) {
          const p2e = _htmlEntities.AllHtmlEntities.encode(p2);

          switch (patternType) {
            case "display":
              return `${p1}<div data-mx-maths="${p2e}">\n\n</div>\n\n`;

            case "inline":
              return `${p1}<span data-mx-maths="${p2e}"></span>`;
          }
        });
      });
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
    });

    if (_SettingsStore.default.getValue("feature_latex_maths")) {
      // original Markdown without LaTeX replacements
      const parserOrig = new _Markdown.default(orig);

      const phtmlOrig = _cheerio.default.load(parserOrig.toHTML(), {
        _useHtmlParser2: true,
        decodeEntities: false
      }); // since maths delimiters are handled before Markdown,
      // code blocks could contain mangled content.
      // replace code blocks with original content


      phtmlOrig('code').each(function (i) {
        phtml('code').eq(i).text(phtmlOrig('code').eq(i).text());
      }); // add fallback output for latex math, which should not be interpreted as markdown

      phtml('div, span').each(function (i, e) {
        const tex = phtml(e).attr('data-mx-maths');

        if (tex) {
          phtml(e).html(`<code>${tex}</code>`);
        }
      });
    }

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
        // Here we use the resourceId for compatibility with non-rich text clients
        // See https://github.com/vector-im/element-web/issues/16660
        return text + `${part.resourceId}`;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3Ivc2VyaWFsaXplLnRzIl0sIm5hbWVzIjpbIm1kU2VyaWFsaXplIiwibW9kZWwiLCJwYXJ0cyIsInJlZHVjZSIsImh0bWwiLCJwYXJ0IiwidHlwZSIsInRleHQiLCJyZXNvdXJjZUlkIiwicmVwbGFjZSIsImMiLCJodG1sU2VyaWFsaXplSWZOZWVkZWQiLCJmb3JjZUhUTUwiLCJtZCIsIm9yaWciLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJwYXR0ZXJuTmFtZXMiLCJwYXR0ZXJuVHlwZXMiLCJwYXR0ZXJuRGVmYXVsdHMiLCJmb3JFYWNoIiwicGF0dGVybk5hbWUiLCJwYXR0ZXJuVHlwZSIsInBhdHRlcm4iLCJTZGtDb25maWciLCJnZXQiLCJSZWdFeHAiLCJtIiwicDEiLCJwMiIsInAyZSIsIkFsbEh0bWxFbnRpdGllcyIsImVuY29kZSIsInBhcnNlciIsIk1hcmtkb3duIiwiaXNQbGFpblRleHQiLCJwaHRtbCIsImNoZWVyaW8iLCJsb2FkIiwidG9IVE1MIiwiX3VzZUh0bWxQYXJzZXIyIiwiZGVjb2RlRW50aXRpZXMiLCJwYXJzZXJPcmlnIiwicGh0bWxPcmlnIiwiZWFjaCIsImkiLCJlcSIsImUiLCJ0ZXgiLCJhdHRyIiwiaW5kZXhPZiIsInRvUGxhaW50ZXh0IiwidGV4dFNlcmlhbGl6ZSIsImNvbnRhaW5zRW1vdGUiLCJzdGFydHNXaXRoIiwicHJlZml4IiwiY2FzZVNlbnNpdGl2ZSIsImZpcnN0UGFydCIsInRvTG93ZXJDYXNlIiwic3RyaXBFbW90ZUNvbW1hbmQiLCJzdHJpcFByZWZpeCIsImNsb25lIiwicmVtb3ZlVGV4dCIsImluZGV4Iiwib2Zmc2V0IiwibGVuZ3RoIiwidW5lc2NhcGVNZXNzYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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SyxFQUFFLENBQVI7QUFBV0MsSUFBQUEsTUFBTSxFQUFFO0FBQW5CLEdBQWpCLEVBQXdDVCxNQUFNLENBQUNVLE1BQS9DO0FBQ0EsU0FBT2hFLEtBQVA7QUFDSDs7QUFFTSxTQUFTaUUsZUFBVCxDQUF5QmpFO0FBQXpCO0FBQUEsRUFBNkM7QUFDaEQsUUFBTTtBQUFDQyxJQUFBQTtBQUFELE1BQVVELEtBQWhCOztBQUNBLE1BQUlDLEtBQUssQ0FBQytELE1BQVYsRUFBa0I7QUFDZCxVQUFNUixTQUFTLEdBQUd2RCxLQUFLLENBQUMsQ0FBRCxDQUF2QixDQURjLENBRWQ7O0FBQ0EsUUFBSXVELFNBQVMsQ0FBQ25ELElBQVYsS0FBbUIsT0FBbkIsSUFBOEJtRCxTQUFTLENBQUNsRCxJQUFWLENBQWUrQyxVQUFmLENBQTBCLEtBQTFCLENBQWxDLEVBQW9FO0FBQ2hFckQsTUFBQUEsS0FBSyxHQUFHQSxLQUFLLENBQUM0RCxLQUFOLEVBQVI7QUFDQTVELE1BQUFBLEtBQUssQ0FBQzZELFVBQU4sQ0FBaUI7QUFBQ0MsUUFBQUEsS0FBSyxFQUFFLENBQVI7QUFBV0MsUUFBQUEsTUFBTSxFQUFFO0FBQW5CLE9BQWpCLEVBQXdDLENBQXhDO0FBQ0g7QUFDSjs7QUFDRCxTQUFPL0QsS0FBUDtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBNYXJrZG93biBmcm9tICcuLi9NYXJrZG93bic7XG5pbXBvcnQge21ha2VHZW5lcmljUGVybWFsaW5rfSBmcm9tIFwiLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgRWRpdG9yTW9kZWwgZnJvbSBcIi4vbW9kZWxcIjtcbmltcG9ydCB7IEFsbEh0bWxFbnRpdGllcyB9IGZyb20gJ2h0bWwtZW50aXRpZXMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1kU2VyaWFsaXplKG1vZGVsOiBFZGl0b3JNb2RlbCkge1xuICAgIHJldHVybiBtb2RlbC5wYXJ0cy5yZWR1Y2UoKGh0bWwsIHBhcnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXJ0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJuZXdsaW5lXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWwgKyBcIlxcblwiO1xuICAgICAgICAgICAgY2FzZSBcInBsYWluXCI6XG4gICAgICAgICAgICBjYXNlIFwiY29tbWFuZFwiOlxuICAgICAgICAgICAgY2FzZSBcInBpbGwtY2FuZGlkYXRlXCI6XG4gICAgICAgICAgICBjYXNlIFwiYXQtcm9vbS1waWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWwgKyBwYXJ0LnRleHQ7XG4gICAgICAgICAgICBjYXNlIFwicm9vbS1waWxsXCI6XG4gICAgICAgICAgICAgICAgLy8gSGVyZSB3ZSB1c2UgdGhlIHJlc291cmNlSWQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24tcmljaCB0ZXh0IGNsaWVudHNcbiAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTY2NjBcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbCArXG4gICAgICAgICAgICAgICAgICAgIGBbJHtwYXJ0LnJlc291cmNlSWQucmVwbGFjZSgvW1tcXFxcXFxdXS9nLCBjID0+IFwiXFxcXFwiICsgYyl9XSgke21ha2VHZW5lcmljUGVybWFsaW5rKHBhcnQucmVzb3VyY2VJZCl9KWA7XG4gICAgICAgICAgICBjYXNlIFwidXNlci1waWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWwgK1xuICAgICAgICAgICAgICAgICAgICBgWyR7cGFydC50ZXh0LnJlcGxhY2UoL1tbXFxcXFxcXV0vZywgYyA9PiBcIlxcXFxcIiArIGMpfV0oJHttYWtlR2VuZXJpY1Blcm1hbGluayhwYXJ0LnJlc291cmNlSWQpfSlgO1xuICAgICAgICB9XG4gICAgfSwgXCJcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodG1sU2VyaWFsaXplSWZOZWVkZWQobW9kZWw6IEVkaXRvck1vZGVsLCB7Zm9yY2VIVE1MID0gZmFsc2V9ID0ge30pIHtcbiAgICBsZXQgbWQgPSBtZFNlcmlhbGl6ZShtb2RlbCk7XG4gICAgLy8gY29weSBvZiByYXcgaW5wdXQgdG8gcmVtb3ZlIHVud2FudGVkIG1hdGggbGF0ZXJcbiAgICBjb25zdCBvcmlnID0gbWQ7XG5cbiAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbGF0ZXhfbWF0aHNcIikpIHtcbiAgICAgICAgY29uc3QgcGF0dGVybk5hbWVzID0gWyd0ZXgnLCAnbGF0ZXgnXTtcbiAgICAgICAgY29uc3QgcGF0dGVyblR5cGVzID0gWydkaXNwbGF5JywgJ2lubGluZSddO1xuICAgICAgICBjb25zdCBwYXR0ZXJuRGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBcInRleFwiOiB7XG4gICAgICAgICAgICAgICAgLy8gZGV0ZWN0IG1hdGggd2l0aCB0ZXggZGVsaW1pdGVycywgaW5saW5lOiAkLi4uJCwgZGlzcGxheSAkJC4uLiQkXG4gICAgICAgICAgICAgICAgLy8gcHJlZmVyYWJseSB1c2UgbmVnYXRpdmUgbG9va2JlaGluZHMsIG5vdCBzdXBwb3J0ZWQgaW4gYWxsIG1ham9yIGJyb3dzZXJzOlxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGRpc3BsYXlQYXR0ZXJuID0gXCJeKD88IVxcXFxcXFxcKVxcXFwkXFxcXCQoPyFbIFxcXFx0XSkoKFteJF18XFxcXFxcXFxcXFxcJCkrPylcXFxcJFxcXFwkJFwiO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGlubGluZVBhdHRlcm4gPSBcIig/Ol58XFxcXHMpKD88IVxcXFxcXFxcKVxcXFwkKD8hXFxcXHMpKChbXiRdfFxcXFxcXFxcXFxcXCQpKz8pKD88IVxcXFxcXFxcfFxcXFxzKVxcXFwkXCI7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25kaXRpb25zIGZvciBkaXNwbGF5IG1hdGggZGV0ZWN0aW9uICQkLi4uJCQ6XG4gICAgICAgICAgICAgICAgLy8gLSBwYXR0ZXJuIHN0YXJ0cyBhbmQgZW5kcyBvbiBhIG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgLy8gLSBsZWZ0IGRlbGltaXRlciAoJCQpIGlzIG5vdCBlc2NhcGVkIGJ5IGJhY2tzbGFzaFxuICAgICAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcIiheKVxcXFwkXFxcXCQoKFteJF18XFxcXFxcXFxcXFxcJCkrPylcXFxcJFxcXFwkJFwiLFxuXG4gICAgICAgICAgICAgICAgLy8gY29uZGl0aW9ucyBmb3IgaW5saW5lIG1hdGggZGV0ZWN0aW9uICQuLi4kOlxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBzdGFydHMgYXQgYmVnaW5uaW5nIG9mIGxpbmUsIGZvbGxvd3Mgd2hpdGVzcGFjZSBjaGFyYWN0ZXIgb3IgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICAvLyAtIHBhdHRlcm4gaXMgb24gYSBzaW5nbGUgbGluZVxuICAgICAgICAgICAgICAgIC8vIC0gbGVmdCBhbmQgcmlnaHQgZGVsaW1pdGVycyAoJCkgYXJlIG5vdCBlc2NhcGVkIGJ5IGJhY2tzbGFzaGVzXG4gICAgICAgICAgICAgICAgLy8gLSBsZWZ0IGRlbGltaXRlciBpcyBub3QgZm9sbG93ZWQgYnkgd2hpdGVzcGFjZSBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAvLyAtIHJpZ2h0IGRlbGltaXRlciBpcyBub3QgcHJlZml4ZWQgd2l0aCB3aGl0ZXNwYWNlIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIFwiaW5saW5lXCI6XG4gICAgICAgICAgICAgICAgICAgIFwiKF58XFxcXHN8Wy4sIT86O10pKD8hXFxcXFxcXFwpXFxcXCQoPyFcXFxccykoKFteJFxcXFxuXXxcXFxcXFxcXFxcXFwkKSooW15cXFxcXFxcXFxcXFxzXFxcXCRdfFxcXFxcXFxcXFxcXCQpKD86XFxcXFxcXFxcXFxcJCk/KVxcXFwkXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJsYXRleFwiOiB7XG4gICAgICAgICAgICAgICAgLy8gZGV0ZWN0IG1hdGggd2l0aCBsYXRleCBkZWxpbWl0ZXJzLCBpbmxpbmU6IFxcKC4uLlxcKSwgZGlzcGxheSBcXFsuLi5cXF1cblxuICAgICAgICAgICAgICAgIC8vIGNvbmRpdGlvbnMgZm9yIGRpc3BsYXkgbWF0aCBkZXRlY3Rpb24gXFxbLi4uXFxdOlxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBzdGFydHMgYW5kIGVuZHMgb24gYSBuZXcgbGluZVxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBpcyBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCIoXilcXFxcXFxcXFxcXFxbKD8hXFxcXFxcXFxcXFxcXSkoLio/KVxcXFxcXFxcXFxcXF0kXCIsXG5cbiAgICAgICAgICAgICAgICAvLyBjb25kaXRpb25zIGZvciBpbmxpbmUgbWF0aCBkZXRlY3Rpb24gXFwoLi4uXFwpOlxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBzdGFydHMgYXQgYmVnaW5uaW5nIG9mIGxpbmUgb3IgaXMgbm90IHByZWZpeGVkIHdpdGggYmFja3NsYXNoXG4gICAgICAgICAgICAgICAgLy8gLSBwYXR0ZXJuIGlzIG5vdCBlbXB0eVxuICAgICAgICAgICAgICAgIFwiaW5saW5lXCI6IFwiKF58W15cXFxcXFxcXF0pXFxcXFxcXFxcXFxcKCg/IVxcXFxcXFxcXFxcXCkpKC4qPylcXFxcXFxcXFxcXFwpXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHBhdHRlcm5OYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKHBhdHRlcm5OYW1lKSB7XG4gICAgICAgICAgICBwYXR0ZXJuVHlwZXMuZm9yRWFjaChmdW5jdGlvbihwYXR0ZXJuVHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgcmVnZXggcmVwbGFjZSBwYXR0ZXJuIGZyb20gY29uZmlnIG9yIHVzZSB0aGUgZGVmYXVsdFxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSAoKChTZGtDb25maWcuZ2V0KClbXCJsYXRleF9tYXRoc19kZWxpbXNcIl0gfHxcbiAgICAgICAgICAgICAgICAgICAge30pW3BhdHRlcm5UeXBlXSB8fCB7fSlbXCJwYXR0ZXJuXCJdIHx8IHt9KVtwYXR0ZXJuTmFtZV0gfHxcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybkRlZmF1bHRzW3BhdHRlcm5OYW1lXVtwYXR0ZXJuVHlwZV07XG5cbiAgICAgICAgICAgICAgICBtZCA9IG1kLnJlcGxhY2UoUmVnRXhwKHBhdHRlcm4sIFwiZ21zXCIpLCBmdW5jdGlvbihtLCBwMSwgcDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcDJlID0gQWxsSHRtbEVudGl0aWVzLmVuY29kZShwMik7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocGF0dGVyblR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkaXNwbGF5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3AxfTxkaXYgZGF0YS1teC1tYXRocz1cIiR7cDJlfVwiPlxcblxcbjwvZGl2PlxcblxcbmA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaW5saW5lXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3AxfTxzcGFuIGRhdGEtbXgtbWF0aHM9XCIke3AyZX1cIj48L3NwYW4+YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSBkaXYgdGFncyBhbHdheXMgc3RhcnQgb24gYSBuZXcgbGluZSwgb3RoZXJ3aXNlIGl0IHdpbGwgY29uZnVzZVxuICAgICAgICAvLyB0aGUgbWFya2Rvd24gcGFyc2VyXG4gICAgICAgIG1kID0gbWQucmVwbGFjZSgvKC4pPGRpdi9nLCBmdW5jdGlvbihtLCBwMSkgeyByZXR1cm4gYCR7cDF9XFxuPGRpdmA7IH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBNYXJrZG93bihtZCk7XG4gICAgaWYgKCFwYXJzZXIuaXNQbGFpblRleHQoKSB8fCBmb3JjZUhUTUwpIHtcbiAgICAgICAgLy8gZmVlZCBNYXJrZG93biBvdXRwdXQgdG8gSFRNTCBwYXJzZXJcbiAgICAgICAgY29uc3QgcGh0bWwgPSBjaGVlcmlvLmxvYWQocGFyc2VyLnRvSFRNTCgpLFxuICAgICAgICAgICAgeyBfdXNlSHRtbFBhcnNlcjI6IHRydWUsIGRlY29kZUVudGl0aWVzOiBmYWxzZSB9KTtcblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbGF0ZXhfbWF0aHNcIikpIHtcbiAgICAgICAgICAgIC8vIG9yaWdpbmFsIE1hcmtkb3duIHdpdGhvdXQgTGFUZVggcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjb25zdCBwYXJzZXJPcmlnID0gbmV3IE1hcmtkb3duKG9yaWcpO1xuICAgICAgICAgICAgY29uc3QgcGh0bWxPcmlnID0gY2hlZXJpby5sb2FkKHBhcnNlck9yaWcudG9IVE1MKCksXG4gICAgICAgICAgICAgICAgeyBfdXNlSHRtbFBhcnNlcjI6IHRydWUsIGRlY29kZUVudGl0aWVzOiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgLy8gc2luY2UgbWF0aHMgZGVsaW1pdGVycyBhcmUgaGFuZGxlZCBiZWZvcmUgTWFya2Rvd24sXG4gICAgICAgICAgICAvLyBjb2RlIGJsb2NrcyBjb3VsZCBjb250YWluIG1hbmdsZWQgY29udGVudC5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgY29kZSBibG9ja3Mgd2l0aCBvcmlnaW5hbCBjb250ZW50XG4gICAgICAgICAgICBwaHRtbE9yaWcoJ2NvZGUnKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICBwaHRtbCgnY29kZScpLmVxKGkpLnRleHQocGh0bWxPcmlnKCdjb2RlJykuZXEoaSkudGV4dCgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhZGQgZmFsbGJhY2sgb3V0cHV0IGZvciBsYXRleCBtYXRoLCB3aGljaCBzaG91bGQgbm90IGJlIGludGVycHJldGVkIGFzIG1hcmtkb3duXG4gICAgICAgICAgICBwaHRtbCgnZGl2LCBzcGFuJykuZWFjaChmdW5jdGlvbihpLCBlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4ID0gcGh0bWwoZSkuYXR0cignZGF0YS1teC1tYXRocycpXG4gICAgICAgICAgICAgICAgaWYgKHRleCkge1xuICAgICAgICAgICAgICAgICAgICBwaHRtbChlKS5odG1sKGA8Y29kZT4ke3RleH08L2NvZGU+YClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGh0bWwuaHRtbCgpO1xuICAgIH1cbiAgICAvLyBlbnN1cmUgcmVtb3ZhbCBvZiBlc2NhcGUgYmFja3NsYXNoZXMgaW4gbm9uLU1hcmtkb3duIG1lc3NhZ2VzXG4gICAgaWYgKG1kLmluZGV4T2YoXCJcXFxcXCIpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci50b1BsYWludGV4dCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRleHRTZXJpYWxpemUobW9kZWw6IEVkaXRvck1vZGVsKSB7XG4gICAgcmV0dXJuIG1vZGVsLnBhcnRzLnJlZHVjZSgodGV4dCwgcGFydCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcIm5ld2xpbmVcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dCArIFwiXFxuXCI7XG4gICAgICAgICAgICBjYXNlIFwicGxhaW5cIjpcbiAgICAgICAgICAgIGNhc2UgXCJjb21tYW5kXCI6XG4gICAgICAgICAgICBjYXNlIFwicGlsbC1jYW5kaWRhdGVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJhdC1yb29tLXBpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dCArIHBhcnQudGV4dDtcbiAgICAgICAgICAgIGNhc2UgXCJyb29tLXBpbGxcIjpcbiAgICAgICAgICAgICAgICAvLyBIZXJlIHdlIHVzZSB0aGUgcmVzb3VyY2VJZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1yaWNoIHRleHQgY2xpZW50c1xuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNjY2MFxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0ICsgYCR7cGFydC5yZXNvdXJjZUlkfWA7XG4gICAgICAgICAgICBjYXNlIFwidXNlci1waWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBgJHtwYXJ0LnRleHR9YDtcbiAgICAgICAgfVxuICAgIH0sIFwiXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNFbW90ZShtb2RlbDogRWRpdG9yTW9kZWwpIHtcbiAgICByZXR1cm4gc3RhcnRzV2l0aChtb2RlbCwgXCIvbWUgXCIsIGZhbHNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0c1dpdGgobW9kZWw6IEVkaXRvck1vZGVsLCBwcmVmaXg6IHN0cmluZywgY2FzZVNlbnNpdGl2ZSA9IHRydWUpIHtcbiAgICBjb25zdCBmaXJzdFBhcnQgPSBtb2RlbC5wYXJ0c1swXTtcbiAgICAvLyBwYXJ0IHR5cGUgd2lsbCBiZSBcInBsYWluXCIgd2hpbGUgZWRpdGluZyxcbiAgICAvLyBhbmQgXCJjb21tYW5kXCIgd2hpbGUgY29tcG9zaW5nIGEgbWVzc2FnZS5cbiAgICBsZXQgdGV4dCA9IGZpcnN0UGFydCAmJiBmaXJzdFBhcnQudGV4dDtcbiAgICBpZiAoIWNhc2VTZW5zaXRpdmUpIHtcbiAgICAgICAgcHJlZml4ID0gcHJlZml4LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpcnN0UGFydCAmJiAoZmlyc3RQYXJ0LnR5cGUgPT09IFwicGxhaW5cIiB8fCBmaXJzdFBhcnQudHlwZSA9PT0gXCJjb21tYW5kXCIpICYmIHRleHQuc3RhcnRzV2l0aChwcmVmaXgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBFbW90ZUNvbW1hbmQobW9kZWw6IEVkaXRvck1vZGVsKSB7XG4gICAgLy8gdHJpbSBcIi9tZSBcIlxuICAgIHJldHVybiBzdHJpcFByZWZpeChtb2RlbCwgXCIvbWUgXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBQcmVmaXgobW9kZWw6IEVkaXRvck1vZGVsLCBwcmVmaXg6IHN0cmluZykge1xuICAgIG1vZGVsID0gbW9kZWwuY2xvbmUoKTtcbiAgICBtb2RlbC5yZW1vdmVUZXh0KHtpbmRleDogMCwgb2Zmc2V0OiAwfSwgcHJlZml4Lmxlbmd0aCk7XG4gICAgcmV0dXJuIG1vZGVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVNZXNzYWdlKG1vZGVsOiBFZGl0b3JNb2RlbCkge1xuICAgIGNvbnN0IHtwYXJ0c30gPSBtb2RlbDtcbiAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFydCA9IHBhcnRzWzBdO1xuICAgICAgICAvLyBvbmx5IHVuZXNjYXBlIFxcLyB0byAvIGF0IHN0YXJ0IG9mIGVkaXRvclxuICAgICAgICBpZiAoZmlyc3RQYXJ0LnR5cGUgPT09IFwicGxhaW5cIiAmJiBmaXJzdFBhcnQudGV4dC5zdGFydHNXaXRoKFwiXFxcXC9cIikpIHtcbiAgICAgICAgICAgIG1vZGVsID0gbW9kZWwuY2xvbmUoKTtcbiAgICAgICAgICAgIG1vZGVsLnJlbW92ZVRleHQoe2luZGV4OiAwLCBvZmZzZXQ6IDB9LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbW9kZWw7XG59XG4iXX0=