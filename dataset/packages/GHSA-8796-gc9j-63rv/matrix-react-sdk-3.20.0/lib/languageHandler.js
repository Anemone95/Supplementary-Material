"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newTranslatableError = newTranslatableError;
exports._td = _td;
exports._t = _t;
exports.substitute = substitute;
exports.replaceByRegexes = replaceByRegexes;
exports.setMissingEntryGenerator = setMissingEntryGenerator;
exports.setLanguage = setLanguage;
exports.getAllLanguagesFromJson = getAllLanguagesFromJson;
exports.getLanguagesFromBrowser = getLanguagesFromBrowser;
exports.getLanguageFromBrowser = getLanguageFromBrowser;
exports.getNormalizedLanguageKeys = getNormalizedLanguageKeys;
exports.normalizeLanguageKey = normalizeLanguageKey;
exports.getCurrentLanguage = getCurrentLanguage;
exports.pickBestLanguage = pickBestLanguage;

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _counterpart = _interopRequireDefault(require("counterpart"));

var _react = _interopRequireDefault(require("react"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _languages = _interopRequireDefault(require("$webapp/i18n/languages.json"));

var _SettingLevel = require("./settings/SettingLevel");

var _promise = require("./utils/promise");

/*
Copyright 2017 MTRNord and Cooperative EITA
Copyright 2017 Vector Creations Ltd.
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
// @ts-ignore - $webapp is a webpack resolve alias pointing to the output directory, see webpack config
const i18nFolder = 'i18n/'; // Control whether to also return original, untranslated strings
// Useful for debugging and testing

const ANNOTATE_STRINGS = false; // We use english strings as keys, some of which contain full stops

_counterpart.default.setSeparator('|'); // Fall back to English


_counterpart.default.setFallbackLocale('en');

/**
 * Helper function to create an error which has an English message
 * with a translatedMessage property for use by the consumer.
 * @param {string} message Message to translate.
 * @returns {Error} The constructed error.
 */
function newTranslatableError(message
/*: string*/
) {
  const error = new Error(message);
  error.translatedMessage = _t(message);
  return error;
} // Function which only purpose is to mark that a string is translatable
// Does not actually do anything. It's helpful for automatic extraction of translatable strings


function _td(s
/*: string*/
)
/*: string*/
{
  return s;
} // Wrapper for counterpart's translation function so that it handles nulls and undefineds properly
// Takes the same arguments as counterpart.translate()


function safeCounterpartTranslate(text
/*: string*/
, options
/*: object*/
) {
  // Horrible hack to avoid https://github.com/vector-im/element-web/issues/4191
  // The interpolation library that counterpart uses does not support undefined/null
  // values and instead will throw an error. This is a problem since everywhere else
  // in JS land passing undefined/null will simply stringify instead, and when converting
  // valid ES6 template strings to i18n strings it's extremely easy to pass undefined/null
  // if there are no existing null guards. To avoid this making the app completely inoperable,
  // we'll check all the values for undefined/null and stringify them here.
  let count;

  if (options && typeof options === 'object') {
    count = options['count'];
    Object.keys(options).forEach(k => {
      if (options[k] === undefined) {
        console.warn("safeCounterpartTranslate called with undefined interpolation name: " + k);
        options[k] = 'undefined';
      }

      if (options[k] === null) {
        console.warn("safeCounterpartTranslate called with null interpolation name: " + k);
        options[k] = 'null';
      }
    });
  }

  let translated = _counterpart.default.translate(text, options);

  if (translated === undefined && count !== undefined) {
    // counterpart does not do fallback if no pluralisation exists
    // in the preferred language, so do it here
    translated = _counterpart.default.translate(text, Object.assign({}, options, {
      locale: 'en'
    }));
  }

  return translated;
}
/*:: export interface IVariables {
    count?: number;
    [key: string]: number | string;
}*/

/*:: export type TranslatedString = string | React.ReactNode;*/


function _t(text
/*: string*/
, variables
/*: IVariables*/
, tags
/*: Tags*/
)
/*: TranslatedString*/
{
  // Don't do substitutions in counterpart. We handle it ourselves so we can replace with React components
  // However, still pass the variables to counterpart so that it can choose the correct plural if count is given
  // It is enough to pass the count variable, but in the future counterpart might make use of other information too
  const args = Object.assign({
    interpolate: false
  }, variables); // The translation returns text so there's no XSS vector here (no unsafe HTML, no code execution)

  const translated = safeCounterpartTranslate(text, args);
  const substituted = substitute(translated, variables, tags); // For development/testing purposes it is useful to also output the original string
  // Don't do that for release versions

  if (ANNOTATE_STRINGS) {
    if (typeof substituted === 'string') {
      return `@@${text}##${substituted}@@`;
    } else {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "translated-string",
        "data-orig-string": text
      }, substituted);
    }
  } else {
    return substituted;
  }
}
/*
 * Similar to _t(), except only does substitutions, and no translation
 * @param {string} text The text, e.g "click <a>here</a> now to %(foo)s".
 * @param {object} variables Variable substitutions, e.g { foo: 'bar' }
 * @param {object} tags Tag substitutions e.g. { 'a': (sub) => <a>{sub}</a> }
 *
 * The values to substitute with can be either simple strings, or functions that return the value to use in
 * the substitution (e.g. return a React component). In case of a tag replacement, the function receives as
 * the argument the text inside the element corresponding to the tag.
 *
 * @return a React <span> component if any non-strings were used in substitutions, otherwise a string
 */


function substitute(text
/*: string*/
, variables
/*: IVariables*/
, tags
/*: Tags*/
)
/*: string | React.ReactNode*/
{
  let result
  /*: React.ReactNode | string*/
  = text;

  if (variables !== undefined) {
    const regexpMapping
    /*: IVariables*/
    = {};

    for (const variable in variables) {
      regexpMapping[`%\\(${variable}\\)s`] = variables[variable];
    }

    result = replaceByRegexes(result, regexpMapping);
  }

  if (tags !== undefined) {
    const regexpMapping
    /*: Tags*/
    = {};

    for (const tag in tags) {
      regexpMapping[`(<${tag}>(.*?)<\\/${tag}>|<${tag}>|<${tag}\\s*\\/>)`] = tags[tag];
    }

    result = replaceByRegexes(result, regexpMapping);
  }

  return result;
}
/*
 * Replace parts of a text using regular expressions
 * @param {string} text The text on which to perform substitutions
 * @param {object} mapping A mapping from regular expressions in string form to replacement string or a
 * function which will receive as the argument the capture groups defined in the regexp. E.g.
 * { 'Hello (.?) World': (sub) => sub.toUpperCase() }
 *
 * @return a React <span> component if any non-strings were used in substitutions, otherwise a string
 */


function replaceByRegexes(text
/*: string*/
, mapping
/*: IVariables | Tags*/
)
/*: string | React.ReactNode*/
{
  // We initially store our output as an array of strings and objects (e.g. React components).
  // This will then be converted to a string or a <span> at the end
  const output = [text]; // If we insert any components we need to wrap the output in a span. React doesn't like just an array of components.

  let shouldWrapInSpan = false;

  for (const regexpString in mapping) {
    // TODO: Cache regexps
    const regexp = new RegExp(regexpString, "g"); // Loop over what output we have so far and perform replacements
    // We look for matches: if we find one, we get three parts: everything before the match, the replaced part,
    // and everything after the match. Insert all three into the output. We need to do this because we can insert objects.
    // Otherwise there would be no need for the splitting and we could do simple replacement.

    let matchFoundSomewhere = false; // If we don't find a match anywhere we want to log it

    for (let outputIndex = 0; outputIndex < output.length; outputIndex++) {
      const inputText = output[outputIndex];

      if (typeof inputText !== 'string') {
        // We might have inserted objects earlier, don't try to replace them
        continue;
      } // process every match in the string
      // starting with the first


      let match = regexp.exec(inputText);
      if (!match) continue;
      matchFoundSomewhere = true; // The textual part before the first match

      const head = inputText.substr(0, match.index);
      const parts = []; // keep track of prevMatch

      let prevMatch;

      while (match) {
        // store prevMatch
        prevMatch = match;
        const capturedGroups = match.slice(2);
        let replaced; // If substitution is a function, call it

        if (mapping[regexpString] instanceof Function) {
          replaced = mapping[regexpString].apply(null, capturedGroups);
        } else {
          replaced = mapping[regexpString];
        }

        if (typeof replaced === 'object') {
          shouldWrapInSpan = true;
        } // Here we also need to check that it actually is a string before comparing against one
        // The head and tail are always strings


        if (typeof replaced !== 'string' || replaced !== '') {
          parts.push(replaced);
        } // try the next match


        match = regexp.exec(inputText); // add the text between prevMatch and this one
        // or the end of the string if prevMatch is the last match

        let tail;

        if (match) {
          const startIndex = prevMatch.index + prevMatch[0].length;
          tail = inputText.substr(startIndex, match.index - startIndex);
        } else {
          tail = inputText.substr(prevMatch.index + prevMatch[0].length);
        }

        if (tail) {
          parts.push(tail);
        }
      } // Insert in reverse order as splice does insert-before and this way we get the final order correct
      // remove the old element at the same time


      output.splice(outputIndex, 1, ...parts);

      if (head !== '') {
        // Don't push empty nodes, they are of no use
        output.splice(outputIndex, 0, head);
      }
    }

    if (!matchFoundSomewhere) {
      // The current regexp did not match anything in the input
      // Missing matches is entirely possible because you might choose to show some variables only in the case
      // of e.g. plurals. It's still a bit suspicious, and could be due to an error, so log it.
      // However, not showing count is so common that it's not worth logging. And other commonly unused variables
      // here, if there are any.
      if (regexpString !== '%\\(count\\)s') {
        console.log(`Could not find ${regexp} in ${text}`);
      }
    }
  }

  if (shouldWrapInSpan) {
    return /*#__PURE__*/_react.default.createElement('span', null, ...output);
  } else {
    return output.join('');
  }
} // Allow overriding the text displayed when no translation exists
// Currently only used in unit tests to avoid having to load
// the translations in element-web


function setMissingEntryGenerator(f
/*: (value: string) => void*/
) {
  _counterpart.default.setMissingEntryGenerator(f);
}

function setLanguage(preferredLangs
/*: string | string[]*/
) {
  if (!Array.isArray(preferredLangs)) {
    preferredLangs = [preferredLangs];
  }

  const plaf = _PlatformPeg.default.get();

  if (plaf) {
    plaf.setLanguage(preferredLangs);
  }

  let langToUse;
  let availLangs;
  return getLangsJson().then(result => {
    availLangs = result;

    for (let i = 0; i < preferredLangs.length; ++i) {
      if (availLangs.hasOwnProperty(preferredLangs[i])) {
        langToUse = preferredLangs[i];
        break;
      }
    }

    if (!langToUse) {
      // Fallback to en_EN if none is found
      langToUse = 'en';
      console.error("Unable to find an appropriate language");
    }

    return getLanguageRetry(i18nFolder + availLangs[langToUse].fileName);
  }).then(langData => {
    _counterpart.default.registerTranslations(langToUse, langData);

    _counterpart.default.setLocale(langToUse);

    _SettingsStore.default.setValue("language", null, _SettingLevel.SettingLevel.DEVICE, langToUse);

    console.log("set language to " + langToUse); // Set 'en' as fallback language:

    if (langToUse !== "en") {
      return getLanguageRetry(i18nFolder + availLangs['en'].fileName);
    }
  }).then(langData => {
    if (langData) _counterpart.default.registerTranslations('en', langData);
  });
}

function getAllLanguagesFromJson() {
  return getLangsJson().then(langsObject => {
    const langs = [];

    for (const langKey in langsObject) {
      if (langsObject.hasOwnProperty(langKey)) {
        langs.push({
          'value': langKey,
          'label': langsObject[langKey].label
        });
      }
    }

    return langs;
  });
}

function getLanguagesFromBrowser() {
  if (navigator.languages && navigator.languages.length) return navigator.languages;
  if (navigator.language) return [navigator.language];
  return [navigator.userLanguage || "en"];
}

function getLanguageFromBrowser() {
  return getLanguagesFromBrowser()[0];
}
/**
 * Turns a language string, normalises it,
 * (see normalizeLanguageKey) into an array of language strings
 * with fallback to generic languages
 * (eg. 'pt-BR' => ['pt-br', 'pt'])
 *
 * @param {string} language The input language string
 * @return {string[]} List of normalised languages
 */


function getNormalizedLanguageKeys(language
/*: string*/
) {
  const languageKeys
  /*: string[]*/
  = [];
  const normalizedLanguage = normalizeLanguageKey(language);
  const languageParts = normalizedLanguage.split('-');

  if (languageParts.length === 2 && languageParts[0] === languageParts[1]) {
    languageKeys.push(languageParts[0]);
  } else {
    languageKeys.push(normalizedLanguage);

    if (languageParts.length === 2) {
      languageKeys.push(languageParts[0]);
    }
  }

  return languageKeys;
}
/**
 * Returns a language string with underscores replaced with
 * hyphens, and lowercased.
 *
 * @param {string} language The language string to be normalized
 * @returns {string} The normalized language string
 */


function normalizeLanguageKey(language
/*: string*/
) {
  return language.toLowerCase().replace("_", "-");
}

function getCurrentLanguage() {
  return _counterpart.default.getLocale();
}
/**
 * Given a list of language codes, pick the most appropriate one
 * given the current language (ie. getCurrentLanguage())
 * English is assumed to be a reasonable default.
 *
 * @param {string[]} langs List of language codes to pick from
 * @returns {string} The most appropriate language code from langs
 */


function pickBestLanguage(langs
/*: string[]*/
)
/*: string*/
{
  const currentLang = getCurrentLanguage();
  const normalisedLangs = langs.map(normalizeLanguageKey);
  {
    // Best is an exact match
    const currentLangIndex = normalisedLangs.indexOf(currentLang);
    if (currentLangIndex > -1) return langs[currentLangIndex];
  }
  {
    // Failing that, a different dialect of the same language
    const closeLangIndex = normalisedLangs.findIndex(l => l.substr(0, 2) === currentLang.substr(0, 2));
    if (closeLangIndex > -1) return langs[closeLangIndex];
  }
  {
    // Neither of those? Try an english variant.
    const enIndex = normalisedLangs.findIndex(l => l.startsWith('en'));
    if (enIndex > -1) return langs[enIndex];
  } // if nothing else, use the first

  return langs[0];
}

function getLangsJson()
/*: Promise<object>*/
{
  return new Promise((resolve, reject) => {
    let url;

    if (typeof _languages.default === 'string') {
      // in Jest this 'url' isn't a URL, so just fall through
      url = _languages.default;
    } else {
      url = i18nFolder + 'languages.json';
    }

    (0, _browserRequest.default)({
      method: "GET",
      url
    }, (err, response, body) => {
      if (err || response.status < 200 || response.status >= 300) {
        reject(err);
        return;
      }

      resolve(JSON.parse(body));
    });
  });
}

function weblateToCounterpart(inTrs
/*: object*/
)
/*: object*/
{
  const outTrs = {};

  for (const key of Object.keys(inTrs)) {
    const keyParts = key.split('|', 2);

    if (keyParts.length === 2) {
      let obj = outTrs[keyParts[0]];

      if (obj === undefined) {
        obj = {};
        outTrs[keyParts[0]] = obj;
      }

      obj[keyParts[1]] = inTrs[key];
    } else {
      outTrs[key] = inTrs[key];
    }
  }

  return outTrs;
}

async function getLanguageRetry(langPath
/*: string*/
, num = 3)
/*: Promise<object>*/
{
  return (0, _promise.retry)(() => getLanguage(langPath), num, e => {
    console.log("Failed to load i18n", langPath);
    console.error(e);
    return true; // always retry
  });
}

function getLanguage(langPath
/*: string*/
)
/*: Promise<object>*/
{
  return new Promise((resolve, reject) => {
    (0, _browserRequest.default)({
      method: "GET",
      url: langPath
    }, (err, response, body) => {
      if (err || response.status < 200 || response.status >= 300) {
        reject(err);
        return;
      }

      resolve(weblateToCounterpart(JSON.parse(body)));
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sYW5ndWFnZUhhbmRsZXIudHN4Il0sIm5hbWVzIjpbImkxOG5Gb2xkZXIiLCJBTk5PVEFURV9TVFJJTkdTIiwiY291bnRlcnBhcnQiLCJzZXRTZXBhcmF0b3IiLCJzZXRGYWxsYmFja0xvY2FsZSIsIm5ld1RyYW5zbGF0YWJsZUVycm9yIiwibWVzc2FnZSIsImVycm9yIiwiRXJyb3IiLCJ0cmFuc2xhdGVkTWVzc2FnZSIsIl90IiwiX3RkIiwicyIsInNhZmVDb3VudGVycGFydFRyYW5zbGF0ZSIsInRleHQiLCJvcHRpb25zIiwiY291bnQiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImsiLCJ1bmRlZmluZWQiLCJjb25zb2xlIiwid2FybiIsInRyYW5zbGF0ZWQiLCJ0cmFuc2xhdGUiLCJhc3NpZ24iLCJsb2NhbGUiLCJ2YXJpYWJsZXMiLCJ0YWdzIiwiYXJncyIsImludGVycG9sYXRlIiwic3Vic3RpdHV0ZWQiLCJzdWJzdGl0dXRlIiwicmVzdWx0IiwicmVnZXhwTWFwcGluZyIsInZhcmlhYmxlIiwicmVwbGFjZUJ5UmVnZXhlcyIsInRhZyIsIm1hcHBpbmciLCJvdXRwdXQiLCJzaG91bGRXcmFwSW5TcGFuIiwicmVnZXhwU3RyaW5nIiwicmVnZXhwIiwiUmVnRXhwIiwibWF0Y2hGb3VuZFNvbWV3aGVyZSIsIm91dHB1dEluZGV4IiwibGVuZ3RoIiwiaW5wdXRUZXh0IiwibWF0Y2giLCJleGVjIiwiaGVhZCIsInN1YnN0ciIsImluZGV4IiwicGFydHMiLCJwcmV2TWF0Y2giLCJjYXB0dXJlZEdyb3VwcyIsInNsaWNlIiwicmVwbGFjZWQiLCJGdW5jdGlvbiIsImFwcGx5IiwicHVzaCIsInRhaWwiLCJzdGFydEluZGV4Iiwic3BsaWNlIiwibG9nIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50Iiwiam9pbiIsInNldE1pc3NpbmdFbnRyeUdlbmVyYXRvciIsImYiLCJzZXRMYW5ndWFnZSIsInByZWZlcnJlZExhbmdzIiwiQXJyYXkiLCJpc0FycmF5IiwicGxhZiIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwibGFuZ1RvVXNlIiwiYXZhaWxMYW5ncyIsImdldExhbmdzSnNvbiIsInRoZW4iLCJpIiwiaGFzT3duUHJvcGVydHkiLCJnZXRMYW5ndWFnZVJldHJ5IiwiZmlsZU5hbWUiLCJsYW5nRGF0YSIsInJlZ2lzdGVyVHJhbnNsYXRpb25zIiwic2V0TG9jYWxlIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiZ2V0QWxsTGFuZ3VhZ2VzRnJvbUpzb24iLCJsYW5nc09iamVjdCIsImxhbmdzIiwibGFuZ0tleSIsImxhYmVsIiwiZ2V0TGFuZ3VhZ2VzRnJvbUJyb3dzZXIiLCJuYXZpZ2F0b3IiLCJsYW5ndWFnZXMiLCJsYW5ndWFnZSIsInVzZXJMYW5ndWFnZSIsImdldExhbmd1YWdlRnJvbUJyb3dzZXIiLCJnZXROb3JtYWxpemVkTGFuZ3VhZ2VLZXlzIiwibGFuZ3VhZ2VLZXlzIiwibm9ybWFsaXplZExhbmd1YWdlIiwibm9ybWFsaXplTGFuZ3VhZ2VLZXkiLCJsYW5ndWFnZVBhcnRzIiwic3BsaXQiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJnZXRDdXJyZW50TGFuZ3VhZ2UiLCJnZXRMb2NhbGUiLCJwaWNrQmVzdExhbmd1YWdlIiwiY3VycmVudExhbmciLCJub3JtYWxpc2VkTGFuZ3MiLCJtYXAiLCJjdXJyZW50TGFuZ0luZGV4IiwiaW5kZXhPZiIsImNsb3NlTGFuZ0luZGV4IiwiZmluZEluZGV4IiwibCIsImVuSW5kZXgiLCJzdGFydHNXaXRoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ1cmwiLCJ3ZWJwYWNrTGFuZ0pzb25VcmwiLCJtZXRob2QiLCJlcnIiLCJyZXNwb25zZSIsImJvZHkiLCJzdGF0dXMiLCJKU09OIiwicGFyc2UiLCJ3ZWJsYXRlVG9Db3VudGVycGFydCIsImluVHJzIiwib3V0VHJzIiwia2V5Iiwia2V5UGFydHMiLCJvYmoiLCJsYW5nUGF0aCIsIm51bSIsImdl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TCxNQUFBQSxPQUFPLENBQUNXLG9CQUFvQixDQUFDRixJQUFJLENBQUNDLEtBQUwsQ0FBV0gsSUFBWCxDQUFELENBQXJCLENBQVA7QUFDSCxLQVJMO0FBVUgsR0FYTSxDQUFQO0FBWUgiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTVRSTm9yZCBhbmQgQ29vcGVyYXRpdmUgRUlUQVxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGQuXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYnJvd3Nlci1yZXF1ZXN0JztcbmltcG9ydCBjb3VudGVycGFydCBmcm9tICdjb3VudGVycGFydCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4vUGxhdGZvcm1QZWdcIjtcblxuLy8gQHRzLWlnbm9yZSAtICR3ZWJhcHAgaXMgYSB3ZWJwYWNrIHJlc29sdmUgYWxpYXMgcG9pbnRpbmcgdG8gdGhlIG91dHB1dCBkaXJlY3RvcnksIHNlZSB3ZWJwYWNrIGNvbmZpZ1xuaW1wb3J0IHdlYnBhY2tMYW5nSnNvblVybCBmcm9tIFwiJHdlYmFwcC9pMThuL2xhbmd1YWdlcy5qc29uXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7cmV0cnl9IGZyb20gXCIuL3V0aWxzL3Byb21pc2VcIjtcblxuY29uc3QgaTE4bkZvbGRlciA9ICdpMThuLyc7XG5cbi8vIENvbnRyb2wgd2hldGhlciB0byBhbHNvIHJldHVybiBvcmlnaW5hbCwgdW50cmFuc2xhdGVkIHN0cmluZ3Ncbi8vIFVzZWZ1bCBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nXG5jb25zdCBBTk5PVEFURV9TVFJJTkdTID0gZmFsc2U7XG5cbi8vIFdlIHVzZSBlbmdsaXNoIHN0cmluZ3MgYXMga2V5cywgc29tZSBvZiB3aGljaCBjb250YWluIGZ1bGwgc3RvcHNcbmNvdW50ZXJwYXJ0LnNldFNlcGFyYXRvcignfCcpO1xuLy8gRmFsbCBiYWNrIHRvIEVuZ2xpc2hcbmNvdW50ZXJwYXJ0LnNldEZhbGxiYWNrTG9jYWxlKCdlbicpO1xuXG5pbnRlcmZhY2UgSVRyYW5zbGF0YWJsZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIHRyYW5zbGF0ZWRNZXNzYWdlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBlcnJvciB3aGljaCBoYXMgYW4gRW5nbGlzaCBtZXNzYWdlXG4gKiB3aXRoIGEgdHJhbnNsYXRlZE1lc3NhZ2UgcHJvcGVydHkgZm9yIHVzZSBieSB0aGUgY29uc3VtZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBNZXNzYWdlIHRvIHRyYW5zbGF0ZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNvbnN0cnVjdGVkIGVycm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3VHJhbnNsYXRhYmxlRXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSkgYXMgSVRyYW5zbGF0YWJsZUVycm9yO1xuICAgIGVycm9yLnRyYW5zbGF0ZWRNZXNzYWdlID0gX3QobWVzc2FnZSk7XG4gICAgcmV0dXJuIGVycm9yO1xufVxuXG4vLyBGdW5jdGlvbiB3aGljaCBvbmx5IHB1cnBvc2UgaXMgdG8gbWFyayB0aGF0IGEgc3RyaW5nIGlzIHRyYW5zbGF0YWJsZVxuLy8gRG9lcyBub3QgYWN0dWFsbHkgZG8gYW55dGhpbmcuIEl0J3MgaGVscGZ1bCBmb3IgYXV0b21hdGljIGV4dHJhY3Rpb24gb2YgdHJhbnNsYXRhYmxlIHN0cmluZ3NcbmV4cG9ydCBmdW5jdGlvbiBfdGQoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcztcbn1cblxuLy8gV3JhcHBlciBmb3IgY291bnRlcnBhcnQncyB0cmFuc2xhdGlvbiBmdW5jdGlvbiBzbyB0aGF0IGl0IGhhbmRsZXMgbnVsbHMgYW5kIHVuZGVmaW5lZHMgcHJvcGVybHlcbi8vIFRha2VzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBjb3VudGVycGFydC50cmFuc2xhdGUoKVxuZnVuY3Rpb24gc2FmZUNvdW50ZXJwYXJ0VHJhbnNsYXRlKHRleHQ6IHN0cmluZywgb3B0aW9ucz86IG9iamVjdCkge1xuICAgIC8vIEhvcnJpYmxlIGhhY2sgdG8gYXZvaWQgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNDE5MVxuICAgIC8vIFRoZSBpbnRlcnBvbGF0aW9uIGxpYnJhcnkgdGhhdCBjb3VudGVycGFydCB1c2VzIGRvZXMgbm90IHN1cHBvcnQgdW5kZWZpbmVkL251bGxcbiAgICAvLyB2YWx1ZXMgYW5kIGluc3RlYWQgd2lsbCB0aHJvdyBhbiBlcnJvci4gVGhpcyBpcyBhIHByb2JsZW0gc2luY2UgZXZlcnl3aGVyZSBlbHNlXG4gICAgLy8gaW4gSlMgbGFuZCBwYXNzaW5nIHVuZGVmaW5lZC9udWxsIHdpbGwgc2ltcGx5IHN0cmluZ2lmeSBpbnN0ZWFkLCBhbmQgd2hlbiBjb252ZXJ0aW5nXG4gICAgLy8gdmFsaWQgRVM2IHRlbXBsYXRlIHN0cmluZ3MgdG8gaTE4biBzdHJpbmdzIGl0J3MgZXh0cmVtZWx5IGVhc3kgdG8gcGFzcyB1bmRlZmluZWQvbnVsbFxuICAgIC8vIGlmIHRoZXJlIGFyZSBubyBleGlzdGluZyBudWxsIGd1YXJkcy4gVG8gYXZvaWQgdGhpcyBtYWtpbmcgdGhlIGFwcCBjb21wbGV0ZWx5IGlub3BlcmFibGUsXG4gICAgLy8gd2UnbGwgY2hlY2sgYWxsIHRoZSB2YWx1ZXMgZm9yIHVuZGVmaW5lZC9udWxsIGFuZCBzdHJpbmdpZnkgdGhlbSBoZXJlLlxuICAgIGxldCBjb3VudDtcblxuICAgIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjb3VudCA9IG9wdGlvbnNbJ2NvdW50J107XG4gICAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goKGspID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zW2tdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJzYWZlQ291bnRlcnBhcnRUcmFuc2xhdGUgY2FsbGVkIHdpdGggdW5kZWZpbmVkIGludGVycG9sYXRpb24gbmFtZTogXCIgKyBrKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zW2tdID0gJ3VuZGVmaW5lZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uc1trXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcInNhZmVDb3VudGVycGFydFRyYW5zbGF0ZSBjYWxsZWQgd2l0aCBudWxsIGludGVycG9sYXRpb24gbmFtZTogXCIgKyBrKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zW2tdID0gJ251bGwnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGV0IHRyYW5zbGF0ZWQgPSBjb3VudGVycGFydC50cmFuc2xhdGUodGV4dCwgb3B0aW9ucyk7XG4gICAgaWYgKHRyYW5zbGF0ZWQgPT09IHVuZGVmaW5lZCAmJiBjb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGNvdW50ZXJwYXJ0IGRvZXMgbm90IGRvIGZhbGxiYWNrIGlmIG5vIHBsdXJhbGlzYXRpb24gZXhpc3RzXG4gICAgICAgIC8vIGluIHRoZSBwcmVmZXJyZWQgbGFuZ3VhZ2UsIHNvIGRvIGl0IGhlcmVcbiAgICAgICAgdHJhbnNsYXRlZCA9IGNvdW50ZXJwYXJ0LnRyYW5zbGF0ZSh0ZXh0LCBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7bG9jYWxlOiAnZW4nfSkpO1xuICAgIH1cbiAgICByZXR1cm4gdHJhbnNsYXRlZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVmFyaWFibGVzIHtcbiAgICBjb3VudD86IG51bWJlcjtcbiAgICBba2V5OiBzdHJpbmddOiBudW1iZXIgfCBzdHJpbmc7XG59XG5cbnR5cGUgVGFncyA9IFJlY29yZDxzdHJpbmcsIChzdWI6IHN0cmluZykgPT4gUmVhY3QuUmVhY3ROb2RlPjtcblxuZXhwb3J0IHR5cGUgVHJhbnNsYXRlZFN0cmluZyA9IHN0cmluZyB8IFJlYWN0LlJlYWN0Tm9kZTtcblxuLypcbiAqIFRyYW5zbGF0ZXMgdGV4dCBhbmQgb3B0aW9uYWxseSBhbHNvIHJlcGxhY2VzIFhNTC1pc2ggZWxlbWVudHMgaW4gdGhlIHRleHQgd2l0aCBlLmcuIFJlYWN0IGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB1bnRyYW5zbGF0ZWQgdGV4dCwgZS5nIFwiY2xpY2sgPGE+aGVyZTwvYT4gbm93IHRvICUoZm9vKXNcIi5cbiAqIEBwYXJhbSB7b2JqZWN0fSB2YXJpYWJsZXMgVmFyaWFibGUgc3Vic3RpdHV0aW9ucywgZS5nIHsgZm9vOiAnYmFyJyB9XG4gKiBAcGFyYW0ge29iamVjdH0gdGFncyBUYWcgc3Vic3RpdHV0aW9ucyBlLmcuIHsgJ2EnOiAoc3ViKSA9PiA8YT57c3VifTwvYT4gfVxuICpcbiAqIEluIGJvdGggdmFyaWFibGVzIGFuZCB0YWdzLCB0aGUgdmFsdWVzIHRvIHN1YnN0aXR1dGUgd2l0aCBjYW4gYmUgZWl0aGVyIHNpbXBsZSBzdHJpbmdzLCBSZWFjdCBjb21wb25lbnRzLFxuICogb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHRoZSB2YWx1ZSB0byB1c2UgaW4gdGhlIHN1YnN0aXR1dGlvbiAoZS5nLiByZXR1cm4gYSBSZWFjdCBjb21wb25lbnQpLiBJbiBjYXNlIG9mXG4gKiBhIHRhZyByZXBsYWNlbWVudCwgdGhlIGZ1bmN0aW9uIHJlY2VpdmVzIGFzIHRoZSBhcmd1bWVudCB0aGUgdGV4dCBpbnNpZGUgdGhlIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgdGFnLlxuICpcbiAqIFVzZSB0YWcgc3Vic3RpdHV0aW9ucyBpZiB5b3UgbmVlZCB0byB0cmFuc2xhdGUgdGV4dCBiZXR3ZWVuIHRhZ3MgKGUuZy4gXCI8YT5DbGljayBoZXJlITwvYT5cIiksIG90aGVyd2lzZVxuICogeW91IHdpbGwgZW5kIHVwIHdpdGggbGl0ZXJhbCBcIjxhPlwiIGluIHlvdXIgb3V0cHV0LCByYXRoZXIgdGhhbiBIVE1MLiBOb3RlIHRoYXQgeW91IGNhbiBhbHNvIHVzZSB2YXJpYWJsZVxuICogc3Vic3RpdHV0aW9uIHRvIGluc2VydCBSZWFjdCBjb21wb25lbnRzLCBidXQgeW91IGNhbid0IHVzZSBpdCB0byB0cmFuc2xhdGUgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gKlxuICogQHJldHVybiBhIFJlYWN0IDxzcGFuPiBjb21wb25lbnQgaWYgYW55IG5vbi1zdHJpbmdzIHdlcmUgdXNlZCBpbiBzdWJzdGl0dXRpb25zLCBvdGhlcndpc2UgYSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF90KHRleHQ6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZztcbmV4cG9ydCBmdW5jdGlvbiBfdCh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcywgdGFnczogVGFncyk6IFJlYWN0LlJlYWN0Tm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBfdCh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlcz86IElWYXJpYWJsZXMsIHRhZ3M/OiBUYWdzKTogVHJhbnNsYXRlZFN0cmluZyB7XG4gICAgLy8gRG9uJ3QgZG8gc3Vic3RpdHV0aW9ucyBpbiBjb3VudGVycGFydC4gV2UgaGFuZGxlIGl0IG91cnNlbHZlcyBzbyB3ZSBjYW4gcmVwbGFjZSB3aXRoIFJlYWN0IGNvbXBvbmVudHNcbiAgICAvLyBIb3dldmVyLCBzdGlsbCBwYXNzIHRoZSB2YXJpYWJsZXMgdG8gY291bnRlcnBhcnQgc28gdGhhdCBpdCBjYW4gY2hvb3NlIHRoZSBjb3JyZWN0IHBsdXJhbCBpZiBjb3VudCBpcyBnaXZlblxuICAgIC8vIEl0IGlzIGVub3VnaCB0byBwYXNzIHRoZSBjb3VudCB2YXJpYWJsZSwgYnV0IGluIHRoZSBmdXR1cmUgY291bnRlcnBhcnQgbWlnaHQgbWFrZSB1c2Ugb2Ygb3RoZXIgaW5mb3JtYXRpb24gdG9vXG4gICAgY29uc3QgYXJncyA9IE9iamVjdC5hc3NpZ24oeyBpbnRlcnBvbGF0ZTogZmFsc2UgfSwgdmFyaWFibGVzKTtcblxuICAgIC8vIFRoZSB0cmFuc2xhdGlvbiByZXR1cm5zIHRleHQgc28gdGhlcmUncyBubyBYU1MgdmVjdG9yIGhlcmUgKG5vIHVuc2FmZSBIVE1MLCBubyBjb2RlIGV4ZWN1dGlvbilcbiAgICBjb25zdCB0cmFuc2xhdGVkID0gc2FmZUNvdW50ZXJwYXJ0VHJhbnNsYXRlKHRleHQsIGFyZ3MpO1xuXG4gICAgY29uc3Qgc3Vic3RpdHV0ZWQgPSBzdWJzdGl0dXRlKHRyYW5zbGF0ZWQsIHZhcmlhYmxlcywgdGFncyk7XG5cbiAgICAvLyBGb3IgZGV2ZWxvcG1lbnQvdGVzdGluZyBwdXJwb3NlcyBpdCBpcyB1c2VmdWwgdG8gYWxzbyBvdXRwdXQgdGhlIG9yaWdpbmFsIHN0cmluZ1xuICAgIC8vIERvbid0IGRvIHRoYXQgZm9yIHJlbGVhc2UgdmVyc2lvbnNcbiAgICBpZiAoQU5OT1RBVEVfU1RSSU5HUykge1xuICAgICAgICBpZiAodHlwZW9mIHN1YnN0aXR1dGVkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGBAQCR7dGV4dH0jIyR7c3Vic3RpdHV0ZWR9QEBgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT0ndHJhbnNsYXRlZC1zdHJpbmcnIGRhdGEtb3JpZy1zdHJpbmc9e3RleHR9PntzdWJzdGl0dXRlZH08L3NwYW4+O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHN1YnN0aXR1dGVkO1xuICAgIH1cbn1cblxuLypcbiAqIFNpbWlsYXIgdG8gX3QoKSwgZXhjZXB0IG9ubHkgZG9lcyBzdWJzdGl0dXRpb25zLCBhbmQgbm8gdHJhbnNsYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB0ZXh0LCBlLmcgXCJjbGljayA8YT5oZXJlPC9hPiBub3cgdG8gJShmb28pc1wiLlxuICogQHBhcmFtIHtvYmplY3R9IHZhcmlhYmxlcyBWYXJpYWJsZSBzdWJzdGl0dXRpb25zLCBlLmcgeyBmb286ICdiYXInIH1cbiAqIEBwYXJhbSB7b2JqZWN0fSB0YWdzIFRhZyBzdWJzdGl0dXRpb25zIGUuZy4geyAnYSc6IChzdWIpID0+IDxhPntzdWJ9PC9hPiB9XG4gKlxuICogVGhlIHZhbHVlcyB0byBzdWJzdGl0dXRlIHdpdGggY2FuIGJlIGVpdGhlciBzaW1wbGUgc3RyaW5ncywgb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHRoZSB2YWx1ZSB0byB1c2UgaW5cbiAqIHRoZSBzdWJzdGl0dXRpb24gKGUuZy4gcmV0dXJuIGEgUmVhY3QgY29tcG9uZW50KS4gSW4gY2FzZSBvZiBhIHRhZyByZXBsYWNlbWVudCwgdGhlIGZ1bmN0aW9uIHJlY2VpdmVzIGFzXG4gKiB0aGUgYXJndW1lbnQgdGhlIHRleHQgaW5zaWRlIHRoZSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHRhZy5cbiAqXG4gKiBAcmV0dXJuIGEgUmVhY3QgPHNwYW4+IGNvbXBvbmVudCBpZiBhbnkgbm9uLXN0cmluZ3Mgd2VyZSB1c2VkIGluIHN1YnN0aXR1dGlvbnMsIG90aGVyd2lzZSBhIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3Vic3RpdHV0ZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlcz86IElWYXJpYWJsZXMpOiBzdHJpbmc7XG5leHBvcnQgZnVuY3Rpb24gc3Vic3RpdHV0ZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcywgdGFnczogVGFncyk6IHN0cmluZztcbmV4cG9ydCBmdW5jdGlvbiBzdWJzdGl0dXRlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcywgdGFncz86IFRhZ3MpOiBzdHJpbmcgfCBSZWFjdC5SZWFjdE5vZGUge1xuICAgIGxldCByZXN1bHQ6IFJlYWN0LlJlYWN0Tm9kZSB8IHN0cmluZyA9IHRleHQ7XG5cbiAgICBpZiAodmFyaWFibGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgcmVnZXhwTWFwcGluZzogSVZhcmlhYmxlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhcmlhYmxlIGluIHZhcmlhYmxlcykge1xuICAgICAgICAgICAgcmVnZXhwTWFwcGluZ1tgJVxcXFwoJHt2YXJpYWJsZX1cXFxcKXNgXSA9IHZhcmlhYmxlc1t2YXJpYWJsZV07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gcmVwbGFjZUJ5UmVnZXhlcyhyZXN1bHQgYXMgc3RyaW5nLCByZWdleHBNYXBwaW5nKTtcbiAgICB9XG5cbiAgICBpZiAodGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHJlZ2V4cE1hcHBpbmc6IFRhZ3MgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgaW4gdGFncykge1xuICAgICAgICAgICAgcmVnZXhwTWFwcGluZ1tgKDwke3RhZ30+KC4qPyk8XFxcXC8ke3RhZ30+fDwke3RhZ30+fDwke3RhZ31cXFxccypcXFxcLz4pYF0gPSB0YWdzW3RhZ107XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gcmVwbGFjZUJ5UmVnZXhlcyhyZXN1bHQgYXMgc3RyaW5nLCByZWdleHBNYXBwaW5nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKlxuICogUmVwbGFjZSBwYXJ0cyBvZiBhIHRleHQgdXNpbmcgcmVndWxhciBleHByZXNzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgVGhlIHRleHQgb24gd2hpY2ggdG8gcGVyZm9ybSBzdWJzdGl0dXRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gbWFwcGluZyBBIG1hcHBpbmcgZnJvbSByZWd1bGFyIGV4cHJlc3Npb25zIGluIHN0cmluZyBmb3JtIHRvIHJlcGxhY2VtZW50IHN0cmluZyBvciBhXG4gKiBmdW5jdGlvbiB3aGljaCB3aWxsIHJlY2VpdmUgYXMgdGhlIGFyZ3VtZW50IHRoZSBjYXB0dXJlIGdyb3VwcyBkZWZpbmVkIGluIHRoZSByZWdleHAuIEUuZy5cbiAqIHsgJ0hlbGxvICguPykgV29ybGQnOiAoc3ViKSA9PiBzdWIudG9VcHBlckNhc2UoKSB9XG4gKlxuICogQHJldHVybiBhIFJlYWN0IDxzcGFuPiBjb21wb25lbnQgaWYgYW55IG5vbi1zdHJpbmdzIHdlcmUgdXNlZCBpbiBzdWJzdGl0dXRpb25zLCBvdGhlcndpc2UgYSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VCeVJlZ2V4ZXModGV4dDogc3RyaW5nLCBtYXBwaW5nOiBJVmFyaWFibGVzKTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VCeVJlZ2V4ZXModGV4dDogc3RyaW5nLCBtYXBwaW5nOiBUYWdzKTogUmVhY3QuUmVhY3ROb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VCeVJlZ2V4ZXModGV4dDogc3RyaW5nLCBtYXBwaW5nOiBJVmFyaWFibGVzIHwgVGFncyk6IHN0cmluZyB8IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgLy8gV2UgaW5pdGlhbGx5IHN0b3JlIG91ciBvdXRwdXQgYXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBhbmQgb2JqZWN0cyAoZS5nLiBSZWFjdCBjb21wb25lbnRzKS5cbiAgICAvLyBUaGlzIHdpbGwgdGhlbiBiZSBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgb3IgYSA8c3Bhbj4gYXQgdGhlIGVuZFxuICAgIGNvbnN0IG91dHB1dCA9IFt0ZXh0XTtcblxuICAgIC8vIElmIHdlIGluc2VydCBhbnkgY29tcG9uZW50cyB3ZSBuZWVkIHRvIHdyYXAgdGhlIG91dHB1dCBpbiBhIHNwYW4uIFJlYWN0IGRvZXNuJ3QgbGlrZSBqdXN0IGFuIGFycmF5IG9mIGNvbXBvbmVudHMuXG4gICAgbGV0IHNob3VsZFdyYXBJblNwYW4gPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3QgcmVnZXhwU3RyaW5nIGluIG1hcHBpbmcpIHtcbiAgICAgICAgLy8gVE9ETzogQ2FjaGUgcmVnZXhwc1xuICAgICAgICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKHJlZ2V4cFN0cmluZywgXCJnXCIpO1xuXG4gICAgICAgIC8vIExvb3Agb3ZlciB3aGF0IG91dHB1dCB3ZSBoYXZlIHNvIGZhciBhbmQgcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAgICAgLy8gV2UgbG9vayBmb3IgbWF0Y2hlczogaWYgd2UgZmluZCBvbmUsIHdlIGdldCB0aHJlZSBwYXJ0czogZXZlcnl0aGluZyBiZWZvcmUgdGhlIG1hdGNoLCB0aGUgcmVwbGFjZWQgcGFydCxcbiAgICAgICAgLy8gYW5kIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIG1hdGNoLiBJbnNlcnQgYWxsIHRocmVlIGludG8gdGhlIG91dHB1dC4gV2UgbmVlZCB0byBkbyB0aGlzIGJlY2F1c2Ugd2UgY2FuIGluc2VydCBvYmplY3RzLlxuICAgICAgICAvLyBPdGhlcndpc2UgdGhlcmUgd291bGQgYmUgbm8gbmVlZCBmb3IgdGhlIHNwbGl0dGluZyBhbmQgd2UgY291bGQgZG8gc2ltcGxlIHJlcGxhY2VtZW50LlxuICAgICAgICBsZXQgbWF0Y2hGb3VuZFNvbWV3aGVyZSA9IGZhbHNlOyAvLyBJZiB3ZSBkb24ndCBmaW5kIGEgbWF0Y2ggYW55d2hlcmUgd2Ugd2FudCB0byBsb2cgaXRcbiAgICAgICAgZm9yIChsZXQgb3V0cHV0SW5kZXggPSAwOyBvdXRwdXRJbmRleCA8IG91dHB1dC5sZW5ndGg7IG91dHB1dEluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0VGV4dCA9IG91dHB1dFtvdXRwdXRJbmRleF07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0VGV4dCAhPT0gJ3N0cmluZycpIHsgLy8gV2UgbWlnaHQgaGF2ZSBpbnNlcnRlZCBvYmplY3RzIGVhcmxpZXIsIGRvbid0IHRyeSB0byByZXBsYWNlIHRoZW1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcHJvY2VzcyBldmVyeSBtYXRjaCBpbiB0aGUgc3RyaW5nXG4gICAgICAgICAgICAvLyBzdGFydGluZyB3aXRoIHRoZSBmaXJzdFxuICAgICAgICAgICAgbGV0IG1hdGNoID0gcmVnZXhwLmV4ZWMoaW5wdXRUZXh0KTtcblxuICAgICAgICAgICAgaWYgKCFtYXRjaCkgY29udGludWU7XG4gICAgICAgICAgICBtYXRjaEZvdW5kU29tZXdoZXJlID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gVGhlIHRleHR1YWwgcGFydCBiZWZvcmUgdGhlIGZpcnN0IG1hdGNoXG4gICAgICAgICAgICBjb25zdCBoZWFkID0gaW5wdXRUZXh0LnN1YnN0cigwLCBtYXRjaC5pbmRleCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHByZXZNYXRjaFxuICAgICAgICAgICAgbGV0IHByZXZNYXRjaDtcbiAgICAgICAgICAgIHdoaWxlIChtYXRjaCkge1xuICAgICAgICAgICAgICAgIC8vIHN0b3JlIHByZXZNYXRjaFxuICAgICAgICAgICAgICAgIHByZXZNYXRjaCA9IG1hdGNoO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhcHR1cmVkR3JvdXBzID0gbWF0Y2guc2xpY2UoMik7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVwbGFjZWQ7XG4gICAgICAgICAgICAgICAgLy8gSWYgc3Vic3RpdHV0aW9uIGlzIGEgZnVuY3Rpb24sIGNhbGwgaXRcbiAgICAgICAgICAgICAgICBpZiAobWFwcGluZ1tyZWdleHBTdHJpbmddIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZWQgPSAobWFwcGluZyBhcyBUYWdzKVtyZWdleHBTdHJpbmddLmFwcGx5KG51bGwsIGNhcHR1cmVkR3JvdXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlZCA9IG1hcHBpbmdbcmVnZXhwU3RyaW5nXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRXcmFwSW5TcGFuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBIZXJlIHdlIGFsc28gbmVlZCB0byBjaGVjayB0aGF0IGl0IGFjdHVhbGx5IGlzIGEgc3RyaW5nIGJlZm9yZSBjb21wYXJpbmcgYWdhaW5zdCBvbmVcbiAgICAgICAgICAgICAgICAvLyBUaGUgaGVhZCBhbmQgdGFpbCBhcmUgYWx3YXlzIHN0cmluZ3NcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VkICE9PSAnc3RyaW5nJyB8fCByZXBsYWNlZCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydHMucHVzaChyZXBsYWNlZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdHJ5IHRoZSBuZXh0IG1hdGNoXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSByZWdleHAuZXhlYyhpbnB1dFRleHQpO1xuXG4gICAgICAgICAgICAgICAgLy8gYWRkIHRoZSB0ZXh0IGJldHdlZW4gcHJldk1hdGNoIGFuZCB0aGlzIG9uZVxuICAgICAgICAgICAgICAgIC8vIG9yIHRoZSBlbmQgb2YgdGhlIHN0cmluZyBpZiBwcmV2TWF0Y2ggaXMgdGhlIGxhc3QgbWF0Y2hcbiAgICAgICAgICAgICAgICBsZXQgdGFpbDtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IHByZXZNYXRjaC5pbmRleCArIHByZXZNYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHRhaWwgPSBpbnB1dFRleHQuc3Vic3RyKHN0YXJ0SW5kZXgsIG1hdGNoLmluZGV4IC0gc3RhcnRJbmRleCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFpbCA9IGlucHV0VGV4dC5zdWJzdHIocHJldk1hdGNoLmluZGV4ICsgcHJldk1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YWlsKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRzLnB1c2godGFpbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbnNlcnQgaW4gcmV2ZXJzZSBvcmRlciBhcyBzcGxpY2UgZG9lcyBpbnNlcnQtYmVmb3JlIGFuZCB0aGlzIHdheSB3ZSBnZXQgdGhlIGZpbmFsIG9yZGVyIGNvcnJlY3RcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgb2xkIGVsZW1lbnQgYXQgdGhlIHNhbWUgdGltZVxuICAgICAgICAgICAgb3V0cHV0LnNwbGljZShvdXRwdXRJbmRleCwgMSwgLi4ucGFydHMpO1xuXG4gICAgICAgICAgICBpZiAoaGVhZCAhPT0gJycpIHsgLy8gRG9uJ3QgcHVzaCBlbXB0eSBub2RlcywgdGhleSBhcmUgb2Ygbm8gdXNlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnNwbGljZShvdXRwdXRJbmRleCwgMCwgaGVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaEZvdW5kU29tZXdoZXJlKSB7IC8vIFRoZSBjdXJyZW50IHJlZ2V4cCBkaWQgbm90IG1hdGNoIGFueXRoaW5nIGluIHRoZSBpbnB1dFxuICAgICAgICAgICAgLy8gTWlzc2luZyBtYXRjaGVzIGlzIGVudGlyZWx5IHBvc3NpYmxlIGJlY2F1c2UgeW91IG1pZ2h0IGNob29zZSB0byBzaG93IHNvbWUgdmFyaWFibGVzIG9ubHkgaW4gdGhlIGNhc2VcbiAgICAgICAgICAgIC8vIG9mIGUuZy4gcGx1cmFscy4gSXQncyBzdGlsbCBhIGJpdCBzdXNwaWNpb3VzLCBhbmQgY291bGQgYmUgZHVlIHRvIGFuIGVycm9yLCBzbyBsb2cgaXQuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBub3Qgc2hvd2luZyBjb3VudCBpcyBzbyBjb21tb24gdGhhdCBpdCdzIG5vdCB3b3J0aCBsb2dnaW5nLiBBbmQgb3RoZXIgY29tbW9ubHkgdW51c2VkIHZhcmlhYmxlc1xuICAgICAgICAgICAgLy8gaGVyZSwgaWYgdGhlcmUgYXJlIGFueS5cbiAgICAgICAgICAgIGlmIChyZWdleHBTdHJpbmcgIT09ICclXFxcXChjb3VudFxcXFwpcycpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ291bGQgbm90IGZpbmQgJHtyZWdleHB9IGluICR7dGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzaG91bGRXcmFwSW5TcGFuKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgbnVsbCwgLi4ub3V0cHV0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuICAgIH1cbn1cblxuLy8gQWxsb3cgb3ZlcnJpZGluZyB0aGUgdGV4dCBkaXNwbGF5ZWQgd2hlbiBubyB0cmFuc2xhdGlvbiBleGlzdHNcbi8vIEN1cnJlbnRseSBvbmx5IHVzZWQgaW4gdW5pdCB0ZXN0cyB0byBhdm9pZCBoYXZpbmcgdG8gbG9hZFxuLy8gdGhlIHRyYW5zbGF0aW9ucyBpbiBlbGVtZW50LXdlYlxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pc3NpbmdFbnRyeUdlbmVyYXRvcihmOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIGNvdW50ZXJwYXJ0LnNldE1pc3NpbmdFbnRyeUdlbmVyYXRvcihmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExhbmd1YWdlKHByZWZlcnJlZExhbmdzOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcmVmZXJyZWRMYW5ncykpIHtcbiAgICAgICAgcHJlZmVycmVkTGFuZ3MgPSBbcHJlZmVycmVkTGFuZ3NdO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICBpZiAocGxhZikge1xuICAgICAgICBwbGFmLnNldExhbmd1YWdlKHByZWZlcnJlZExhbmdzKTtcbiAgICB9XG5cbiAgICBsZXQgbGFuZ1RvVXNlO1xuICAgIGxldCBhdmFpbExhbmdzO1xuICAgIHJldHVybiBnZXRMYW5nc0pzb24oKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgYXZhaWxMYW5ncyA9IHJlc3VsdDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZlcnJlZExhbmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoYXZhaWxMYW5ncy5oYXNPd25Qcm9wZXJ0eShwcmVmZXJyZWRMYW5nc1tpXSkpIHtcbiAgICAgICAgICAgICAgICBsYW5nVG9Vc2UgPSBwcmVmZXJyZWRMYW5nc1tpXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxhbmdUb1VzZSkge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2sgdG8gZW5fRU4gaWYgbm9uZSBpcyBmb3VuZFxuICAgICAgICAgICAgbGFuZ1RvVXNlID0gJ2VuJztcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gZmluZCBhbiBhcHByb3ByaWF0ZSBsYW5ndWFnZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnZXRMYW5ndWFnZVJldHJ5KGkxOG5Gb2xkZXIgKyBhdmFpbExhbmdzW2xhbmdUb1VzZV0uZmlsZU5hbWUpO1xuICAgIH0pLnRoZW4oKGxhbmdEYXRhKSA9PiB7XG4gICAgICAgIGNvdW50ZXJwYXJ0LnJlZ2lzdGVyVHJhbnNsYXRpb25zKGxhbmdUb1VzZSwgbGFuZ0RhdGEpO1xuICAgICAgICBjb3VudGVycGFydC5zZXRMb2NhbGUobGFuZ1RvVXNlKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImxhbmd1YWdlXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIGxhbmdUb1VzZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2V0IGxhbmd1YWdlIHRvIFwiICsgbGFuZ1RvVXNlKTtcblxuICAgICAgICAvLyBTZXQgJ2VuJyBhcyBmYWxsYmFjayBsYW5ndWFnZTpcbiAgICAgICAgaWYgKGxhbmdUb1VzZSAhPT0gXCJlblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0TGFuZ3VhZ2VSZXRyeShpMThuRm9sZGVyICsgYXZhaWxMYW5nc1snZW4nXS5maWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICB9KS50aGVuKChsYW5nRGF0YSkgPT4ge1xuICAgICAgICBpZiAobGFuZ0RhdGEpIGNvdW50ZXJwYXJ0LnJlZ2lzdGVyVHJhbnNsYXRpb25zKCdlbicsIGxhbmdEYXRhKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbExhbmd1YWdlc0Zyb21Kc29uKCkge1xuICAgIHJldHVybiBnZXRMYW5nc0pzb24oKS50aGVuKChsYW5nc09iamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBsYW5ncyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGxhbmdLZXkgaW4gbGFuZ3NPYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChsYW5nc09iamVjdC5oYXNPd25Qcm9wZXJ0eShsYW5nS2V5KSkge1xuICAgICAgICAgICAgICAgIGxhbmdzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBsYW5nS2V5LFxuICAgICAgICAgICAgICAgICAgICAnbGFiZWwnOiBsYW5nc09iamVjdFtsYW5nS2V5XS5sYWJlbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGFuZ3M7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYW5ndWFnZXNGcm9tQnJvd3NlcigpIHtcbiAgICBpZiAobmF2aWdhdG9yLmxhbmd1YWdlcyAmJiBuYXZpZ2F0b3IubGFuZ3VhZ2VzLmxlbmd0aCkgcmV0dXJuIG5hdmlnYXRvci5sYW5ndWFnZXM7XG4gICAgaWYgKG5hdmlnYXRvci5sYW5ndWFnZSkgcmV0dXJuIFtuYXZpZ2F0b3IubGFuZ3VhZ2VdO1xuICAgIHJldHVybiBbbmF2aWdhdG9yLnVzZXJMYW5ndWFnZSB8fCBcImVuXCJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFuZ3VhZ2VGcm9tQnJvd3NlcigpIHtcbiAgICByZXR1cm4gZ2V0TGFuZ3VhZ2VzRnJvbUJyb3dzZXIoKVswXTtcbn1cblxuLyoqXG4gKiBUdXJucyBhIGxhbmd1YWdlIHN0cmluZywgbm9ybWFsaXNlcyBpdCxcbiAqIChzZWUgbm9ybWFsaXplTGFuZ3VhZ2VLZXkpIGludG8gYW4gYXJyYXkgb2YgbGFuZ3VhZ2Ugc3RyaW5nc1xuICogd2l0aCBmYWxsYmFjayB0byBnZW5lcmljIGxhbmd1YWdlc1xuICogKGVnLiAncHQtQlInID0+IFsncHQtYnInLCAncHQnXSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFuZ3VhZ2UgVGhlIGlucHV0IGxhbmd1YWdlIHN0cmluZ1xuICogQHJldHVybiB7c3RyaW5nW119IExpc3Qgb2Ygbm9ybWFsaXNlZCBsYW5ndWFnZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5vcm1hbGl6ZWRMYW5ndWFnZUtleXMobGFuZ3VhZ2U6IHN0cmluZykge1xuICAgIGNvbnN0IGxhbmd1YWdlS2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBub3JtYWxpemVkTGFuZ3VhZ2UgPSBub3JtYWxpemVMYW5ndWFnZUtleShsYW5ndWFnZSk7XG4gICAgY29uc3QgbGFuZ3VhZ2VQYXJ0cyA9IG5vcm1hbGl6ZWRMYW5ndWFnZS5zcGxpdCgnLScpO1xuICAgIGlmIChsYW5ndWFnZVBhcnRzLmxlbmd0aCA9PT0gMiAmJiBsYW5ndWFnZVBhcnRzWzBdID09PSBsYW5ndWFnZVBhcnRzWzFdKSB7XG4gICAgICAgIGxhbmd1YWdlS2V5cy5wdXNoKGxhbmd1YWdlUGFydHNbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxhbmd1YWdlS2V5cy5wdXNoKG5vcm1hbGl6ZWRMYW5ndWFnZSk7XG4gICAgICAgIGlmIChsYW5ndWFnZVBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgbGFuZ3VhZ2VLZXlzLnB1c2gobGFuZ3VhZ2VQYXJ0c1swXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxhbmd1YWdlS2V5cztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbGFuZ3VhZ2Ugc3RyaW5nIHdpdGggdW5kZXJzY29yZXMgcmVwbGFjZWQgd2l0aFxuICogaHlwaGVucywgYW5kIGxvd2VyY2FzZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxhbmd1YWdlIFRoZSBsYW5ndWFnZSBzdHJpbmcgdG8gYmUgbm9ybWFsaXplZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIG5vcm1hbGl6ZWQgbGFuZ3VhZ2Ugc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVMYW5ndWFnZUtleShsYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGxhbmd1YWdlLnRvTG93ZXJDYXNlKCkucmVwbGFjZShcIl9cIiwgXCItXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudExhbmd1YWdlKCkge1xuICAgIHJldHVybiBjb3VudGVycGFydC5nZXRMb2NhbGUoKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgbGFuZ3VhZ2UgY29kZXMsIHBpY2sgdGhlIG1vc3QgYXBwcm9wcmlhdGUgb25lXG4gKiBnaXZlbiB0aGUgY3VycmVudCBsYW5ndWFnZSAoaWUuIGdldEN1cnJlbnRMYW5ndWFnZSgpKVxuICogRW5nbGlzaCBpcyBhc3N1bWVkIHRvIGJlIGEgcmVhc29uYWJsZSBkZWZhdWx0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGxhbmdzIExpc3Qgb2YgbGFuZ3VhZ2UgY29kZXMgdG8gcGljayBmcm9tXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgbW9zdCBhcHByb3ByaWF0ZSBsYW5ndWFnZSBjb2RlIGZyb20gbGFuZ3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpY2tCZXN0TGFuZ3VhZ2UobGFuZ3M6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICBjb25zdCBjdXJyZW50TGFuZyA9IGdldEN1cnJlbnRMYW5ndWFnZSgpO1xuICAgIGNvbnN0IG5vcm1hbGlzZWRMYW5ncyA9IGxhbmdzLm1hcChub3JtYWxpemVMYW5ndWFnZUtleSk7XG5cbiAgICB7XG4gICAgICAgIC8vIEJlc3QgaXMgYW4gZXhhY3QgbWF0Y2hcbiAgICAgICAgY29uc3QgY3VycmVudExhbmdJbmRleCA9IG5vcm1hbGlzZWRMYW5ncy5pbmRleE9mKGN1cnJlbnRMYW5nKTtcbiAgICAgICAgaWYgKGN1cnJlbnRMYW5nSW5kZXggPiAtMSkgcmV0dXJuIGxhbmdzW2N1cnJlbnRMYW5nSW5kZXhdO1xuICAgIH1cblxuICAgIHtcbiAgICAgICAgLy8gRmFpbGluZyB0aGF0LCBhIGRpZmZlcmVudCBkaWFsZWN0IG9mIHRoZSBzYW1lIGxhbmd1YWdlXG4gICAgICAgIGNvbnN0IGNsb3NlTGFuZ0luZGV4ID0gbm9ybWFsaXNlZExhbmdzLmZpbmRJbmRleCgobCkgPT4gbC5zdWJzdHIoMCwgMikgPT09IGN1cnJlbnRMYW5nLnN1YnN0cigwLCAyKSk7XG4gICAgICAgIGlmIChjbG9zZUxhbmdJbmRleCA+IC0xKSByZXR1cm4gbGFuZ3NbY2xvc2VMYW5nSW5kZXhdO1xuICAgIH1cblxuICAgIHtcbiAgICAgICAgLy8gTmVpdGhlciBvZiB0aG9zZT8gVHJ5IGFuIGVuZ2xpc2ggdmFyaWFudC5cbiAgICAgICAgY29uc3QgZW5JbmRleCA9IG5vcm1hbGlzZWRMYW5ncy5maW5kSW5kZXgoKGwpID0+IGwuc3RhcnRzV2l0aCgnZW4nKSk7XG4gICAgICAgIGlmIChlbkluZGV4ID4gLTEpIHJldHVybiBsYW5nc1tlbkluZGV4XTtcbiAgICB9XG5cbiAgICAvLyBpZiBub3RoaW5nIGVsc2UsIHVzZSB0aGUgZmlyc3RcbiAgICByZXR1cm4gbGFuZ3NbMF07XG59XG5cbmZ1bmN0aW9uIGdldExhbmdzSnNvbigpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCB1cmw7XG4gICAgICAgIGlmICh0eXBlb2Yod2VicGFja0xhbmdKc29uVXJsKSA9PT0gJ3N0cmluZycpIHsgLy8gaW4gSmVzdCB0aGlzICd1cmwnIGlzbid0IGEgVVJMLCBzbyBqdXN0IGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgdXJsID0gd2VicGFja0xhbmdKc29uVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gaTE4bkZvbGRlciArICdsYW5ndWFnZXMuanNvbic7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdChcbiAgICAgICAgICAgIHsgbWV0aG9kOiBcIkdFVFwiLCB1cmwgfSxcbiAgICAgICAgICAgIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciB8fCByZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoYm9keSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gd2VibGF0ZVRvQ291bnRlcnBhcnQoaW5UcnM6IG9iamVjdCk6IG9iamVjdCB7XG4gICAgY29uc3Qgb3V0VHJzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhpblRycykpIHtcbiAgICAgICAgY29uc3Qga2V5UGFydHMgPSBrZXkuc3BsaXQoJ3wnLCAyKTtcbiAgICAgICAgaWYgKGtleVBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgbGV0IG9iaiA9IG91dFRyc1trZXlQYXJ0c1swXV07XG4gICAgICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvYmogPSB7fTtcbiAgICAgICAgICAgICAgICBvdXRUcnNba2V5UGFydHNbMF1dID0gb2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqW2tleVBhcnRzWzFdXSA9IGluVHJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRUcnNba2V5XSA9IGluVHJzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0VHJzO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRMYW5ndWFnZVJldHJ5KGxhbmdQYXRoOiBzdHJpbmcsIG51bSA9IDMpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgIHJldHVybiByZXRyeSgoKSA9PiBnZXRMYW5ndWFnZShsYW5nUGF0aCksIG51bSwgZSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGxvYWQgaTE4blwiLCBsYW5nUGF0aCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBhbHdheXMgcmV0cnlcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UobGFuZ1BhdGg6IHN0cmluZyk6IFByb21pc2U8b2JqZWN0PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVxdWVzdChcbiAgICAgICAgICAgIHsgbWV0aG9kOiBcIkdFVFwiLCB1cmw6IGxhbmdQYXRoIH0sXG4gICAgICAgICAgICAoZXJyLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgfHwgcmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3ZWJsYXRlVG9Db3VudGVycGFydChKU09OLnBhcnNlKGJvZHkpKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH0pO1xufVxuIl19