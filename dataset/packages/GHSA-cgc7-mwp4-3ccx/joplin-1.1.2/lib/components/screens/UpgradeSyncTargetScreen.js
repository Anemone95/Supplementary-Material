"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_native_1 = require("react-native");
const useSyncTargetUpgrade_1 = require("lib/services/synchronizer/gui/useSyncTargetUpgrade");
const { connect } = require('react-redux');
const { themeStyle } = require('lib/components/global-style.js');
const { ScreenHeader } = require('lib/components/screen-header.js');
const { _ } = require('lib/locale.js');
function UpgradeSyncTargetScreen(props) {
    const upgradeResult = useSyncTargetUpgrade_1.default();
    const theme = themeStyle(props.theme);
    const lineStyle = Object.assign(Object.assign({}, theme.normalText), { marginBottom: 20 });
    const stackTraceStyle = Object.assign(Object.assign({}, theme.normalText), { flexWrap: 'nowrap', fontSize: theme.fontSize * 0.5, color: theme.colorFaded });
    const headerStyle = Object.assign(Object.assign({}, theme.headerStyle), { marginBottom: 20 });
    function renderUpgradeError() {
        if (!upgradeResult.error)
            return null;
        return (React.createElement(react_native_1.View, { style: { backgroundColor: theme.backgroundColor, flex: 1, flexDirection: 'column' } },
            React.createElement(react_native_1.Text, { style: headerStyle }, "Error"),
            React.createElement(react_native_1.Text, { style: lineStyle }, "The sync target could not be upgraded due to an error. For support, please copy the content of this page and paste it in the forum: https://discourse.joplinapp.org/"),
            React.createElement(react_native_1.Text, { style: lineStyle }, "The full error was:"),
            React.createElement(react_native_1.Text, { style: lineStyle }, upgradeResult.error.message),
            React.createElement(react_native_1.Text, { style: stackTraceStyle }, upgradeResult.error.stack)));
    }
    function renderInProgress() {
        if (upgradeResult.error || upgradeResult.done)
            return null;
        return (React.createElement(react_native_1.View, null,
            React.createElement(react_native_1.Text, { style: headerStyle }, "Joplin upgrade in progress..."),
            React.createElement(react_native_1.Text, { style: lineStyle }, "Please wait while the sync target is being upgraded. It may take a few seconds or a few minutes depending on the upgrade."),
            React.createElement(react_native_1.Text, { style: lineStyle }, "Make sure you leave your device on and the app opened while the upgrade is in progress.")));
    }
    function renderDone() {
        if (upgradeResult.error || !upgradeResult.done)
            return null;
        return (React.createElement(react_native_1.View, null,
            React.createElement(react_native_1.Text, { style: headerStyle }, "Upgrade complete"),
            React.createElement(react_native_1.Text, { style: lineStyle }, "The upgrade has been applied successfully. Please press Back to exit this screen.")));
    }
    return (React.createElement(react_native_1.ScrollView, { style: { flex: 1, flexDirection: 'column', backgroundColor: theme.backgroundColor } },
        React.createElement(ScreenHeader, { title: _('Sync Target Upgrade'), parentComponent: this, showShouldUpgradeSyncTargetMessage: false, showSearchButton: false, showBackButton: upgradeResult.done }),
        React.createElement(react_native_1.View, { style: { padding: 15, flex: 1 } },
            renderInProgress(),
            renderDone(),
            renderUpgradeError())));
}
exports.default = connect((state) => {
    return {
        theme: state.settings.theme,
    };
})(UpgradeSyncTargetScreen);
//# sourceMappingURL=UpgradeSyncTargetScreen.js.map