"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startTermsFlow = startTermsFlow;
exports.dialogTermsInteractionCallback = dialogTermsInteractionCallback;
exports.Service = exports.TermsNotSignedError = void 0;

var _classnames = _interopRequireDefault(require("classnames"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var sdk = _interopRequireWildcard(require("."));

var _Modal = _interopRequireDefault(require("./Modal"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
class TermsNotSignedError extends Error {}
/**
 * Class representing a service that may have terms & conditions that
 * require agreement from the user before the user can use that service.
 */


exports.TermsNotSignedError = TermsNotSignedError;

class Service {
  /**
   * @param {MatrixClient.SERVICE_TYPES} serviceType The type of service
   * @param {string} baseUrl The Base URL of the service (ie. before '/_matrix')
   * @param {string} accessToken The user's access token for the service
   */
  constructor(serviceType
  /*: string*/
  , baseUrl
  /*: string*/
  , accessToken
  /*: string*/
  ) {
    this.serviceType
    /*:: */
    = serviceType
    /*:: */
    ;
    this.baseUrl
    /*:: */
    = baseUrl
    /*:: */
    ;
    this.accessToken
    /*:: */
    = accessToken
    /*:: */
    ;
  }

}
/*:: export type TermsInteractionCallback = (
    policiesAndServicePairs: {
        service: Service,
        policies: Policies,
    }[],
    agreedUrls: string[],
    extraClassNames?: string,
) => Promise<string[]>;*/


exports.Service = Service;

/**
 * Start a flow where the user is presented with terms & conditions for some services
 *
 * @param {Service[]} services Object with keys 'serviceType', 'baseUrl', 'accessToken'
 * @param {function} interactionCallback Function called with:
 *      * an array of { service: {Service}, policies: {terms response from API} }
 *      * an array of URLs the user has already agreed to
 *     Must return a Promise which resolves with a list of URLs of documents agreed to
 * @returns {Promise} resolves when the user agreed to all necessary terms or rejects
 *     if they cancel.
 */
async function startTermsFlow(services
/*: Service[]*/
, interactionCallback
/*: TermsInteractionCallback*/
= dialogTermsInteractionCallback) {
  const termsPromises = services.map(s => _MatrixClientPeg.MatrixClientPeg.get().getTerms(s.serviceType, s.baseUrl));
  /*
   * a /terms response looks like:
   * {
   *     "policies": {
   *         "terms_of_service": {
   *             "version": "2.0",
   *              "en": {
   *                 "name": "Terms of Service",
   *                 "url": "https://example.org/somewhere/terms-2.0-en.html"
   *             },
   *             "fr": {
   *                 "name": "Conditions d'utilisation",
   *                 "url": "https://example.org/somewhere/terms-2.0-fr.html"
   *             }
   *         }
   *     }
   * }
   */

  const terms
  /*: { policies: Policies }[]*/
  = await Promise.all(termsPromises);
  const policiesAndServicePairs = terms.map((t, i) => {
    return {
      'service': services[i],
      'policies': t.policies
    };
  }); // fetch the set of agreed policy URLs from account data

  const currentAcceptedTerms = await _MatrixClientPeg.MatrixClientPeg.get().getAccountData('m.accepted_terms');
  let agreedUrlSet;

  if (!currentAcceptedTerms || !currentAcceptedTerms.getContent() || !currentAcceptedTerms.getContent().accepted) {
    agreedUrlSet = new Set();
  } else {
    agreedUrlSet = new Set(currentAcceptedTerms.getContent().accepted);
  } // remove any policies the user has already agreed to and any services where
  // they've already agreed to all the policies
  // NB. it could be nicer to show the user stuff they've already agreed to,
  // but then they'd assume they can un-check the boxes to un-agree to a policy,
  // but that is not a thing the API supports, so probably best to just show
  // things they've not agreed to yet.


  const unagreedPoliciesAndServicePairs = [];

  for (const {
    service,
    policies
  } of policiesAndServicePairs) {
    const unagreedPolicies = {};

    for (const [policyName, policy] of Object.entries(policies)) {
      let policyAgreed = false;

      for (const lang of Object.keys(policy)) {
        if (lang === 'version') continue;

        if (agreedUrlSet.has(policy[lang].url)) {
          policyAgreed = true;
          break;
        }
      }

      if (!policyAgreed) unagreedPolicies[policyName] = policy;
    }

    if (Object.keys(unagreedPolicies).length > 0) {
      unagreedPoliciesAndServicePairs.push({
        service,
        policies: unagreedPolicies
      });
    }
  } // if there's anything left to agree to, prompt the user


  const numAcceptedBeforeAgreement = agreedUrlSet.size;

  if (unagreedPoliciesAndServicePairs.length > 0) {
    const newlyAgreedUrls = await interactionCallback(unagreedPoliciesAndServicePairs, [...agreedUrlSet]);
    console.log("User has agreed to URLs", newlyAgreedUrls); // Merge with previously agreed URLs

    newlyAgreedUrls.forEach(url => agreedUrlSet.add(url));
  } else {
    console.log("User has already agreed to all required policies");
  } // We only ever add to the set of URLs, so if anything has changed then we'd see a different length


  if (agreedUrlSet.size !== numAcceptedBeforeAgreement) {
    const newAcceptedTerms = {
      accepted: Array.from(agreedUrlSet)
    };
    await _MatrixClientPeg.MatrixClientPeg.get().setAccountData('m.accepted_terms', newAcceptedTerms);
  }

  const agreePromises = policiesAndServicePairs.map(policiesAndService => {
    // filter the agreed URL list for ones that are actually for this service
    // (one URL may be used for multiple services)
    // Not a particularly efficient loop but probably fine given the numbers involved
    const urlsForService = Array.from(agreedUrlSet).filter(url => {
      for (const policy of Object.values(policiesAndService.policies)) {
        for (const lang of Object.keys(policy)) {
          if (lang === 'version') continue;
          if (policy[lang].url === url) return true;
        }
      }

      return false;
    });
    if (urlsForService.length === 0) return Promise.resolve();
    return _MatrixClientPeg.MatrixClientPeg.get().agreeToTerms(policiesAndService.service.serviceType, policiesAndService.service.baseUrl, policiesAndService.service.accessToken, urlsForService);
  });
  return Promise.all(agreePromises);
}

function dialogTermsInteractionCallback(policiesAndServicePairs
/*: {
        service: Service,
        policies: { [policy: string]: Policy },
    }[]*/
, agreedUrls
/*: string[]*/
, extraClassNames
/*: string*/
)
/*: Promise<string[]>*/
{
  return new Promise((resolve, reject) => {
    console.log("Terms that need agreement", policiesAndServicePairs);
    const TermsDialog = sdk.getComponent("views.dialogs.TermsDialog");

    _Modal.default.createTrackedDialog('Terms of Service', '', TermsDialog, {
      policiesAndServicePairs,
      agreedUrls,
      onFinished: (done, agreedUrls) => {
        if (!done) {
          reject(new TermsNotSignedError());
          return;
        }

        resolve(agreedUrls);
      }
    }, (0, _classnames.default)("mx_TermsDialog", extraClassNames));
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UZXJtcy50cyJdLCJuYW1lcyI6WyJUZXJtc05vdFNpZ25lZEVycm9yIiwiRXJyb3IiLCJTZXJ2aWNlIiwiY29uc3RydWN0b3IiLCJzZXJ2aWNlVHlwZSIsImJhc2VVcmwiLCJhY2Nlc3NUb2tlbiIsInN0YXJ0VGVybXNGbG93Iiwic2VydmljZXMiLCJpbnRlcmFjdGlvbkNhbGxiYWNrIiwiZGlhbG9nVGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrIiwidGVybXNQcm9taXNlcyIsIm1hcCIsInMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRUZXJtcyIsInRlcm1zIiwiUHJvbWlzZSIsImFsbCIsInBvbGljaWVzQW5kU2VydmljZVBhaXJzIiwidCIsImkiLCJwb2xpY2llcyIsImN1cnJlbnRBY2NlcHRlZFRlcm1zIiwiZ2V0QWNjb3VudERhdGEiLCJhZ3JlZWRVcmxTZXQiLCJnZXRDb250ZW50IiwiYWNjZXB0ZWQiLCJTZXQiLCJ1bmFncmVlZFBvbGljaWVzQW5kU2VydmljZVBhaXJzIiwic2VydmljZSIsInVuYWdyZWVkUG9saWNpZXMiLCJwb2xpY3lOYW1lIiwicG9saWN5IiwiT2JqZWN0IiwiZW50cmllcyIsInBvbGljeUFncmVlZCIsImxhbmciLCJrZXlzIiwiaGFzIiwidXJsIiwibGVuZ3RoIiwicHVzaCIsIm51bUFjY2VwdGVkQmVmb3JlQWdyZWVtZW50Iiwic2l6ZSIsIm5ld2x5QWdyZWVkVXJscyIsImNvbnNvbGUiLCJsb2ciLCJmb3JFYWNoIiwiYWRkIiwibmV3QWNjZXB0ZWRUZXJtcyIsIkFycmF5IiwiZnJvbSIsInNldEFjY291bnREYXRhIiwiYWdyZWVQcm9taXNlcyIsInBvbGljaWVzQW5kU2VydmljZSIsInVybHNGb3JTZXJ2aWNlIiwiZmlsdGVyIiwidmFsdWVzIiwicmVzb2x2ZSIsImFncmVlVG9UZXJtcyIsImFncmVlZFVybHMiLCJleHRyYUNsYXNzTmFtZXMiLCJyZWplY3QiLCJUZXJtc0RpYWxvZyIsInNkayIsImdl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LENBQXRCO0FBdUJBLFNBQU92QyxPQUFPLENBQUNDLEdBQVIsQ0FBWW9DLGFBQVosQ0FBUDtBQUNIOztBQUVNLFNBQVM3Qyw4QkFBVCxDQUNIVTtBQURHO0FBQ1A7QUFDQTtBQUNBO0FBSE8sRUFLSDBDO0FBTEc7QUFBQSxFQU1IQztBQU5HO0FBQUE7QUFBQTtBQU9jO0FBQ2pCLFNBQU8sSUFBSTdDLE9BQUosQ0FBWSxDQUFDMEMsT0FBRCxFQUFVSSxNQUFWLEtBQXFCO0FBQ3BDakIsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUM1Qix1QkFBekM7QUFDQSxVQUFNNkMsV0FBVyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMkJBQWpCLENBQXBCOztBQUVBQyxtQkFBTUMsbUJBQU4sQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDLEVBQWtESixXQUFsRCxFQUErRDtBQUMzRDdDLE1BQUFBLHVCQUQyRDtBQUUzRDBDLE1BQUFBLFVBRjJEO0FBRzNEUSxNQUFBQSxVQUFVLEVBQUUsQ0FBQ0MsSUFBRCxFQUFPVCxVQUFQLEtBQXNCO0FBQzlCLFlBQUksQ0FBQ1MsSUFBTCxFQUFXO0FBQ1BQLFVBQUFBLE1BQU0sQ0FBQyxJQUFJaEUsbUJBQUosRUFBRCxDQUFOO0FBQ0E7QUFDSDs7QUFDRDRELFFBQUFBLE9BQU8sQ0FBQ0UsVUFBRCxDQUFQO0FBQ0g7QUFUMEQsS0FBL0QsRUFVRyx5QkFBVyxnQkFBWCxFQUE2QkMsZUFBN0IsQ0FWSDtBQVdILEdBZk0sQ0FBUDtBQWdCSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4nO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuXG5leHBvcnQgY2xhc3MgVGVybXNOb3RTaWduZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgc2VydmljZSB0aGF0IG1heSBoYXZlIHRlcm1zICYgY29uZGl0aW9ucyB0aGF0XG4gKiByZXF1aXJlIGFncmVlbWVudCBmcm9tIHRoZSB1c2VyIGJlZm9yZSB0aGUgdXNlciBjYW4gdXNlIHRoYXQgc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlcnZpY2Uge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWF0cml4Q2xpZW50LlNFUlZJQ0VfVFlQRVN9IHNlcnZpY2VUeXBlIFRoZSB0eXBlIG9mIHNlcnZpY2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVybCBUaGUgQmFzZSBVUkwgb2YgdGhlIHNlcnZpY2UgKGllLiBiZWZvcmUgJy9fbWF0cml4JylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWNjZXNzVG9rZW4gVGhlIHVzZXIncyBhY2Nlc3MgdG9rZW4gZm9yIHRoZSBzZXJ2aWNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHVibGljIHNlcnZpY2VUeXBlOiBzdHJpbmcsIHB1YmxpYyBiYXNlVXJsOiBzdHJpbmcsIHB1YmxpYyBhY2Nlc3NUb2tlbjogc3RyaW5nKSB7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgUG9saWN5IHtcbiAgICAvLyBAdHMtaWdub3JlOiBObyBncmVhdCB3YXkgdG8gZXhwcmVzcyBpbmRleGVkIHR5cGVzIHRvZ2V0aGVyIHdpdGggb3RoZXIga2V5c1xuICAgIHZlcnNpb246IHN0cmluZztcbiAgICBbbGFuZzogc3RyaW5nXToge1xuICAgICAgICB1cmw6IHN0cmluZztcbiAgICB9O1xufVxudHlwZSBQb2xpY2llcyA9IHtcbiAgICBbcG9saWN5OiBzdHJpbmddOiBQb2xpY3ksXG59O1xuXG5leHBvcnQgdHlwZSBUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2sgPSAoXG4gICAgcG9saWNpZXNBbmRTZXJ2aWNlUGFpcnM6IHtcbiAgICAgICAgc2VydmljZTogU2VydmljZSxcbiAgICAgICAgcG9saWNpZXM6IFBvbGljaWVzLFxuICAgIH1bXSxcbiAgICBhZ3JlZWRVcmxzOiBzdHJpbmdbXSxcbiAgICBleHRyYUNsYXNzTmFtZXM/OiBzdHJpbmcsXG4pID0+IFByb21pc2U8c3RyaW5nW10+O1xuXG4vKipcbiAqIFN0YXJ0IGEgZmxvdyB3aGVyZSB0aGUgdXNlciBpcyBwcmVzZW50ZWQgd2l0aCB0ZXJtcyAmIGNvbmRpdGlvbnMgZm9yIHNvbWUgc2VydmljZXNcbiAqXG4gKiBAcGFyYW0ge1NlcnZpY2VbXX0gc2VydmljZXMgT2JqZWN0IHdpdGgga2V5cyAnc2VydmljZVR5cGUnLCAnYmFzZVVybCcsICdhY2Nlc3NUb2tlbidcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGludGVyYWN0aW9uQ2FsbGJhY2sgRnVuY3Rpb24gY2FsbGVkIHdpdGg6XG4gKiAgICAgICogYW4gYXJyYXkgb2YgeyBzZXJ2aWNlOiB7U2VydmljZX0sIHBvbGljaWVzOiB7dGVybXMgcmVzcG9uc2UgZnJvbSBBUEl9IH1cbiAqICAgICAgKiBhbiBhcnJheSBvZiBVUkxzIHRoZSB1c2VyIGhhcyBhbHJlYWR5IGFncmVlZCB0b1xuICogICAgIE11c3QgcmV0dXJuIGEgUHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIGEgbGlzdCBvZiBVUkxzIG9mIGRvY3VtZW50cyBhZ3JlZWQgdG9cbiAqIEByZXR1cm5zIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRoZSB1c2VyIGFncmVlZCB0byBhbGwgbmVjZXNzYXJ5IHRlcm1zIG9yIHJlamVjdHNcbiAqICAgICBpZiB0aGV5IGNhbmNlbC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0VGVybXNGbG93KFxuICAgIHNlcnZpY2VzOiBTZXJ2aWNlW10sXG4gICAgaW50ZXJhY3Rpb25DYWxsYmFjazogVGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrID0gZGlhbG9nVGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrLFxuKSB7XG4gICAgY29uc3QgdGVybXNQcm9taXNlcyA9IHNlcnZpY2VzLm1hcChcbiAgICAgICAgKHMpID0+IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUZXJtcyhzLnNlcnZpY2VUeXBlLCBzLmJhc2VVcmwpLFxuICAgICk7XG5cbiAgICAvKlxuICAgICAqIGEgL3Rlcm1zIHJlc3BvbnNlIGxvb2tzIGxpa2U6XG4gICAgICoge1xuICAgICAqICAgICBcInBvbGljaWVzXCI6IHtcbiAgICAgKiAgICAgICAgIFwidGVybXNfb2Zfc2VydmljZVwiOiB7XG4gICAgICogICAgICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMi4wXCIsXG4gICAgICogICAgICAgICAgICAgIFwiZW5cIjoge1xuICAgICAqICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJUZXJtcyBvZiBTZXJ2aWNlXCIsXG4gICAgICogICAgICAgICAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9leGFtcGxlLm9yZy9zb21ld2hlcmUvdGVybXMtMi4wLWVuLmh0bWxcIlxuICAgICAqICAgICAgICAgICAgIH0sXG4gICAgICogICAgICAgICAgICAgXCJmclwiOiB7XG4gICAgICogICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIkNvbmRpdGlvbnMgZCd1dGlsaXNhdGlvblwiLFxuICAgICAqICAgICAgICAgICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vZXhhbXBsZS5vcmcvc29tZXdoZXJlL3Rlcm1zLTIuMC1mci5odG1sXCJcbiAgICAgKiAgICAgICAgICAgICB9XG4gICAgICogICAgICAgICB9XG4gICAgICogICAgIH1cbiAgICAgKiB9XG4gICAgICovXG5cbiAgICBjb25zdCB0ZXJtczogeyBwb2xpY2llczogUG9saWNpZXMgfVtdID0gYXdhaXQgUHJvbWlzZS5hbGwodGVybXNQcm9taXNlcyk7XG4gICAgY29uc3QgcG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMgPSB0ZXJtcy5tYXAoKHQsIGkpID0+IHsgcmV0dXJuIHsgJ3NlcnZpY2UnOiBzZXJ2aWNlc1tpXSwgJ3BvbGljaWVzJzogdC5wb2xpY2llcyB9OyB9KTtcblxuICAgIC8vIGZldGNoIHRoZSBzZXQgb2YgYWdyZWVkIHBvbGljeSBVUkxzIGZyb20gYWNjb3VudCBkYXRhXG4gICAgY29uc3QgY3VycmVudEFjY2VwdGVkVGVybXMgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0QWNjb3VudERhdGEoJ20uYWNjZXB0ZWRfdGVybXMnKTtcbiAgICBsZXQgYWdyZWVkVXJsU2V0O1xuICAgIGlmICghY3VycmVudEFjY2VwdGVkVGVybXMgfHwgIWN1cnJlbnRBY2NlcHRlZFRlcm1zLmdldENvbnRlbnQoKSB8fCAhY3VycmVudEFjY2VwdGVkVGVybXMuZ2V0Q29udGVudCgpLmFjY2VwdGVkKSB7XG4gICAgICAgIGFncmVlZFVybFNldCA9IG5ldyBTZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhZ3JlZWRVcmxTZXQgPSBuZXcgU2V0KGN1cnJlbnRBY2NlcHRlZFRlcm1zLmdldENvbnRlbnQoKS5hY2NlcHRlZCk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFueSBwb2xpY2llcyB0aGUgdXNlciBoYXMgYWxyZWFkeSBhZ3JlZWQgdG8gYW5kIGFueSBzZXJ2aWNlcyB3aGVyZVxuICAgIC8vIHRoZXkndmUgYWxyZWFkeSBhZ3JlZWQgdG8gYWxsIHRoZSBwb2xpY2llc1xuICAgIC8vIE5CLiBpdCBjb3VsZCBiZSBuaWNlciB0byBzaG93IHRoZSB1c2VyIHN0dWZmIHRoZXkndmUgYWxyZWFkeSBhZ3JlZWQgdG8sXG4gICAgLy8gYnV0IHRoZW4gdGhleSdkIGFzc3VtZSB0aGV5IGNhbiB1bi1jaGVjayB0aGUgYm94ZXMgdG8gdW4tYWdyZWUgdG8gYSBwb2xpY3ksXG4gICAgLy8gYnV0IHRoYXQgaXMgbm90IGEgdGhpbmcgdGhlIEFQSSBzdXBwb3J0cywgc28gcHJvYmFibHkgYmVzdCB0byBqdXN0IHNob3dcbiAgICAvLyB0aGluZ3MgdGhleSd2ZSBub3QgYWdyZWVkIHRvIHlldC5cbiAgICBjb25zdCB1bmFncmVlZFBvbGljaWVzQW5kU2VydmljZVBhaXJzID0gW107XG4gICAgZm9yIChjb25zdCB7c2VydmljZSwgcG9saWNpZXN9IG9mIHBvbGljaWVzQW5kU2VydmljZVBhaXJzKSB7XG4gICAgICAgIGNvbnN0IHVuYWdyZWVkUG9saWNpZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbcG9saWN5TmFtZSwgcG9saWN5XSBvZiBPYmplY3QuZW50cmllcyhwb2xpY2llcykpIHtcbiAgICAgICAgICAgIGxldCBwb2xpY3lBZ3JlZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGFuZyBvZiBPYmplY3Qua2V5cyhwb2xpY3kpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhbmcgPT09ICd2ZXJzaW9uJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKGFncmVlZFVybFNldC5oYXMocG9saWN5W2xhbmddLnVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9saWN5QWdyZWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb2xpY3lBZ3JlZWQpIHVuYWdyZWVkUG9saWNpZXNbcG9saWN5TmFtZV0gPSBwb2xpY3k7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHVuYWdyZWVkUG9saWNpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHVuYWdyZWVkUG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMucHVzaCh7c2VydmljZSwgcG9saWNpZXM6IHVuYWdyZWVkUG9saWNpZXN9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHRoZXJlJ3MgYW55dGhpbmcgbGVmdCB0byBhZ3JlZSB0bywgcHJvbXB0IHRoZSB1c2VyXG4gICAgY29uc3QgbnVtQWNjZXB0ZWRCZWZvcmVBZ3JlZW1lbnQgPSBhZ3JlZWRVcmxTZXQuc2l6ZTtcbiAgICBpZiAodW5hZ3JlZWRQb2xpY2llc0FuZFNlcnZpY2VQYWlycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IG5ld2x5QWdyZWVkVXJscyA9IGF3YWl0IGludGVyYWN0aW9uQ2FsbGJhY2sodW5hZ3JlZWRQb2xpY2llc0FuZFNlcnZpY2VQYWlycywgWy4uLmFncmVlZFVybFNldF0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVzZXIgaGFzIGFncmVlZCB0byBVUkxzXCIsIG5ld2x5QWdyZWVkVXJscyk7XG4gICAgICAgIC8vIE1lcmdlIHdpdGggcHJldmlvdXNseSBhZ3JlZWQgVVJMc1xuICAgICAgICBuZXdseUFncmVlZFVybHMuZm9yRWFjaCh1cmwgPT4gYWdyZWVkVXJsU2V0LmFkZCh1cmwpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVzZXIgaGFzIGFscmVhZHkgYWdyZWVkIHRvIGFsbCByZXF1aXJlZCBwb2xpY2llc1wiKTtcbiAgICB9XG5cbiAgICAvLyBXZSBvbmx5IGV2ZXIgYWRkIHRvIHRoZSBzZXQgb2YgVVJMcywgc28gaWYgYW55dGhpbmcgaGFzIGNoYW5nZWQgdGhlbiB3ZSdkIHNlZSBhIGRpZmZlcmVudCBsZW5ndGhcbiAgICBpZiAoYWdyZWVkVXJsU2V0LnNpemUgIT09IG51bUFjY2VwdGVkQmVmb3JlQWdyZWVtZW50KSB7XG4gICAgICAgIGNvbnN0IG5ld0FjY2VwdGVkVGVybXMgPSB7YWNjZXB0ZWQ6IEFycmF5LmZyb20oYWdyZWVkVXJsU2V0KX07XG4gICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRBY2NvdW50RGF0YSgnbS5hY2NlcHRlZF90ZXJtcycsIG5ld0FjY2VwdGVkVGVybXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGFncmVlUHJvbWlzZXMgPSBwb2xpY2llc0FuZFNlcnZpY2VQYWlycy5tYXAoKHBvbGljaWVzQW5kU2VydmljZSkgPT4ge1xuICAgICAgICAvLyBmaWx0ZXIgdGhlIGFncmVlZCBVUkwgbGlzdCBmb3Igb25lcyB0aGF0IGFyZSBhY3R1YWxseSBmb3IgdGhpcyBzZXJ2aWNlXG4gICAgICAgIC8vIChvbmUgVVJMIG1heSBiZSB1c2VkIGZvciBtdWx0aXBsZSBzZXJ2aWNlcylcbiAgICAgICAgLy8gTm90IGEgcGFydGljdWxhcmx5IGVmZmljaWVudCBsb29wIGJ1dCBwcm9iYWJseSBmaW5lIGdpdmVuIHRoZSBudW1iZXJzIGludm9sdmVkXG4gICAgICAgIGNvbnN0IHVybHNGb3JTZXJ2aWNlID0gQXJyYXkuZnJvbShhZ3JlZWRVcmxTZXQpLmZpbHRlcigodXJsKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBvbGljeSBvZiBPYmplY3QudmFsdWVzKHBvbGljaWVzQW5kU2VydmljZS5wb2xpY2llcykpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxhbmcgb2YgT2JqZWN0LmtleXMocG9saWN5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFuZyA9PT0gJ3ZlcnNpb24nKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvbGljeVtsYW5nXS51cmwgPT09IHVybCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodXJsc0ZvclNlcnZpY2UubGVuZ3RoID09PSAwKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5hZ3JlZVRvVGVybXMoXG4gICAgICAgICAgICBwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5zZXJ2aWNlVHlwZSxcbiAgICAgICAgICAgIHBvbGljaWVzQW5kU2VydmljZS5zZXJ2aWNlLmJhc2VVcmwsXG4gICAgICAgICAgICBwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5hY2Nlc3NUb2tlbixcbiAgICAgICAgICAgIHVybHNGb3JTZXJ2aWNlLFxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChhZ3JlZVByb21pc2VzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpYWxvZ1Rlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayhcbiAgICBwb2xpY2llc0FuZFNlcnZpY2VQYWlyczoge1xuICAgICAgICBzZXJ2aWNlOiBTZXJ2aWNlLFxuICAgICAgICBwb2xpY2llczogeyBbcG9saWN5OiBzdHJpbmddOiBQb2xpY3kgfSxcbiAgICB9W10sXG4gICAgYWdyZWVkVXJsczogc3RyaW5nW10sXG4gICAgZXh0cmFDbGFzc05hbWVzPzogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVGVybXMgdGhhdCBuZWVkIGFncmVlbWVudFwiLCBwb2xpY2llc0FuZFNlcnZpY2VQYWlycyk7XG4gICAgICAgIGNvbnN0IFRlcm1zRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuVGVybXNEaWFsb2dcIik7XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVGVybXMgb2YgU2VydmljZScsICcnLCBUZXJtc0RpYWxvZywge1xuICAgICAgICAgICAgcG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMsXG4gICAgICAgICAgICBhZ3JlZWRVcmxzLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKGRvbmUsIGFncmVlZFVybHMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBUZXJtc05vdFNpZ25lZEVycm9yKCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoYWdyZWVkVXJscyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCBjbGFzc05hbWVzKFwibXhfVGVybXNEaWFsb2dcIiwgZXh0cmFDbGFzc05hbWVzKSk7XG4gICAgfSk7XG59XG4iXX0=