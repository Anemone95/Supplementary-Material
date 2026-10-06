"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientFactory = void 0;
const logging_1 = __importDefault(require("./logging"));
// from the js-sdk
const loglevel_1 = __importDefault(require("loglevel"));
class ClientFactory {
    constructor(opts = {}) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.clients = {};
        this.url = "";
        this.token = "";
        this.botUserId = "";
        this.sdk = opts.sdk || require("matrix-js-sdk");
        this.configure(opts.url || "", opts.token || "", opts.appServiceUserId || "");
    }
    /**
     * Set a function to be called when logging requests and responses.
     * @param func The function to invoke. The first arg is the string to
     * log. The second arg is a boolean which is 'true' if the log is an error.
     */
    setLogFunction(func) {
        if (!func) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.sdk.wrapRequest((origRequest, opts, callback) => {
            var _a;
            // It's too spammy
            const shouldLog = !((_a = opts.uri) === null || _a === void 0 ? void 0 : _a.endsWith("/sync"));
            const logPrefix = ((opts._matrix_opts && opts._matrix_opts._reqId ?
                "[" + opts._matrix_opts._reqId + "] " : "") +
                opts.method + " " + opts.uri + " " +
                (opts.qs.user_id ? "(" + opts.qs.user_id + ")" : "(AS)"));
            // Request logging
            if (shouldLog) {
                func(logPrefix + " Body: " +
                    (opts.body ? JSON.stringify(opts.body).substring(0, 80) : ""));
            }
            // Make the request
            origRequest(opts, function (err, response, body) {
                // Response logging
                const httpCode = response ? response.statusCode : null;
                const responsePrefix = logPrefix + " HTTP " + httpCode;
                if (!shouldLog) {
                    callback(err, response, body);
                    return;
                }
                if (err) {
                    func(responsePrefix + " Error: " + JSON.stringify(err), true);
                }
                else if (httpCode && (httpCode >= 300 || httpCode < 200)) {
                    func(responsePrefix + " Error: " + JSON.stringify(body), true);
                }
                else {
                    func(// body may be large, so do first 80 chars
                    responsePrefix + " " +
                        JSON.stringify(body).substring(0, 80));
                }
                // Invoke the callback
                callback(err, response, body);
            });
        });
        // matrix-js-sdk uses the `loglevel` logging library for its logging
        // but the only way to get it to log to winston is to modify the
        // global methodFactory.
        loglevel_1.default.methodFactory = (methodName, _logLevel, loggerName) => {
            return (...args) => {
                const loggerInstance = logging_1.default.get(`js-sdk:${String(loggerName)}`);
                if (methodName === "debug" ||
                    methodName == "warn" || methodName === "error") {
                    loggerInstance[methodName](...args);
                }
                else {
                    loggerInstance.debug(...args);
                }
            };
        };
        // Set the factory on the default instance.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const loggerInstance = require("matrix-js-sdk/lib/logger").logger;
        loggerInstance.methodFactory = loglevel_1.default.methodFactory;
        // Ensure these functions use winston
        loggerInstance.info = loglevel_1.default.methodFactory("info", 1, "matrix");
        loggerInstance.warn = loglevel_1.default.methodFactory("warn", 1, "matrix");
        loggerInstance.debug = loglevel_1.default.methodFactory("debug", 1, "matrix");
        loggerInstance.error = loglevel_1.default.methodFactory("error", 1, "matrix");
        loggerInstance.trace = loglevel_1.default.methodFactory("trace", 1, "matrix");
        loggerInstance.log = loglevel_1.default.methodFactory("debug", 1, "matrix");
    }
    /**
     * Construct a new Matrix JS SDK Client. Calling this twice with the same args
     * will return the *same* client instance.
     * @param userId The user_id to scope the client to. A new
     * client will be created per user ID. If this is null, a client scoped to the
     * application service *itself* will be created.
     * @param request The request ID to additionally scope the
     * client to. If set, this will create a new client per user ID / request combo.
     * This factory will dispose the created client instance when the request is
     * resolved.
     */
    getClientAs(userId, request, urlOverride, usingE2E = false) {
        const reqId = request ? request.getId() : "-";
        const userIdKey = userId || "bot";
        // see if there is an existing match
        let client = this._getClient(reqId, userIdKey);
        if (client) {
            return client;
        }
        // create a new client
        const queryParams = {};
        if (userId) {
            queryParams.user_id = userId;
        }
        // force set access_token= so it is used when /register'ing
        queryParams.access_token = this.token;
        const clientOpts = {
            accessToken: this.token,
            baseUrl: urlOverride || this.url,
            userId: userId || this.botUserId,
            queryParams: queryParams,
            scheduler: this.clientSchedulerBuilder ? this.clientSchedulerBuilder() : undefined,
            usingExternalCrypto: usingE2E,
            localTimeoutMs: 1000 * 60 * 2,
        };
        client = this.sdk.createClient(clientOpts);
        client._http.opts._reqId = reqId; // FIXME gut wrenching
        // add a listener for the completion of this request so we can cleanup
        // the clients we've made
        if (request) {
            request.getPromise().finally(() => {
                delete this.clients[reqId];
            });
        }
        // store the new client
        if (!this.clients[reqId]) {
            this.clients[reqId] = {};
        }
        this.clients[reqId][userIdKey] = client;
        return client;
    }
    /**
     * Configure the factory for generating clients.
     * @param baseUrl The base URL to create clients with.
     * @param appServiceToken The AS token to use as the access_token
     * @param appServiceUserId The AS's user_id
     */
    configure(baseUrl, appServiceToken, appServiceUserId) {
        this.url = baseUrl;
        this.token = appServiceToken;
        this.botUserId = appServiceUserId;
    }
    _getClient(reqId, userId) {
        if (this.clients[reqId] && this.clients[reqId][userId]) {
            return this.clients[reqId][userId];
        }
        return null;
    }
}
exports.ClientFactory = ClientFactory;
//# sourceMappingURL=client-factory.js.map