"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeInfoStateSyncer = void 0;
const logging_1 = __importDefault(require("./logging"));
const p_queue_1 = __importDefault(require("p-queue"));
const log = logging_1.default.get("BridgeStateSyncer");
/**
 * This class ensures that rooms contain a valid bridge info
 * event ([MSC2346](https://github.com/matrix-org/matrix-doc/pull/2346))
 * which displays the connected protocol, network and room.
 */
class BridgeInfoStateSyncer {
    constructor(bridge, opts) {
        this.bridge = bridge;
        this.opts = opts;
    }
    /**
     * Check all rooms and ensure they have correct state.
     * @param allMappings All bridged room mappings
     * @param concurrency How many rooms to handle at a time, defaults to 3.
     */
    async initialSync(allMappings, concurrency = 3) {
        log.info("Beginning sync of bridge state events");
        const syncQueue = new p_queue_1.default({ concurrency });
        Object.entries(allMappings).forEach(([roomId, mappings]) => {
            syncQueue.add(() => this.syncRoom(roomId, mappings));
        });
        return syncQueue.onIdle();
    }
    async syncRoom(roomId, mappings) {
        log.info(`Syncing ${roomId}`);
        const intent = this.bridge.getIntent();
        for (const mappingInfo of mappings) {
            const realMapping = await this.opts.getMapping(roomId, mappingInfo);
            const key = this.createStateKey(realMapping);
            const content = this.createBridgeInfoContent(realMapping);
            try {
                const eventData = await intent.getStateEvent(roomId, BridgeInfoStateSyncer.EventType, key, true);
                if (eventData !== null) { // If found, validate.
                    if (JSON.stringify(eventData) === JSON.stringify(content)) {
                        continue;
                    }
                    log.debug(`${key} for ${roomId} is invalid, updating`);
                }
            }
            catch (ex) {
                log.warn(`Encountered error when trying to sync ${roomId}`);
                break; // To be on the safe side, do not retry this room.
            }
            // Event wasn't found or was invalid, let's try setting one.
            const eventContent = this.createBridgeInfoContent(realMapping);
            try {
                await intent.sendStateEvent(roomId, BridgeInfoStateSyncer.EventType, key, eventContent);
            }
            catch (ex) {
                log.error(`Failed to update room with new state content: ${ex.message}`);
            }
        }
    }
    async createInitialState(roomId, bridgeMappingInfo) {
        const mapping = await this.opts.getMapping(roomId, bridgeMappingInfo);
        return {
            type: BridgeInfoStateSyncer.EventType,
            content: this.createBridgeInfoContent(mapping),
            state_key: this.createStateKey(mapping),
        };
    }
    createStateKey(mapping) {
        var _a;
        const networkId = mapping.network ? ((_a = mapping.network) === null || _a === void 0 ? void 0 : _a.id.replace(/\//g, "%2F")) + "/" : "";
        const channel = mapping.channel.id.replace(/\//g, "%2F");
        return `${this.opts.bridgeName}:/${networkId}${channel}`;
    }
    createBridgeInfoContent(mapping) {
        const content = {
            bridgebot: this.bridge.botUserId,
            protocol: mapping.protocol,
            channel: mapping.channel,
        };
        if (mapping.creator) {
            content.creator = mapping.creator;
        }
        if (mapping.network) {
            content.network = mapping.network;
        }
        return content;
    }
}
exports.BridgeInfoStateSyncer = BridgeInfoStateSyncer;
BridgeInfoStateSyncer.EventType = "uk.half-shot.bridge";
//# sourceMappingURL=bridge-info-state.js.map