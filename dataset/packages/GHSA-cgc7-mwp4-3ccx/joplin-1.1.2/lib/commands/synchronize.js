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
const CommandService_1 = require("../services/CommandService");
const { _ } = require('lib/locale');
const { reg } = require('lib/registry.js');
exports.declaration = {
    name: 'synchronize',
    label: () => _('Synchronise'),
    iconName: 'fa-sync-alt',
};
exports.runtime = () => {
    return {
        execute: ({ syncStarted }) => __awaiter(void 0, void 0, void 0, function* () {
            const action = syncStarted ? 'cancel' : 'start';
            if (!(yield reg.syncTarget().isAuthenticated())) {
                if (reg.syncTarget().authRouteName()) {
                    CommandService_1.utils.store.dispatch({
                        type: 'NAV_GO',
                        routeName: reg.syncTarget().authRouteName(),
                    });
                    return 'auth';
                }
                reg.logger().info('Not authentified with sync target - please check your credential.');
                return 'error';
            }
            let sync = null;
            try {
                sync = yield reg.syncTarget().synchronizer();
            }
            catch (error) {
                reg.logger().info('Could not acquire synchroniser:');
                reg.logger().info(error);
                return 'error';
            }
            if (action == 'cancel') {
                sync.cancel();
                return 'cancel';
            }
            else {
                reg.scheduleSync(0);
                return 'sync';
            }
        }),
        isEnabled: (props) => {
            return !props.syncStarted;
        },
        mapStateToProps: (state) => {
            return {
                syncStarted: state.syncStarted,
            };
        },
    };
};
//# sourceMappingURL=synchronize.js.map