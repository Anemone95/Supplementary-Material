import React from 'react';
export declare const PERMITTED_URL_SCHEMES: string[];
/**
 * Returns the shortcode for an emoji character.
 *
 * @param {String} char The emoji character
 * @return {String} The shortcode (such as :thumbup:)
 */
export declare function unicodeToShortcode(char: string): string;
/**
 * Returns the unicode character for an emoji shortcode
 *
 * @param {String} shortcode The shortcode (such as :thumbup:)
 * @return {String} The emoji character; null if none exists
 */
export declare function shortcodeToUnicode(shortcode: string): string;
export declare function processHtmlForSending(html: string): string;
export declare function sanitizedHtmlNode(insaneHtml: string): JSX.Element;
export declare function sanitizedHtmlNodeInnerText(insaneHtml: string): string;
/**
 * Tests if a URL from an untrusted source may be safely put into the DOM
 * The biggest threat here is javascript: URIs.
 * Note that the HTML sanitiser library has its own internal logic for
 * doing this, to which we pass the same list of schemes. This is used in
 * other places we need to sanitise URLs.
 * @return true if permitted, otherwise false
 */
export declare function isUrlPermitted(inputUrl: string): boolean;
interface IContent {
    format?: string;
    formatted_body?: string;
    body: string;
}
interface IOpts {
    highlightLink?: string;
    disableBigEmoji?: boolean;
    stripReplyFallback?: boolean;
    returnString?: boolean;
    forComposerQuote?: boolean;
    ref?: React.Ref<any>;
}
export declare function bodyToHtml(content: IContent, highlights: string[], opts?: IOpts): string | JSX.Element;
/**
 * Linkifies the given string. This is a wrapper around 'linkifyjs/string'.
 *
 * @param {string} str string to linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrix.options
 * @returns {string} Linkified string
 */
export declare function linkifyString(str: string, options?: any): string;
/**
 * Linkifies the given DOM element. This is a wrapper around 'linkifyjs/element'.
 *
 * @param {object} element DOM element to linkify
 * @param {object} [options] Options for linkifyElement. Default: linkifyMatrix.options
 * @returns {object}
 */
export declare function linkifyElement(element: HTMLElement, options?: any): HTMLElement;
/**
 * Linkify the given string and sanitize the HTML afterwards.
 *
 * @param {string} dirtyHtml The HTML string to sanitize and linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrix.options
 * @returns {string}
 */
export declare function linkifyAndSanitizeHtml(dirtyHtml: string, options?: any): string;
/**
 * Returns if a node is a block element or not.
 * Only takes html nodes into account that are allowed in matrix messages.
 *
 * @param {Node} node
 * @returns {bool}
 */
export declare function checkBlockNode(node: Node): boolean;
export {};
