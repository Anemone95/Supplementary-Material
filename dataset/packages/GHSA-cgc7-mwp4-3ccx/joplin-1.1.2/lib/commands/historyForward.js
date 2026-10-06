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
exports.declaration = {
    name: 'historyForward',
    label: () => _('Forward'),
    iconName: 'fa-arrow-right',
};
exports.runtime = () => {
    return {
        execute: (props) => __awaiter(void 0, void 0, void 0, function* () {
            if (!props.forwardHistoryNotes.length)
                return;
            CommandService_1.utils.store.dispatch({
                type: 'HISTORY_FORWARD',
            });
        }),
        isEnabled: (props) => {
            return props.forwardHistoryNotes.length > 0;
        },
        mapStateToProps: (state) => {
            return { forwardHistoryNotes: state.forwardHistoryNotes };
        },
    };
};
//# sourceMappingURL=historyForward.js.map