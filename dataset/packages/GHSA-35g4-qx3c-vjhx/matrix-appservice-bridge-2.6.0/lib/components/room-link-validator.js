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
exports.RoomLinkValidatorStatus = exports.RoomLinkValidator = void 0;
/**
 * The room link validator is used to determine if a room can be bridged.
 */
const util_1 = __importDefault(require("util"));
const config_validator_1 = require("./config-validator");
const logging_1 = __importDefault(require("./logging"));
const log = logging_1.default.get("room-link-validator");
const VALIDATION_CACHE_LIFETIME = 30 * 60 * 1000;
const RULE_SCHEMA = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: "object",
    properties: {
        userIds: {
            type: "object",
            properties: {
                exempt: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },
                conflict: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }
            }
        }
    }
};
const VALIDATOR = new config_validator_1.ConfigValidator(RULE_SCHEMA);
/**
 * The RoomLinkValidator checks if a room should be linked to a remote
 * channel, given a set of rules supplied in a config. The ruleset is maintained
 * in a separate config from the bridge config. It can be reloaded by triggering
 * an endpoint specified in the {@link Bridge} class.
 */
class RoomLinkValidator {
    /**
     * @param config Config for the validator.
     * @param config.ruleFile Filename for the rule file.
     * @param config.rules Rules if not using a rule file, will be
     *                               overwritten if both is set.
     * @param asBot The AS bot.
     */
    constructor(config, asBot) {
        this.asBot = asBot;
        this.conflictCache = new Map();
        if (config.ruleFile) {
            this.ruleFile = config.ruleFile;
            this.rules = this.readRuleFile();
        }
        else if (config.rules) {
            this.rules = this.evaluateRules(config.rules);
        }
        else {
            throw new Error("Either config.ruleFile or config.rules must be set");
        }
    }
    readRuleFile(filename) {
        filename = filename || this.ruleFile;
        if (!filename) {
            throw new Error("No filename given and config is not using a file");
        }
        log.info(`Detected rule config change...`);
        const rules = VALIDATOR.validate(filename);
        if (rules === undefined) {
            throw Error("Rule file contents was undefined");
        }
        log.info(`Rule file ok, checking rules...`);
        const evaluatedRules = this.evaluateRules(rules);
        log.info(`Applied new ruleset`);
        this.conflictCache.clear();
        return evaluatedRules;
    }
    evaluateRules(rules) {
        const newRules = {
            userIds: {
                conflict: [],
                exempt: [],
            }
        };
        const vettedRules = (rules && typeof rules === "object") ? rules : {};
        const vettedUserIds = (vettedRules.userIds && typeof vettedRules.userIds === "object") ? vettedRules.userIds : {};
        if (Array.isArray(vettedUserIds.conflict)) {
            vettedUserIds.conflict.forEach((regexStr) => {
                if (typeof regexStr !== 'string' || util_1.default.types.isRegExp(regexStr)) {
                    log.warn(`All elements in userIds.conflict must be strings. Found ${typeof regexStr}.`);
                    return;
                }
                newRules.userIds.conflict.push(RegExp(regexStr));
            });
        }
        if (Array.isArray(vettedUserIds.exempt)) {
            vettedUserIds.exempt.forEach((regexStr) => {
                if (typeof regexStr !== 'string' || util_1.default.types.isRegExp(regexStr)) {
                    log.warn(`All elements in userIds.exempt must be strings. Found ${typeof regexStr}.`);
                    return;
                }
                newRules.userIds.exempt.push(RegExp(regexStr));
            });
        }
        return newRules;
    }
    async validateRoom(roomId, cache = true) {
        const status = cache ? this.checkConflictCache(roomId) : undefined;
        if (status !== undefined) {
            throw status;
        }
        // Get all users in the room.
        const joined = await this.asBot.getJoinedMembers(roomId);
        let isValid = true;
        for (const userId of Object.keys(joined)) {
            const ignoreUser = this.rules.userIds.exempt.some(rule => rule.test(userId));
            if (ignoreUser) {
                continue;
            }
            const hasConflict = this.rules.userIds.conflict.some(rule => rule.test(userId));
            if (hasConflict) {
                isValid = false;
            }
        }
        if (isValid) {
            return RoomLinkValidatorStatus.PASSED;
        }
        this.conflictCache.set(roomId, Date.now());
        throw RoomLinkValidatorStatus.ERROR_USER_CONFLICT;
    }
    checkConflictCache(roomId) {
        const cacheTime = this.conflictCache.get(roomId);
        if (!cacheTime) {
            return undefined;
        }
        if (cacheTime > (Date.now() - VALIDATION_CACHE_LIFETIME)) {
            return RoomLinkValidatorStatus.ERROR_CACHED;
        }
        this.conflictCache.delete(roomId);
        return undefined;
    }
}
exports.RoomLinkValidator = RoomLinkValidator;
var RoomLinkValidatorStatus;
(function (RoomLinkValidatorStatus) {
    RoomLinkValidatorStatus[RoomLinkValidatorStatus["PASSED"] = 0] = "PASSED";
    RoomLinkValidatorStatus[RoomLinkValidatorStatus["ERROR_USER_CONFLICT"] = 1] = "ERROR_USER_CONFLICT";
    RoomLinkValidatorStatus[RoomLinkValidatorStatus["ERROR_CACHED"] = 2] = "ERROR_CACHED";
    RoomLinkValidatorStatus[RoomLinkValidatorStatus["ERROR"] = 3] = "ERROR";
})(RoomLinkValidatorStatus = exports.RoomLinkValidatorStatus || (exports.RoomLinkValidatorStatus = {}));
//# sourceMappingURL=room-link-validator.js.map