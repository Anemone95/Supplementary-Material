"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const MigrationHandler_1 = require("lib/services/synchronizer/MigrationHandler");
const Setting = require('lib/models/Setting');
const { reg } = require('lib/registry');
function useSyncTargetUpgrade() {
    const [upgradeResult, setUpgradeResult] = react_1.useState({
        done: false,
        error: null,
    });
    function upgradeSyncTarget() {
        return __awaiter(this, void 0, void 0, function* () {
            reg.logger().info('useSyncTargetUpgrade: Starting process...');
            let error = null;
            try {
                reg.logger().info('useSyncTargetUpgrade: Acquire synchronizer...');
                const synchronizer = yield reg.syncTarget().synchronizer();
                reg.logger().info('useSyncTargetUpgrade: Create migration handler...');
                const migrationHandler = new MigrationHandler_1.default(synchronizer.api(), synchronizer.lockHandler(), Setting.value('appType'), Setting.value('clientId'));
                reg.logger().info('useSyncTargetUpgrade: Start upgrade...');
                yield migrationHandler.upgrade();
            }
            catch (e) {
                error = e;
            }
            reg.logger().info('useSyncTargetUpgrade: Error:', error);
            if (!error) {
                Setting.setValue('sync.upgradeState', Setting.SYNC_UPGRADE_STATE_IDLE);
                yield Setting.saveAll();
            }
            setUpgradeResult({
                done: true,
                error: error,
            });
        });
    }
    react_1.useEffect(function () {
        upgradeSyncTarget();
    }, []);
    return upgradeResult;
}
exports.default = useSyncTargetUpgrade;
//# sourceMappingURL=useSyncTargetUpgrade.js.map