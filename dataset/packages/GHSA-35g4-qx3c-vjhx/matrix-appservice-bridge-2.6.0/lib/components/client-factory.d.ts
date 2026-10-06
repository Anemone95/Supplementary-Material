import { Request } from "./request";
/**
 * @constructor
 * @param opts Options for this factory
 * @param opts.sdk The Matrix JS SDK require() to use.
 * @param opts.url The Client-Server base HTTP URL. This must be set
 * prior to calling getClientAs(). See configure() to set this after instantiation.
 * @param opts.token The application service token to use. This must
 * be set prior to calling getClientAs(). See configure() to set this after
 * instantiation.
 * @param opts.appServiceUserId The application service's user ID. Must
 * be set prior to calling getClientAs(). See configure() to set this after
 * instantiation.
 * @param opts.clientSchedulerBuilder A function that
 * returns a new client scheduler to use in place of the default event
 * scheduler that schedules events to be sent to the HS.
 */
interface ClientFactoryOpts {
    sdk?: any;
    url?: string;
    token?: string;
    appServiceUserId?: string;
    clientSchedulerBuilder?: () => unknown;
}
export declare class ClientFactory {
    private clients;
    private sdk;
    private clientSchedulerBuilder?;
    private url;
    private token;
    private botUserId;
    constructor(opts?: ClientFactoryOpts);
    /**
     * Set a function to be called when logging requests and responses.
     * @param func The function to invoke. The first arg is the string to
     * log. The second arg is a boolean which is 'true' if the log is an error.
     */
    setLogFunction(func: (msg: string, error?: boolean) => void): void;
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
    getClientAs(userId?: string, request?: Request<unknown>, urlOverride?: string, usingE2E?: boolean): any;
    /**
     * Configure the factory for generating clients.
     * @param baseUrl The base URL to create clients with.
     * @param appServiceToken The AS token to use as the access_token
     * @param appServiceUserId The AS's user_id
     */
    configure(baseUrl: string, appServiceToken: string, appServiceUserId: string): void;
    private _getClient;
}
export {};
