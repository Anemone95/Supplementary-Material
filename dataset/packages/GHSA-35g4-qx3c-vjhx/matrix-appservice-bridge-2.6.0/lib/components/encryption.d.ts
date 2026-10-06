import { MembershipCache } from "./membership-cache";
import { AppServiceBot } from "./app-service-bot";
import { WeakEvent } from "./event-types";
import { EphemeralEvent } from "./event-types";
import { Intent } from "./intent";
export declare const APPSERVICE_LOGIN_TYPE = "uk.half-shot.msc2778.login.application_service";
export interface ClientEncryptionSession {
    userId: string;
    deviceId: string;
    accessToken: string;
    syncToken: string | null;
}
export interface ClientEncryptionStore {
    getStoredSession(userId: string): Promise<ClientEncryptionSession | null>;
    setStoredSession(session: ClientEncryptionSession): Promise<void>;
    updateSyncToken(userId: string, token: string): Promise<void>;
}
/**
 * The EncryptedEventBroker ensures that we provide a single encrypted
 * event to bridges from potentially multiple /sync responses. The broker
 * is also responsible for starting these syncs depending on which users
 * can read the room.
 *
 * More broadly speaking, the bridge handles encrypted events currently by
 * listening over the AS stream for encrypted messages, and then spinning
 * up a /sync in order to read the message. In order to decrypt them, we
 * proxy these requests through https://github.com/matrix-org/pantalaimon.
 *
 *   +-------------------+
 *   |  Homeserver       |
 *   +--------+----------+
 *           ^
 *           | Proxy
 *           |
 *           |
 *   +--------+----------+
 *   |  Pantalaimon      |
 *   +--------+----------+
 *           ^ /sync requests
 *           |
 *           |
 *   +--------+----------+
 *   |  Bridge           |
 *   +-------------------+
 *
 * We also gain things like presence, read receipts and typing for free.
 */
export declare class EncryptedEventBroker {
    private membership;
    private asBot;
    private onEvent;
    private onEphemeralEvent;
    private getIntent;
    private store;
    constructor(membership: MembershipCache, asBot: AppServiceBot, onEvent: (weakEvent: WeakEvent) => void, onEphemeralEvent: ((event: EphemeralEvent) => void) | undefined, getIntent: (userId: string) => Intent, store: ClientEncryptionStore);
    private receivedPresence;
    private presenceCleanupInterval;
    private handledEvents;
    private userForRoom;
    private eventsPendingSync;
    private eventsPendingAS;
    private syncingClients;
    /**
     * Called when the bridge gets an event through an appservice transaction.
     * @param event
     * @returns Should the event be passthrough
     */
    onASEvent(event: WeakEvent): Promise<boolean>;
    private onSyncEvent;
    private handleEvent;
    private onTyping;
    private onReceipt;
    private onPresence;
    private onSync;
    /**
     * Start a sync loop for a given bridge user
     * @param userId The user whos matrix client should start syncing
     */
    startSyncingUser(userId: string): Promise<void>;
    shouldAvoidCull(intent: Intent): boolean;
    /**
     * Stop syncing clients used for encryption
     */
    close(): void;
    static supportsLoginFlow(loginFlows: {
        flows: {
            type: string;
        }[];
    }): {
        type: string;
    } | undefined;
}
