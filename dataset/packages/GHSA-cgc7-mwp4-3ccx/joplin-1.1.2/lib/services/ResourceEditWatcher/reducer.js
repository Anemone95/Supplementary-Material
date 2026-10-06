"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = require("immer");
exports.defaultState = {
    watchedResources: {},
};
immer_1.setAutoFreeze(false); // TODO: REMOVE ONCE PLUGIN BRANCH HAS BEEN MERGED!!
const reducer = immer_1.default((draft, action) => {
    if (action.type.indexOf('RESOURCE_EDIT_WATCHER_') !== 0)
        return;
    try {
        switch (action.type) {
            case 'RESOURCE_EDIT_WATCHER_SET':
                draft.watchedResources[action.id] = {
                    id: action.id,
                    title: action.title,
                };
                break;
            case 'RESOURCE_EDIT_WATCHER_REMOVE':
                delete draft.watchedResources[action.id];
                break;
            case 'RESOURCE_EDIT_WATCHER_CLEAR':
                draft.watchedResources = {};
                break;
        }
    }
    catch (error) {
        error.message = `In plugin reducer: ${error.message} Action: ${JSON.stringify(action)}`;
        throw error;
    }
});
exports.default = reducer;
//# sourceMappingURL=reducer.js.map