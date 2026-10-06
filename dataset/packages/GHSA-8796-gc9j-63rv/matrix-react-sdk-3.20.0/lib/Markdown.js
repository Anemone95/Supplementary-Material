"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var commonmark = _interopRequireWildcard(require("commonmark"));

var _lodash = require("lodash");

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
const ALLOWED_HTML_TAGS = ['sub', 'sup', 'del', 'u']; // These types of node are definitely text

const TEXT_NODES = ['text', 'softbreak', 'linebreak', 'paragraph', 'document'];

function is_allowed_html_tag(node) {
  if (node.literal != null && node.literal.match('^<((div|span) data-mx-maths="[^"]*"|\/(div|span))>$') != null) {
    return true;
  } // Regex won't work for tags with attrs, but we only
  // allow <del> anyway.


  const matches = /^<\/?(.*)>$/.exec(node.literal);

  if (matches && matches.length == 2) {
    const tag = matches[1];
    return ALLOWED_HTML_TAGS.indexOf(tag) > -1;
  }

  return false;
}

function html_if_tag_allowed(node) {
  if (is_allowed_html_tag(node)) {
    this.lit(node.literal);
    return;
  } else {
    this.lit((0, _lodash.escape)(node.literal));
  }
}
/*
 * Returns true if the parse output containing the node
 * comprises multiple block level elements (ie. lines),
 * or false if it is only a single line.
 */


function is_multi_line(node) {
  let par = node;

  while (par.parent) {
    par = par.parent;
  }

  return par.firstChild != par.lastChild;
}
/**
 * Class that wraps commonmark, adding the ability to see whether
 * a given message actually uses any markdown syntax or whether
 * it's plain text.
 */


class Markdown {
  constructor(input) {
    this.input = input;
    const parser = new commonmark.Parser();
    this.parsed = parser.parse(this.input);
  }

  isPlainText() {
    const walker = this.parsed.walker();
    let ev;

    while (ev = walker.next()) {
      const node = ev.node;

      if (TEXT_NODES.indexOf(node.type) > -1) {
        // definitely text
        continue;
      } else if (node.type == 'html_inline' || node.type == 'html_block') {
        // if it's an allowed html tag, we need to render it and therefore
        // we will need to use HTML. If it's not allowed, it's not HTML since
        // we'll just be treating it as text.
        if (is_allowed_html_tag(node)) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  toHTML({
    externalLinks = false
  } = {}) {
    const renderer = new commonmark.HtmlRenderer({
      safe: false,
      // Set soft breaks to hard HTML breaks: commonmark
      // puts softbreaks in for multiple lines in a blockquote,
      // so if these are just newline characters then the
      // block quote ends up all on one line
      // (https://github.com/vector-im/element-web/issues/3154)
      softbreak: '<br />'
    }); // Trying to strip out the wrapping <p/> causes a lot more complication
    // than it's worth, i think.  For instance, this code will go and strip
    // out any <p/> tag (no matter where it is in the tree) which doesn't
    // contain \n's.
    // On the flip side, <p/>s are quite opionated and restricted on where
    // you can nest them.
    //
    // Let's try sending with <p/>s anyway for now, though.

    const real_paragraph = renderer.paragraph;

    renderer.paragraph = function (node, entering) {
      // If there is only one top level node, just return the
      // bare text: it's a single line of text and so should be
      // 'inline', rather than unnecessarily wrapped in its own
      // p tag. If, however, we have multiple nodes, each gets
      // its own p tag to keep them as separate paragraphs.
      if (is_multi_line(node)) {
        real_paragraph.call(this, node, entering);
      }
    };

    renderer.link = function (node, entering) {
      const attrs = this.attrs(node);

      if (entering) {
        attrs.push(['href', this.esc(node.destination)]);

        if (node.title) {
          attrs.push(['title', this.esc(node.title)]);
        } // Modified link behaviour to treat them all as external and
        // thus opening in a new tab.


        if (externalLinks) {
          attrs.push(['target', '_blank']);
          attrs.push(['rel', 'noreferrer noopener']);
        }

        this.tag('a', attrs);
      } else {
        this.tag('/a');
      }
    };

    renderer.html_inline = html_if_tag_allowed;

    renderer.html_block = function (node) {
      /*
                  // as with `paragraph`, we only insert line breaks
                  // if there are multiple lines in the markdown.
                  const isMultiLine = is_multi_line(node);
                  if (isMultiLine) this.cr();
      */
      html_if_tag_allowed.call(this, node);
      /*
                  if (isMultiLine) this.cr();
      */
    };

    return renderer.render(this.parsed);
  }
  /*
   * Render the markdown message to plain text. That is, essentially
   * just remove any backslashes escaping what would otherwise be
   * markdown syntax
   * (to fix https://github.com/vector-im/element-web/issues/2870).
   *
   * N.B. this does **NOT** render arbitrary MD to plain text - only MD
   * which has no formatting.  Otherwise it emits HTML(!).
   */


  toPlaintext() {
    const renderer = new commonmark.HtmlRenderer({
      safe: false
    });
    const real_paragraph = renderer.paragraph;

    renderer.paragraph = function (node, entering) {
      // as with toHTML, only append lines to paragraphs if there are
      // multiple paragraphs
      if (is_multi_line(node)) {
        if (!entering && node.next) {
          this.lit('\n\n');
        }
      }
    };

    renderer.html_block = function (node) {
      this.lit(node.literal);
      if (is_multi_line(node) && node.next) this.lit('\n\n');
    };

    return renderer.render(this.parsed);
  }

}

exports.default = Markdown;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9NYXJrZG93bi5qcyJdLCJuYW1lcyI6WyJBTExPV0VEX0hUTUxfVEFHUyIsIlRFWFRfTk9ERVMiLCJpc19hbGxvd2VkX2h0bWxfdGFnIiwibm9kZSIsImxpdGVyYWwiLCJtYXRjaCIsIm1hdGNoZXMiLCJleGVjIiwibGVuZ3RoIiwidGFnIiwiaW5kZXhPZiIsImh0bWxfaWZfdGFnX2FsbG93ZWQiLCJsaXQiLCJpc19tdWx0aV9saW5lIiwicGFyIiwicGFyZW50IiwiZmlyc3RDaGlsZCIsImxhc3RDaGlsZCIsIk1hcmtkb3duIiwiY29uc3RydWN0b3IiLCJpbnB1dCIsInBhcnNlciIsImNvbW1vbm1hcmsiLCJQYXJzZXIiLCJwYXJzZWQiLCJwYXJzZSIsImlzUGxhaW5UZXh0Iiwid2Fsa2VyIiwiZXYiLCJuZXh0IiwidHlwZSIsInRvSFRNTCIsImV4dGVybmFsTGlua3MiLCJyZW5kZXJlciIsIkh0bWxSZW5kZXJlciIsInNhZmUiLCJzb2Z0YnJlYWsiLCJyZWFsX3BhcmFncmFwaCIsInBhcmFncmFwaCIsImVudGVyaW5nIiwiY2FsbCIsImxpbmsiLCJhdHRycyIsInB1c2giLCJlc2MiLCJkZXN0aW5hdGlvbiIsInRpdGxlIiwiaHRtbF9pbmxpbmUiLCJodG1sX2Jsb2NrIiwicmVuZGVyIiwidG9QbGFpbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0EsTUFBTUEsaUJBQWlCLEdBQUcsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsR0FBdEIsQ0FBMUIsQyxDQUVBOztBQUNBLE1BQU1DLFVBQVUsR0FBRyxDQUFDLE1BQUQsRUFBUyxXQUFULEVBQXNCLFdBQXRCLEVBQW1DLFdBQW5DLEVBQWdELFVBQWhELENBQW5COztBQUVBLFNBQVNDLG1CQUFULENBQTZCQyxJ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LEtBQUt6QixNQUFyQixDQUFQO0FBQ0g7O0FBbkl5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIGNvbW1vbm1hcmsgZnJvbSAnY29tbW9ubWFyayc7XG5pbXBvcnQge2VzY2FwZX0gZnJvbSBcImxvZGFzaFwiO1xuXG5jb25zdCBBTExPV0VEX0hUTUxfVEFHUyA9IFsnc3ViJywgJ3N1cCcsICdkZWwnLCAndSddO1xuXG4vLyBUaGVzZSB0eXBlcyBvZiBub2RlIGFyZSBkZWZpbml0ZWx5IHRleHRcbmNvbnN0IFRFWFRfTk9ERVMgPSBbJ3RleHQnLCAnc29mdGJyZWFrJywgJ2xpbmVicmVhaycsICdwYXJhZ3JhcGgnLCAnZG9jdW1lbnQnXTtcblxuZnVuY3Rpb24gaXNfYWxsb3dlZF9odG1sX3RhZyhub2RlKSB7XG4gICAgaWYgKG5vZGUubGl0ZXJhbCAhPSBudWxsICYmXG4gICAgICAgIG5vZGUubGl0ZXJhbC5tYXRjaCgnXjwoKGRpdnxzcGFuKSBkYXRhLW14LW1hdGhzPVwiW15cIl0qXCJ8XFwvKGRpdnxzcGFuKSk+JCcpICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmVnZXggd29uJ3Qgd29yayBmb3IgdGFncyB3aXRoIGF0dHJzLCBidXQgd2Ugb25seVxuICAgIC8vIGFsbG93IDxkZWw+IGFueXdheS5cbiAgICBjb25zdCBtYXRjaGVzID0gL148XFwvPyguKik+JC8uZXhlYyhub2RlLmxpdGVyYWwpO1xuICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgY29uc3QgdGFnID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgcmV0dXJuIEFMTE9XRURfSFRNTF9UQUdTLmluZGV4T2YodGFnKSA+IC0xO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaHRtbF9pZl90YWdfYWxsb3dlZChub2RlKSB7XG4gICAgaWYgKGlzX2FsbG93ZWRfaHRtbF90YWcobm9kZSkpIHtcbiAgICAgICAgdGhpcy5saXQobm9kZS5saXRlcmFsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGl0KGVzY2FwZShub2RlLmxpdGVyYWwpKTtcbiAgICB9XG59XG5cbi8qXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHBhcnNlIG91dHB1dCBjb250YWluaW5nIHRoZSBub2RlXG4gKiBjb21wcmlzZXMgbXVsdGlwbGUgYmxvY2sgbGV2ZWwgZWxlbWVudHMgKGllLiBsaW5lcyksXG4gKiBvciBmYWxzZSBpZiBpdCBpcyBvbmx5IGEgc2luZ2xlIGxpbmUuXG4gKi9cbmZ1bmN0aW9uIGlzX211bHRpX2xpbmUobm9kZSkge1xuICAgIGxldCBwYXIgPSBub2RlO1xuICAgIHdoaWxlIChwYXIucGFyZW50KSB7XG4gICAgICAgIHBhciA9IHBhci5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBwYXIuZmlyc3RDaGlsZCAhPSBwYXIubGFzdENoaWxkO1xufVxuXG4vKipcbiAqIENsYXNzIHRoYXQgd3JhcHMgY29tbW9ubWFyaywgYWRkaW5nIHRoZSBhYmlsaXR5IHRvIHNlZSB3aGV0aGVyXG4gKiBhIGdpdmVuIG1lc3NhZ2UgYWN0dWFsbHkgdXNlcyBhbnkgbWFya2Rvd24gc3ludGF4IG9yIHdoZXRoZXJcbiAqIGl0J3MgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFya2Rvd24ge1xuICAgIGNvbnN0cnVjdG9yKGlucHV0KSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcblxuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY29tbW9ubWFyay5QYXJzZXIoKTtcbiAgICAgICAgdGhpcy5wYXJzZWQgPSBwYXJzZXIucGFyc2UodGhpcy5pbnB1dCk7XG4gICAgfVxuXG4gICAgaXNQbGFpblRleHQoKSB7XG4gICAgICAgIGNvbnN0IHdhbGtlciA9IHRoaXMucGFyc2VkLndhbGtlcigpO1xuXG4gICAgICAgIGxldCBldjtcbiAgICAgICAgd2hpbGUgKCAoZXYgPSB3YWxrZXIubmV4dCgpKSApIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBldi5ub2RlO1xuICAgICAgICAgICAgaWYgKFRFWFRfTk9ERVMuaW5kZXhPZihub2RlLnR5cGUpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBkZWZpbml0ZWx5IHRleHRcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09ICdodG1sX2lubGluZScgfHwgbm9kZS50eXBlID09ICdodG1sX2Jsb2NrJykge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0J3MgYW4gYWxsb3dlZCBodG1sIHRhZywgd2UgbmVlZCB0byByZW5kZXIgaXQgYW5kIHRoZXJlZm9yZVxuICAgICAgICAgICAgICAgIC8vIHdlIHdpbGwgbmVlZCB0byB1c2UgSFRNTC4gSWYgaXQncyBub3QgYWxsb3dlZCwgaXQncyBub3QgSFRNTCBzaW5jZVxuICAgICAgICAgICAgICAgIC8vIHdlJ2xsIGp1c3QgYmUgdHJlYXRpbmcgaXQgYXMgdGV4dC5cbiAgICAgICAgICAgICAgICBpZiAoaXNfYWxsb3dlZF9odG1sX3RhZyhub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdG9IVE1MKHsgZXh0ZXJuYWxMaW5rcyA9IGZhbHNlIH0gPSB7fSkge1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IG5ldyBjb21tb25tYXJrLkh0bWxSZW5kZXJlcih7XG4gICAgICAgICAgICBzYWZlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gU2V0IHNvZnQgYnJlYWtzIHRvIGhhcmQgSFRNTCBicmVha3M6IGNvbW1vbm1hcmtcbiAgICAgICAgICAgIC8vIHB1dHMgc29mdGJyZWFrcyBpbiBmb3IgbXVsdGlwbGUgbGluZXMgaW4gYSBibG9ja3F1b3RlLFxuICAgICAgICAgICAgLy8gc28gaWYgdGhlc2UgYXJlIGp1c3QgbmV3bGluZSBjaGFyYWN0ZXJzIHRoZW4gdGhlXG4gICAgICAgICAgICAvLyBibG9jayBxdW90ZSBlbmRzIHVwIGFsbCBvbiBvbmUgbGluZVxuICAgICAgICAgICAgLy8gKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzMxNTQpXG4gICAgICAgICAgICBzb2Z0YnJlYWs6ICc8YnIgLz4nLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUcnlpbmcgdG8gc3RyaXAgb3V0IHRoZSB3cmFwcGluZyA8cC8+IGNhdXNlcyBhIGxvdCBtb3JlIGNvbXBsaWNhdGlvblxuICAgICAgICAvLyB0aGFuIGl0J3Mgd29ydGgsIGkgdGhpbmsuICBGb3IgaW5zdGFuY2UsIHRoaXMgY29kZSB3aWxsIGdvIGFuZCBzdHJpcFxuICAgICAgICAvLyBvdXQgYW55IDxwLz4gdGFnIChubyBtYXR0ZXIgd2hlcmUgaXQgaXMgaW4gdGhlIHRyZWUpIHdoaWNoIGRvZXNuJ3RcbiAgICAgICAgLy8gY29udGFpbiBcXG4ncy5cbiAgICAgICAgLy8gT24gdGhlIGZsaXAgc2lkZSwgPHAvPnMgYXJlIHF1aXRlIG9waW9uYXRlZCBhbmQgcmVzdHJpY3RlZCBvbiB3aGVyZVxuICAgICAgICAvLyB5b3UgY2FuIG5lc3QgdGhlbS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTGV0J3MgdHJ5IHNlbmRpbmcgd2l0aCA8cC8+cyBhbnl3YXkgZm9yIG5vdywgdGhvdWdoLlxuXG4gICAgICAgIGNvbnN0IHJlYWxfcGFyYWdyYXBoID0gcmVuZGVyZXIucGFyYWdyYXBoO1xuXG4gICAgICAgIHJlbmRlcmVyLnBhcmFncmFwaCA9IGZ1bmN0aW9uKG5vZGUsIGVudGVyaW5nKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBvbmx5IG9uZSB0b3AgbGV2ZWwgbm9kZSwganVzdCByZXR1cm4gdGhlXG4gICAgICAgICAgICAvLyBiYXJlIHRleHQ6IGl0J3MgYSBzaW5nbGUgbGluZSBvZiB0ZXh0IGFuZCBzbyBzaG91bGQgYmVcbiAgICAgICAgICAgIC8vICdpbmxpbmUnLCByYXRoZXIgdGhhbiB1bm5lY2Vzc2FyaWx5IHdyYXBwZWQgaW4gaXRzIG93blxuICAgICAgICAgICAgLy8gcCB0YWcuIElmLCBob3dldmVyLCB3ZSBoYXZlIG11bHRpcGxlIG5vZGVzLCBlYWNoIGdldHNcbiAgICAgICAgICAgIC8vIGl0cyBvd24gcCB0YWcgdG8ga2VlcCB0aGVtIGFzIHNlcGFyYXRlIHBhcmFncmFwaHMuXG4gICAgICAgICAgICBpZiAoaXNfbXVsdGlfbGluZShub2RlKSkge1xuICAgICAgICAgICAgICAgIHJlYWxfcGFyYWdyYXBoLmNhbGwodGhpcywgbm9kZSwgZW50ZXJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlbmRlcmVyLmxpbmsgPSBmdW5jdGlvbihub2RlLCBlbnRlcmluZykge1xuICAgICAgICAgICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGVudGVyaW5nKSB7XG4gICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ2hyZWYnLCB0aGlzLmVzYyhub2RlLmRlc3RpbmF0aW9uKV0pO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWyd0aXRsZScsIHRoaXMuZXNjKG5vZGUudGl0bGUpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIE1vZGlmaWVkIGxpbmsgYmVoYXZpb3VyIHRvIHRyZWF0IHRoZW0gYWxsIGFzIGV4dGVybmFsIGFuZFxuICAgICAgICAgICAgICAgIC8vIHRodXMgb3BlbmluZyBpbiBhIG5ldyB0YWIuXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVybmFsTGlua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ3RhcmdldCcsICdfYmxhbmsnXSk7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWydyZWwnLCAnbm9yZWZlcnJlciBub29wZW5lciddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50YWcoJ2EnLCBhdHRycyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudGFnKCcvYScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlbmRlcmVyLmh0bWxfaW5saW5lID0gaHRtbF9pZl90YWdfYWxsb3dlZDtcblxuICAgICAgICByZW5kZXJlci5odG1sX2Jsb2NrID0gZnVuY3Rpb24obm9kZSkge1xuLypcbiAgICAgICAgICAgIC8vIGFzIHdpdGggYHBhcmFncmFwaGAsIHdlIG9ubHkgaW5zZXJ0IGxpbmUgYnJlYWtzXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbGluZXMgaW4gdGhlIG1hcmtkb3duLlxuICAgICAgICAgICAgY29uc3QgaXNNdWx0aUxpbmUgPSBpc19tdWx0aV9saW5lKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzTXVsdGlMaW5lKSB0aGlzLmNyKCk7XG4qL1xuICAgICAgICAgICAgaHRtbF9pZl90YWdfYWxsb3dlZC5jYWxsKHRoaXMsIG5vZGUpO1xuLypcbiAgICAgICAgICAgIGlmIChpc011bHRpTGluZSkgdGhpcy5jcigpO1xuKi9cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcmVuZGVyZXIucmVuZGVyKHRoaXMucGFyc2VkKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFJlbmRlciB0aGUgbWFya2Rvd24gbWVzc2FnZSB0byBwbGFpbiB0ZXh0LiBUaGF0IGlzLCBlc3NlbnRpYWxseVxuICAgICAqIGp1c3QgcmVtb3ZlIGFueSBiYWNrc2xhc2hlcyBlc2NhcGluZyB3aGF0IHdvdWxkIG90aGVyd2lzZSBiZVxuICAgICAqIG1hcmtkb3duIHN5bnRheFxuICAgICAqICh0byBmaXggaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMjg3MCkuXG4gICAgICpcbiAgICAgKiBOLkIuIHRoaXMgZG9lcyAqKk5PVCoqIHJlbmRlciBhcmJpdHJhcnkgTUQgdG8gcGxhaW4gdGV4dCAtIG9ubHkgTURcbiAgICAgKiB3aGljaCBoYXMgbm8gZm9ybWF0dGluZy4gIE90aGVyd2lzZSBpdCBlbWl0cyBIVE1MKCEpLlxuICAgICAqL1xuICAgIHRvUGxhaW50ZXh0KCkge1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IG5ldyBjb21tb25tYXJrLkh0bWxSZW5kZXJlcih7c2FmZTogZmFsc2V9KTtcbiAgICAgICAgY29uc3QgcmVhbF9wYXJhZ3JhcGggPSByZW5kZXJlci5wYXJhZ3JhcGg7XG5cbiAgICAgICAgcmVuZGVyZXIucGFyYWdyYXBoID0gZnVuY3Rpb24obm9kZSwgZW50ZXJpbmcpIHtcbiAgICAgICAgICAgIC8vIGFzIHdpdGggdG9IVE1MLCBvbmx5IGFwcGVuZCBsaW5lcyB0byBwYXJhZ3JhcGhzIGlmIHRoZXJlIGFyZVxuICAgICAgICAgICAgLy8gbXVsdGlwbGUgcGFyYWdyYXBoc1xuICAgICAgICAgICAgaWYgKGlzX211bHRpX2xpbmUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudGVyaW5nICYmIG5vZGUubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpdCgnXFxuXFxuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlbmRlcmVyLmh0bWxfYmxvY2sgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICB0aGlzLmxpdChub2RlLmxpdGVyYWwpO1xuICAgICAgICAgICAgaWYgKGlzX211bHRpX2xpbmUobm9kZSkgJiYgbm9kZS5uZXh0KSB0aGlzLmxpdCgnXFxuXFxuJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHJlbmRlcmVyLnJlbmRlcih0aGlzLnBhcnNlZCk7XG4gICAgfVxufVxuIl19