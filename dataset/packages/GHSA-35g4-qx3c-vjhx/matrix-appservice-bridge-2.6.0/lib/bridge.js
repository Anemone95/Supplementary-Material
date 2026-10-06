"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = exports.BRIDGE_PING_TIMEOUT_MS = exports.BRIDGE_PING_EVENT_TYPE = void 0;
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
const nedb_1 = __importDefault(require("nedb"));
const fs_1 = require("fs");
const util = __importStar(require("util"));
const js_yaml_1 = __importDefault(require("js-yaml"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MatrixScheduler = require("matrix-js-sdk").MatrixScheduler;
const matrix_appservice_1 = require("matrix-appservice");
const bridge_context_1 = require("./components/bridge-context");
const client_factory_1 = require("./components/client-factory");
const app_service_bot_1 = require("./components/app-service-bot");
const request_factory_1 = require("./components/request-factory");
const intent_1 = require("./components/intent");
const room_bridge_store_1 = require("./components/room-bridge-store");
const user_bridge_store_1 = require("./components/user-bridge-store");
const event_bridge_store_1 = require("./components/event-bridge-store");
const matrix_1 = require("./models/users/matrix");
const matrix_2 = require("./models/rooms/matrix");
const prometheusmetrics_1 = require("./components/prometheusmetrics");
const membership_cache_1 = require("./components/membership-cache");
const room_link_validator_1 = require("./components/room-link-validator");
const room_upgrade_handler_1 = require("./components/room-upgrade-handler");
const event_queue_1 = require("./components/event-queue");
const logging = __importStar(require("./components/logging"));
const promiseutil_1 = require("./utils/promiseutil");
const errors_1 = require("./errors");
var BridgeInternalError = errors_1.unstable.BridgeInternalError;
var wrapError = errors_1.unstable.wrapError;
var EventNotHandledError = errors_1.unstable.EventNotHandledError;
const encryption_1 = require("./components/encryption");
const log = logging.get("bridge");
// The frequency at which we will check the list of accumulated Intent objects.
const INTENT_CULL_CHECK_PERIOD_MS = 1000 * 60; // once per minute
// How long a given Intent object can hang around unused for.
const INTENT_CULL_EVICT_AFTER_MS = 1000 * 60 * 15; // 15 minutes
exports.BRIDGE_PING_EVENT_TYPE = "org.matrix.bridge.ping";
exports.BRIDGE_PING_TIMEOUT_MS = 60000;
class Bridge {
    /**
     * @param opts Options to pass to the bridge
     * @param opts.roomUpgradeOpts Options to supply to
     * the room upgrade handler. If not defined then upgrades are NOT handled by the bridge.
     */
    constructor(opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.intentLastAccessedTimeout = null;
        if (typeof opts !== "object") {
            throw new Error("opts must be supplied.");
        }
        const required = [
            "homeserverUrl", "registration", "domain", "controller"
        ];
        const missingKeys = required.filter(k => !Object.keys(opts).includes(k));
        if (missingKeys.length) {
            throw new Error(`Missing '${missingKeys.join("', '")}' in opts.`);
        }
        if (typeof opts.controller.onEvent !== "function") {
            throw new Error("controller.onEvent is a required function");
        }
        this.opts = {
            ...opts,
            disableContext: opts.disableStores ? true : ((_a = opts.disableContext) !== null && _a !== void 0 ? _a : false),
            disableStores: (_b = opts.disableStores) !== null && _b !== void 0 ? _b : false,
            authenticateThirdpartyEndpoints: (_c = opts.authenticateThirdpartyEndpoints) !== null && _c !== void 0 ? _c : false,
            userStore: opts.userStore || "user-store.db",
            roomStore: opts.roomStore || "room-store.db",
            intentOptions: opts.intentOptions || {},
            queue: {
                type: ((_d = opts.queue) === null || _d === void 0 ? void 0 : _d.type) || "single",
                perRequest: (_f = (_e = opts.queue) === null || _e === void 0 ? void 0 : _e.perRequest) !== null && _f !== void 0 ? _f : false,
            },
            logRequestOutcome: (_g = opts.logRequestOutcome) !== null && _g !== void 0 ? _g : true,
            suppressEcho: (_h = opts.suppressEcho) !== null && _h !== void 0 ? _h : true,
        };
        this.queue = event_queue_1.EventQueue.create(this.opts.queue, this.onConsume.bind(this));
        // Default: logger -> log to console
        this.onLog = opts.controller.onLog || function (text, isError) {
            if (isError) {
                log.error(text);
                return;
            }
            log.info(text);
        };
        // we'll init these at runtime
        this.requestFactory = new request_factory_1.RequestFactory();
        this.intents = new Map();
        this.powerlevelMap = new Map();
        this.membershipCache = opts.membershipCache || new membership_cache_1.MembershipCache();
        this.intentBackingStore = {
            setMembership: this.membershipCache.setMemberEntry.bind(this.membershipCache),
            setPowerLevelContent: this.setPowerLevelEntry.bind(this),
            getMembership: this.membershipCache.getMemberEntry.bind(this.membershipCache),
            getMemberProfile: this.membershipCache.getMemberProfile.bind(this.membershipCache),
            getPowerLevelContent: this.getPowerLevelEntry.bind(this)
        };
        this.prevRequestPromise = Promise.resolve();
        if (this.opts.roomUpgradeOpts) {
            this.opts.roomUpgradeOpts.consumeEvent = this.opts.roomUpgradeOpts.consumeEvent !== false;
            if (this.opts.disableStores) {
                this.opts.roomUpgradeOpts.migrateStoreEntries = false;
            }
            this.roomUpgradeHandler = new room_upgrade_handler_1.RoomUpgradeHandler(this.opts.roomUpgradeOpts, this);
        }
    }
    get appService() {
        return this.appservice;
    }
    get botUserId() {
        if (!this.registration) {
            throw Error('Registration not defined yet');
        }
        return `@${this.registration.getSenderLocalpart()}:${this.opts.domain}`;
    }
    /**
     * Load the user and room databases. Access them via getUserStore() and getRoomStore().
     */
    async loadDatabases() {
        if (this.opts.disableStores) {
            return;
        }
        const storePromises = [];
        // Load up the databases if they provided file paths to them (or defaults)
        if (typeof this.opts.userStore === "string") {
            storePromises.push(loadDatabase(this.opts.userStore, user_bridge_store_1.UserBridgeStore));
        }
        else {
            storePromises.push(Promise.resolve(this.opts.userStore));
        }
        if (typeof this.opts.roomStore === "string") {
            storePromises.push(loadDatabase(this.opts.roomStore, room_bridge_store_1.RoomBridgeStore));
        }
        else {
            storePromises.push(Promise.resolve(this.opts.roomStore));
        }
        if (typeof this.opts.eventStore === "string") {
            storePromises.push(loadDatabase(this.opts.eventStore, event_bridge_store_1.EventBridgeStore));
        }
        else if (this.opts.eventStore) {
            storePromises.push(Promise.resolve(this.opts.eventStore));
        }
        // This works because if they provided a string we converted it to a Promise
        // which will be resolved when we have the db instance. If they provided a
        // db instance then this will resolve immediately.
        const [userStore, roomStore, eventStore] = await Promise.all(storePromises);
        this.userStore = userStore;
        this.roomStore = roomStore;
        this.eventStore = eventStore;
    }
    /**
     * Load registration, databases and initalise bridge components.
     *
     * **This must be called before `listen()`**
     */
    async initalise() {
        var _a;
        if (typeof this.opts.registration === "string") {
            const regObj = js_yaml_1.default.load(await fs_1.promises.readFile(this.opts.registration, 'utf8'));
            if (typeof regObj !== "object") {
                throw Error("Failed to parse registration file: yaml file did not parse to object");
            }
            const registration = matrix_appservice_1.AppServiceRegistration.fromObject(regObj);
            if (registration === null) {
                throw Error("Failed to parse registration file");
            }
            this.registration = registration;
        }
        else {
            this.registration = this.opts.registration;
        }
        const asToken = this.registration.getAppServiceToken();
        if (!asToken) {
            throw Error('No AS token provided, cannot create ClientFactory');
        }
        this.clientFactory = this.opts.clientFactory || new client_factory_1.ClientFactory({
            url: this.opts.homeserverUrl,
            token: asToken,
            appServiceUserId: this.botUserId,
            clientSchedulerBuilder: function () {
                return new MatrixScheduler(retryAlgorithm, queueAlgorithm);
            },
        });
        this.clientFactory.setLogFunction((text, isErr) => {
            this.onLog(text, isErr || false);
        });
        this.botClient = this.clientFactory.getClientAs();
        await this.checkHomeserverSupport();
        this.appServiceBot = new app_service_bot_1.AppServiceBot(this.botClient, this.registration, this.membershipCache);
        if (this.opts.bridgeEncryption) {
            this.eeEventBroker = new encryption_1.EncryptedEventBroker(this.membershipCache, this.appServiceBot, this.onEvent.bind(this), 
            // If the bridge supports pushEphemeral, don't use sync data.
            !this.registration.pushEphemeral ? this.onEphemeralEvent.bind(this) : undefined, this.getIntent.bind(this), this.opts.bridgeEncryption.store);
        }
        if (this.opts.roomLinkValidation !== undefined) {
            this.roomLinkValidator = new room_link_validator_1.RoomLinkValidator(this.opts.roomLinkValidation, this.appServiceBot);
        }
        this.requestFactory = new request_factory_1.RequestFactory();
        if (this.opts.logRequestOutcome) {
            this.requestFactory.addDefaultResolveCallback((req) => this.onLog("[" + req.getId() + "] SUCCESS (" + req.getDuration() + "ms)", false));
            this.requestFactory.addDefaultRejectCallback((req, err) => this.onLog("[" + req.getId() + "] FAILED (" + req.getDuration() + "ms) " +
                (err ? util.inspect(err) : ""), false));
        }
        const botIntentOpts = {
            registered: true,
            backingStore: this.intentBackingStore,
            ...(_a = this.opts.intentOptions) === null || _a === void 0 ? void 0 : _a.bot,
        };
        this.botIntent = new intent_1.Intent(this.botClient, this.botClient, botIntentOpts);
        this.setupIntentCulling();
        await this.loadDatabases();
    }
    /**
     * Setup a HTTP listener to handle appservice traffic.
     * **This must be called after .initalise()**
     * @param port The port to listen on.
     * @param appServiceInstance The AppService instance to attach to.
     * If not provided, one will be created.
     * @param hostname Optional hostname to bind to. (e.g. 0.0.0.0)
     */
    async listen(port, hostname = "0.0.0.0", backlog = 10, appServiceInstance) {
        if (!this.registration) {
            throw Error('initalise() not called, cannot listen');
        }
        const homeserverToken = this.registration.getHomeserverToken();
        if (!homeserverToken) {
            throw Error('No HS token provided, cannot create AppService');
        }
        this.appservice = appServiceInstance || new matrix_appservice_1.AppService({
            homeserverToken,
        });
        this.appservice.onUserQuery = (userId) => this.onUserQuery(userId);
        this.appservice.onAliasQuery = this.onAliasQuery.bind(this);
        this.appservice.on("event", async (event) => {
            let passthrough = true;
            const weakEvent = event;
            if (this.eeEventBroker) {
                passthrough = await this.eeEventBroker.onASEvent(weakEvent);
            }
            if (passthrough) {
                return this.onEvent(weakEvent);
            }
            return undefined;
        });
        this.appservice.on("ephemeral", async (event) => this.onEphemeralEvent(event));
        this.appservice.on("http-log", (line) => {
            this.onLog(line, false);
        });
        this.customiseAppservice();
        if (this.metrics) {
            this.metrics.addAppServicePath(this);
        }
        await this.appservice.listen(port, hostname, backlog);
    }
    /**
     * Run the bridge (start listening). This calls `initalise()` and `listen()`.
     * @deprecated Prefer calling initalise and listen seperately.
     * @param port The port to listen on.
     * @param config Configuration options. NOT USED
     * @param appServiceInstance The AppService instance to attach to.
     * If not provided, one will be created.
     * @param hostname Optional hostname to bind to. (e.g. 0.0.0.0)
     * @return A promise resolving when the bridge is ready
     */
    async run(port, config, appServiceInstance, hostname = "0.0.0.0", backlog = 10) {
        await this.initalise();
        await this.listen(port, hostname, backlog, appServiceInstance);
    }
    /**
     * Apply any customisations required on the appService object.
     */
    customiseAppservice() {
        this.customiseAppserviceThirdPartyLookup();
        if (this.opts.roomLinkValidation && this.opts.roomLinkValidation.triggerEndpoint) {
            this.addAppServicePath({
                method: "POST",
                path: "/_bridge/roomLinkValidator/reload",
                handler: (req, res) => {
                    var _a;
                    try {
                        // Will use filename if provided, or the config
                        // one otherwised.
                        if (this.roomLinkValidator) {
                            (_a = this.roomLinkValidator) === null || _a === void 0 ? void 0 : _a.readRuleFile(req.query.filename);
                            res.status(200).send("Success");
                        }
                        else {
                            res.status(404).send("RoomLinkValidator not in use");
                        }
                    }
                    catch (e) {
                        res.status(500).send("Failed: " + e);
                    }
                },
            });
        }
    }
    // Set a timer going which will periodically remove Intent objects to prevent
    // them from accumulating too much. Removal is based on access time (calls to
    // getIntent). Intents expire after `INTENT_CULL_EVICT_AFTER_MS` of not being called.
    setupIntentCulling() {
        if (this.intentLastAccessedTimeout) {
            clearTimeout(this.intentLastAccessedTimeout);
        }
        this.intentLastAccessedTimeout = setTimeout(() => {
            var _a;
            const now = Date.now();
            for (const [key, entry] of this.intents.entries()) {
                // Do not delete intents that sync.
                const lastAccess = now - entry.lastAccessed;
                if (lastAccess < INTENT_CULL_EVICT_AFTER_MS) {
                    // Intent is still in use.
                    continue;
                }
                if ((_a = this.eeEventBroker) === null || _a === void 0 ? void 0 : _a.shouldAvoidCull(entry.intent)) {
                    // Intent is syncing events for encrypted rooms
                    continue;
                }
                this.intents.delete(key);
            }
            this.intentLastAccessedTimeout = null;
            // repeat forever. We have no cancellation mechanism but we don't expect
            // Bridge objects to be continually recycled so this is fine.
            this.setupIntentCulling();
        }, INTENT_CULL_CHECK_PERIOD_MS);
    }
    customiseAppserviceThirdPartyLookup() {
        const lookupController = this.opts.controller.thirdPartyLookup;
        if (!lookupController) {
            // Nothing to do.
            return;
        }
        const protocols = lookupController.protocols || [];
        const respondErr = function (e, res) {
            if (e.code && e.err) {
                res.status(e.code).json({ error: e.err });
            }
            else {
                res.status(500).send("Failed: " + e);
            }
        };
        if (lookupController.getProtocol) {
            const getProtocolFunc = lookupController.getProtocol;
            this.addAppServicePath({
                method: "GET",
                path: "/_matrix/app/:version(v1|unstable)/thirdparty/protocol/:protocol",
                checkToken: this.opts.authenticateThirdpartyEndpoints,
                handler: async (req, res) => {
                    const protocol = req.params.protocol;
                    if (protocols.length && protocols.indexOf(protocol) === -1) {
                        res.status(404).json({ err: "Unknown 3PN protocol " + protocol });
                        return;
                    }
                    try {
                        const result = await getProtocolFunc(protocol);
                        res.status(200).json(result);
                    }
                    catch (ex) {
                        respondErr(ex, res);
                    }
                },
            });
        }
        if (lookupController.getLocation) {
            const getLocationFunc = lookupController.getLocation;
            this.addAppServicePath({
                method: "GET",
                path: "/_matrix/app/:version(v1|unstable)/thirdparty/location/:protocol",
                checkToken: this.opts.authenticateThirdpartyEndpoints,
                handler: async (req, res) => {
                    const protocol = req.params.protocol;
                    if (protocols.length && protocols.indexOf(protocol) === -1) {
                        res.status(404).json({ err: "Unknown 3PN protocol " + protocol });
                        return;
                    }
                    // Do not leak access token to function
                    delete req.query.access_token;
                    try {
                        const result = await getLocationFunc(protocol, req.query);
                        res.status(200).json(result);
                    }
                    catch (ex) {
                        respondErr(ex, res);
                    }
                },
            });
        }
        if (lookupController.parseLocation) {
            const parseLocationFunc = lookupController.parseLocation;
            this.addAppServicePath({
                method: "GET",
                path: "/_matrix/app/:version(v1|unstable)/thirdparty/location",
                checkToken: this.opts.authenticateThirdpartyEndpoints,
                handler: async (req, res) => {
                    const alias = req.query.alias;
                    if (!alias) {
                        res.status(400).send({ err: "Missing 'alias' parameter" });
                        return;
                    }
                    if (typeof alias !== "string") {
                        res.status(400).send({ err: "'alias' must be a string" });
                        return;
                    }
                    try {
                        const result = await parseLocationFunc(alias);
                        res.status(200).json(result);
                    }
                    catch (ex) {
                        respondErr(ex, res);
                    }
                },
            });
        }
        if (lookupController.getUser) {
            const getUserFunc = lookupController.getUser;
            this.addAppServicePath({
                method: "GET",
                path: "/_matrix/app/:version(v1|unstable)/thirdparty/user/:protocol",
                checkToken: this.opts.authenticateThirdpartyEndpoints,
                handler: async (req, res) => {
                    const protocol = req.params.protocol;
                    if (protocols.length && protocols.indexOf(protocol) === -1) {
                        res.status(404).json({ err: "Unknown 3PN protocol " + protocol });
                        return;
                    }
                    // Do not leak access token to function
                    delete req.query.access_token;
                    try {
                        const result = await getUserFunc(protocol, req.query);
                        res.status(200).json(result);
                    }
                    catch (ex) {
                        respondErr(ex, res);
                    }
                }
            });
        }
        if (lookupController.parseUser) {
            const parseUserFunc = lookupController.parseUser;
            this.addAppServicePath({
                method: "GET",
                path: "/_matrix/app/:version(v1|unstable)/thirdparty/user",
                checkToken: this.opts.authenticateThirdpartyEndpoints,
                handler: async (req, res) => {
                    const userid = req.query.userid;
                    if (!userid) {
                        res.status(400).send({ err: "Missing 'userid' parameter" });
                        return;
                    }
                    if (typeof userid !== "string") {
                        res.status(400).send({ err: "'userid' must be a string" });
                        return;
                    }
                    try {
                        const result = await parseUserFunc(userid);
                        res.status(200).json(result);
                    }
                    catch (ex) {
                        respondErr(ex, res);
                    }
                },
            });
        }
    }
    /**
     * Install a custom handler for an incoming HTTP API request. This allows
     * callers to add extra functionality, implement new APIs, etc...
     * @param opts Named options
     * @param opts.method The HTTP method name.
     * @param opts.path Path to the endpoint.
     * @param opts.checkToken Should the token be automatically checked. Defaults to true.
     * @param opts.handler Function to handle requests
     * to this endpoint.
     */
    addAppServicePath(opts) {
        if (!this.appservice) {
            throw Error('Cannot call addAppServicePath before calling .run()');
        }
        const app = this.appservice.expressApp;
        opts.checkToken = opts.checkToken !== undefined ? opts.checkToken : true;
        // TODO(paul): Consider more options:
        //   opts.versions - automatic version filtering and rejecting of
        //     unrecognised API versions
        // Consider automatic "/_matrix/app/:version(v1|unstable)" path prefix
        app[opts.method.toLowerCase()](opts.path, (req, res, ...args) => {
            if (opts.checkToken && !this.requestCheckToken(req)) {
                return res.status(403).send({
                    errcode: "M_FORBIDDEN",
                    error: "Bad token supplied,"
                });
            }
            return opts.handler(req, res, ...args);
        });
    }
    /**
     * Retrieve the connected room store instance.
     */
    getRoomStore() {
        return this.roomStore;
    }
    /**
     * Retrieve the connected user store instance.
     */
    getUserStore() {
        return this.userStore;
    }
    /**
     * Retrieve the connected event store instance, if one was configured.
     */
    getEventStore() {
        return this.eventStore;
    }
    /**
     * Retrieve the request factory used to create incoming requests.
     */
    getRequestFactory() {
        return this.requestFactory;
    }
    /**
     * Retrieve the matrix client factory used when sending matrix requests.
     */
    getClientFactory() {
        if (!this.clientFactory) {
            throw Error('Bridge is not ready');
        }
        return this.clientFactory;
    }
    /**
     * Get the AS bot instance.
     */
    getBot() {
        if (!this.appServiceBot) {
            throw Error('Bridge is not ready');
        }
        return this.appServiceBot;
    }
    /**
     * Determines whether a room should be provisoned based on
     * user provided rules and the room state. Will default to true
     * if no rules have been provided.
     * @param roomId The room to check.
     * @param cache Should the validator check its cache.
     * @returns resolves if can and rejects if it cannot.
     *          A status code is returned on both.
     */
    async canProvisionRoom(roomId, cache = true) {
        if (!this.roomLinkValidator) {
            return room_link_validator_1.RoomLinkValidatorStatus.PASSED;
        }
        return this.roomLinkValidator.validateRoom(roomId, cache);
    }
    getRoomLinkValidator() {
        return this.roomLinkValidator;
    }
    /**
     * Retrieve an Intent instance for the specified user ID. If no ID is given, an
     * instance for the bot itself is returned.
     * @param userId Optional. The user ID to get an Intent for.
     * @param request Optional. The request instance to tie the MatrixClient
     * instance to. Useful for logging contextual request IDs.
     * @return The intent instance
     */
    getIntent(userId, request) {
        var _a, _b;
        if (!this.clientFactory) {
            throw Error('Cannot call getIntent before calling .run()');
        }
        if (!userId) {
            if (!this.botIntent) {
                // This will be defined when .run is called.
                throw Error('Cannot call getIntent before calling .run()');
            }
            return this.botIntent;
        }
        else if (userId === this.botUserId) {
            if (!this.botIntent) {
                // This will be defined when .run is called.
                throw Error('Cannot call getIntent before calling .run()');
            }
            return this.botIntent;
        }
        if (this.opts.escapeUserIds === undefined || this.opts.escapeUserIds) {
            userId = new matrix_1.MatrixUser(userId).getId(); // Escape the ID
        }
        const key = userId + (request ? request.getId() : "");
        const existingIntent = this.intents.get(key);
        if (existingIntent) {
            existingIntent.lastAccessed = Date.now();
            return existingIntent.intent;
        }
        const client = this.clientFactory.getClientAs(userId, request, (_a = this.opts.bridgeEncryption) === null || _a === void 0 ? void 0 : _a.homeserverUrl, !!this.opts.bridgeEncryption);
        const clientIntentOpts = {
            backingStore: this.intentBackingStore,
            ...(_b = this.opts.intentOptions) === null || _b === void 0 ? void 0 : _b.clients,
        };
        clientIntentOpts.registered = this.membershipCache.isUserRegistered(userId);
        const encryptionOpts = this.opts.bridgeEncryption;
        if (encryptionOpts) {
            clientIntentOpts.encryption = {
                sessionPromise: encryptionOpts.store.getStoredSession(userId),
                sessionCreatedCallback: encryptionOpts.store.setStoredSession.bind(encryptionOpts.store),
                ensureClientSyncingCallback: async () => {
                    var _a;
                    return (_a = this.eeEventBroker) === null || _a === void 0 ? void 0 : _a.startSyncingUser(userId);
                },
            };
        }
        const intent = new intent_1.Intent(client, this.botClient, clientIntentOpts);
        this.intents.set(key, { intent, lastAccessed: Date.now() });
        return intent;
    }
    /**
     * Retrieve an Intent instance for the specified user ID localpart. This <i>must
     * be the complete user localpart</i>.
     * @param localpart The user ID localpart to get an Intent for.
     * @param request Optional. The request instance to tie the MatrixClient
     * instance to. Useful for logging contextual request IDs.
     * @return The intent instance
     */
    getIntentFromLocalpart(localpart, request) {
        return this.getIntent("@" + localpart + ":" + this.opts.domain, request);
    }
    /**
     * Provision a user on the homeserver.
     * @param matrixUser The virtual user to be provisioned.
     * @param provisionedUser Provisioning information.
     * @return Resolved when provisioned.
     */
    async provisionUser(matrixUser, provisionedUser) {
        if (!this.clientFactory) {
            throw Error('Cannot call getIntent before calling .run()');
        }
        await this.botClient.register(matrixUser.localpart);
        if (!this.opts.disableStores) {
            if (!this.userStore) {
                throw Error('Tried to call provisionUser before databases were loaded');
            }
            await this.userStore.setMatrixUser(matrixUser);
            if (provisionedUser === null || provisionedUser === void 0 ? void 0 : provisionedUser.remote) {
                await this.userStore.linkUsers(matrixUser, provisionedUser.remote);
            }
        }
        const userClient = await this.clientFactory.getClientAs(matrixUser.getId());
        if (provisionedUser === null || provisionedUser === void 0 ? void 0 : provisionedUser.name) {
            await userClient.setDisplayName(provisionedUser.name);
        }
        if (provisionedUser === null || provisionedUser === void 0 ? void 0 : provisionedUser.url) {
            await userClient.setAvatarUrl(provisionedUser.url);
        }
    }
    async onUserQuery(userId) {
        if (!this.opts.controller.onUserQuery) {
            return;
        }
        const matrixUser = new matrix_1.MatrixUser(userId);
        try {
            const provisionedUser = await this.opts.controller.onUserQuery(matrixUser);
            if (!provisionedUser) {
                log.warn(`Not provisioning user for ${userId}`);
                return;
            }
            await this.provisionUser(matrixUser, provisionedUser);
        }
        catch (ex) {
            log.error(`Failed _onUserQuery for ${userId}`, ex);
        }
    }
    async onAliasQuery(alias) {
        if (!this.opts.controller.onAliasQuery) {
            return;
        }
        if (!this.botIntent) {
            throw Error('botIntent is not ready yet');
        }
        const aliasLocalpart = alias.split(":")[0].substring(1);
        const provisionedRoom = await this.opts.controller.onAliasQuery(alias, aliasLocalpart);
        if (!provisionedRoom) {
            // Not provisioning room.
            throw Error("Not provisioning room for this alias");
        }
        let roomId = provisionedRoom.roomId;
        // If they didn't pass an existing `roomId` back,
        // we expect some `creationOpts` to create a new room
        if (!roomId) {
            // eslint-disable-next-line camelcase
            const createRoomResponse = await this.botClient.createRoom(provisionedRoom.creationOpts);
            roomId = createRoomResponse.room_id;
        }
        if (!this.opts.disableStores) {
            if (!this.roomStore) {
                throw Error("roomStore is not ready yet");
            }
            const matrixRoom = new matrix_2.MatrixRoom(roomId);
            const remoteRoom = provisionedRoom.remote;
            if (remoteRoom) {
                await this.roomStore.linkRooms(matrixRoom, remoteRoom, {});
            }
            else {
                // store the matrix room only
                await this.roomStore.setMatrixRoom(matrixRoom);
            }
        }
        if (this.opts.controller.onAliasQueried) {
            await this.opts.controller.onAliasQueried(alias, roomId);
        }
    }
    async onEphemeralEvent(event) {
        if (this.opts.controller.onEphemeralEvent) {
            const request = this.requestFactory.newRequest({ data: event });
            await this.opts.controller.onEphemeralEvent(request);
        }
    }
    // returns a Promise for the request linked to this event for testing.
    async onEvent(event) {
        var _a;
        if (!this.registration) {
            // Called before we were ready, which is probably impossible.
            return null;
        }
        if (((_a = this.selfPingDeferred) === null || _a === void 0 ? void 0 : _a.roomId) === event.room_id && event.sender === this.botUserId) {
            this.selfPingDeferred.defer.resolve();
            log.debug("Got self ping");
            return null;
        }
        const isCanonicalState = event.state_key === "";
        this.updateIntents(event);
        if (this.opts.suppressEcho &&
            (this.registration.isUserMatch(event.sender, true) ||
                event.sender === this.botUserId)) {
            return null;
        }
        if (this.roomUpgradeHandler && this.opts.roomUpgradeOpts && this.appServiceBot) {
            // m.room.tombstone is the event that signals a room upgrade.
            if (event.type === "m.room.tombstone" && isCanonicalState && this.roomUpgradeHandler) {
                // eslint-disable-next-line camelcase
                this.roomUpgradeHandler.onTombstone({ ...event, content: event.content });
                if (this.opts.roomUpgradeOpts.consumeEvent) {
                    return null;
                }
            }
            else if (event.type === "m.room.member" &&
                event.state_key === this.appServiceBot.getUserId() &&
                event.content.membership === "invite") {
                // A invite-only room that has been upgraded won't have been joinable,
                // so we are listening for any invites to the new room.
                const isUpgradeInvite = await this.roomUpgradeHandler.onInvite(event);
                if (isUpgradeInvite &&
                    this.opts.roomUpgradeOpts.consumeEvent) {
                    return null;
                }
            }
        }
        const request = this.requestFactory.newRequest({ data: event });
        const contextReady = this.getBridgeContext(event);
        const dataReady = contextReady.then(context => ({ request, context }));
        const dataReadyLimited = this.limited(dataReady);
        this.queue.push(event, dataReadyLimited);
        this.queue.consume();
        const reqPromise = request.getPromise();
        // We *must* return the result of the request.
        try {
            return await reqPromise;
        }
        catch (ex) {
            if (ex instanceof EventNotHandledError) {
                this.handleEventError(event, ex);
            }
            throw ex;
        }
    }
    /**
     * Restricts the promise according to the bridges `perRequest` setting.
     *
     * `perRequest` enabled:
     *     Returns a promise similar to `promise`, with the addition of it only
     *     resolving after `request`.
     * `perRequest` disabled:
     *     Returns the promise unchanged.
     */
    async limited(promise) {
        var _a;
        // queue.perRequest controls whether multiple request can be processed by
        // the bridge at once.
        if ((_a = this.opts.queue) === null || _a === void 0 ? void 0 : _a.perRequest) {
            const promiseLimited = (async () => {
                try {
                    // We don't care about the results
                    await this.prevRequestPromise;
                }
                finally {
                    return promise;
                }
            })();
            this.prevRequestPromise = promiseLimited;
            return promiseLimited;
        }
        return promise;
    }
    onConsume(err, data) {
        if (err) {
            // The data for the event could not be retrieved.
            this.onLog("onEvent failure: " + err, true);
            return;
        }
        this.opts.controller.onEvent(data.request, data.context);
    }
    // eslint-disable-next-line camelcase
    async getBridgeContext(event) {
        if (this.opts.disableContext) {
            return null;
        }
        if (!this.roomStore || !this.userStore) {
            throw Error('Cannot call getBridgeContext before loading databases');
        }
        const context = new bridge_context_1.BridgeContext({
            sender: event.sender,
            target: event.type === "m.room.member" ? event.state_key : undefined,
            room: event.room_id
        });
        return context.get(this.roomStore, this.userStore);
    }
    // eslint-disable-next-line camelcase
    handleEventError(event, error) {
        if (!this.botIntent) {
            throw Error('Cannot call handleEventError before calling .run()');
        }
        if (!(error instanceof EventNotHandledError)) {
            error = wrapError(error, BridgeInternalError);
        }
        // TODO[V02460@gmail.com]: Send via different means when the bridge bot is
        // unavailable. _MSC2162: Signaling Errors at Bridges_ will have details on
        // how this should be done.
        this.botIntent.unstableSignalBridgeError(event.room_id, event.event_id, this.opts.networkName, error.reason, this.getUserRegex());
    }
    /**
     * Returns a regex matching all users of the bridge.
     * @return Super regex composed of all user regexes.
     */
    getUserRegex() {
        var _a, _b, _c, _d;
        // Return empty array if registration isn't available yet.
        return ((_d = (_c = (_b = (_a = this.registration) === null || _a === void 0 ? void 0 : _a.getOutput()) === null || _b === void 0 ? void 0 : _b.namespaces) === null || _c === void 0 ? void 0 : _c.users) === null || _d === void 0 ? void 0 : _d.map(o => o.regex)) || [];
    }
    updateIntents(event) {
        if (event.type === "m.room.member" && event.state_key) {
            const content = event.content;
            const profile = {};
            if (content && content.displayname) {
                profile.displayname = content.displayname;
            }
            if (content && content.avatar_url) {
                profile.avatar_url = content.avatar_url;
            }
            this.membershipCache.setMemberEntry(event.room_id, event.state_key, content ? content.membership : null, profile);
        }
        else if (event.type === "m.room.power_levels") {
            const content = event.content;
            this.setPowerLevelEntry(event.room_id, content);
        }
    }
    setPowerLevelEntry(roomId, content) {
        this.powerlevelMap.set(roomId, content);
    }
    getPowerLevelEntry(roomId) {
        return this.powerlevelMap.get(roomId);
    }
    /**
     * Returns a PrometheusMetrics instance stored on the bridge, creating it first
     * if required. The instance will be registered with the HTTP server so it can
     * serve the "/metrics" page in the usual way.
     * The instance will automatically register the Matrix SDK metrics by calling
     * {PrometheusMetrics~registerMatrixSdkMetrics}.
     * @param {boolean} registerEndpoint Register the /metrics endpoint on the appservice HTTP server. Defaults to true.
     * @param {Registry?} registry Optionally provide an alternative registry for metrics.
     */
    getPrometheusMetrics(registerEndpoint = true, registry) {
        if (this.metrics) {
            return this.metrics;
        }
        const metrics = this.metrics = new prometheusmetrics_1.PrometheusMetrics(registry);
        metrics.registerMatrixSdkMetrics();
        // TODO(paul): register some bridge-wide standard ones here
        // In case we're called after .run()
        if (this.appService && registerEndpoint) {
            metrics.addAppServicePath(this);
        }
        return metrics;
    }
    /**
     * A convenient shortcut to calling registerBridgeGauges() on the
     * PrometheusMetrics instance directly. This version will supply the value of
     * the matrixGhosts field if the counter function did not return it, for
     * convenience.
     * @param {PrometheusMetrics~BridgeGaugesCallback} counterFunc A function that
     * when invoked returns the current counts of various items in the bridge.
     *
     * @example
     * bridge.registerBridgeGauges(() => {
     *     return {
     *         matrixRoomConfigs: Object.keys(this.matrixRooms).length,
     *         remoteRoomConfigs: Object.keys(this.remoteRooms).length,
     *
     *         remoteGhosts: Object.keys(this.remoteGhosts).length,
     *
     *         ...
     *     }
     * })
     */
    registerBridgeGauges(counterFunc) {
        this.getPrometheusMetrics().registerBridgeGauges(async () => {
            const counts = await counterFunc();
            if (counts.matrixGhosts !== undefined) {
                counts.matrixGhosts = Object.keys(this.intents.size).length;
            }
            return counts;
        });
    }
    /**
     * Check a express Request to see if it's correctly
     * authenticated (includes the hsToken). The query parameter `access_token`
     * and the `Authorization` header are checked.
     * @returns {Boolean} True if authenticated, False if not.
     */
    requestCheckToken(req) {
        if (!this.registration) {
            // Bridge isn't ready yet
            return false;
        }
        if (req.query.access_token !== this.registration.getHomeserverToken() &&
            req.get("authorization") !== `Bearer ${this.registration.getHomeserverToken()}`) {
            return false;
        }
        return true;
    }
    /**
     * Close the appservice HTTP listener, and clear all timeouts.
     * @returns Resolves when the appservice HTTP listener has stopped
     */
    async close() {
        if (this.intentLastAccessedTimeout) {
            clearTimeout(this.intentLastAccessedTimeout);
            this.intentLastAccessedTimeout = null;
        }
        if (this.appservice) {
            await this.appservice.close();
            this.appservice = undefined;
        }
        if (this.eeEventBroker) {
            this.eeEventBroker.close();
        }
    }
    async checkHomeserverSupport() {
        if (!this.botClient) {
            throw Error("botClient isn't ready yet");
        }
        // Min required version
        if (this.opts.bridgeEncryption) {
            // Ensure that we have support for /login
            const loginFlows = await this.botClient.loginFlows();
            if (!encryption_1.EncryptedEventBroker.supportsLoginFlow(loginFlows)) {
                throw Error('To enable support for encryption, your homeserver must support MSC2666');
            }
        }
    }
    /**
     * Check the homeserver -> appservice connection by
     * sending a ping event.
     * @param roomId The room to use as a ping check.
     * @param timeoutMs How long to wait for the ping attempt. Defaults to 60s.
     * @throws This will throw if another ping attempt is made, or if the request times out.
     * @returns The delay in milliseconds
     */
    async pingAppserviceRoute(roomId, timeoutMs = exports.BRIDGE_PING_TIMEOUT_MS) {
        if (!this.botIntent) {
            throw Error("botClient isn't ready yet");
        }
        const sentTs = Date.now();
        if (this.selfPingDeferred) {
            this.selfPingDeferred.defer.reject(new Error("Another ping request is being made. Cancelling this one."));
        }
        this.selfPingDeferred = {
            defer: promiseutil_1.defer(),
            roomId,
            timeout: setTimeout(() => {
                var _a;
                (_a = this.selfPingDeferred) === null || _a === void 0 ? void 0 : _a.defer.reject(new Error("Timeout waiting for ping event"));
            }, timeoutMs),
        };
        await this.botIntent.sendEvent(roomId, exports.BRIDGE_PING_EVENT_TYPE, {
            sentTs,
        });
        await this.selfPingDeferred.defer.promise;
        clearTimeout(this.selfPingDeferred.timeout);
        return Date.now() - sentTs;
    }
}
exports.Bridge = Bridge;
function loadDatabase(path, Cls) {
    const defer = promiseutil_1.defer();
    const db = new nedb_1.default({
        filename: path,
        autoload: true,
        onload: function (err) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve(new Cls(db));
            }
        }
    });
    return defer.promise;
}
function retryAlgorithm(event, attempts, err) {
    var _a;
    if (err.httpStatus === 400 || err.httpStatus === 403 || err.httpStatus === 401) {
        // client error; no amount of retrying will save you now.
        return -1;
    }
    // we ship with browser-request which returns { cors: rejected } when trying
    // with no connection, so if we match that, give up since they have no conn.
    if (err.cors === "rejected") {
        return -1;
    }
    if (err.name === "M_LIMIT_EXCEEDED") {
        const waitTime = (_a = err.data) === null || _a === void 0 ? void 0 : _a.retry_after_ms;
        if (waitTime) {
            return waitTime;
        }
    }
    if (attempts > 4) {
        return -1; // give up
    }
    return 1000 + (1000 * attempts);
}
function queueAlgorithm(event) {
    if (event.getType() === "m.room.message") {
        // use a separate queue for each room ID
        return "message_" + event.getRoomId();
    }
    // allow all other events continue concurrently.
    return null;
}
//# sourceMappingURL=bridge.js.map