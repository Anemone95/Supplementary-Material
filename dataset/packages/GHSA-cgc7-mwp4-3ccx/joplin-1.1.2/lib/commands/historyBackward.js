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
    name: 'historyBackward',
    label: () => _('Back'),
    iconName: 'fa-arrow-left',
};
exports.runtime = () => {
    return {
        execute: (props) => __awaiter(void 0, void 0, void 0, function* () {
            if (!props.backwardHistoryNotes.length)
                return;
            CommandService_1.utils.store.dispatch({
                type: 'HISTORY_BACKWARD',
            });
        }),
        isEnabled: (props) => {
            return props.backwardHistoryNotes.length > 0;
        },
        mapStateToProps: (state) => {
            return { backwardHistoryNotes: state.backwardHistoryNotes };
        },
    };
};
//# sourceMappingURL=historyBackward.js.map