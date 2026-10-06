import * as React from "react";
/**
 * Represents a tab for the TabbedView.
 */
export declare class Tab {
    id: string;
    label: string;
    icon: string;
    body: React.ReactNode;
    /**
     * Creates a new tab.
     * @param {string} id The tab's ID.
     * @param {string} label The untranslated tab label.
     * @param {string} icon The class for the tab icon. This should be a simple mask.
     * @param {React.ReactNode} body The JSX for the tab container.
     */
    constructor(id: string, label: string, icon: string, body: React.ReactNode);
}
interface IProps {
    tabs: Tab[];
    initialTabId?: string;
}
interface IState {
    activeTabIndex: number;
}
export default class TabbedView extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private _getActiveTabIndex;
    /**
     * Shows the given tab
     * @param {Tab} tab the tab to show
     * @private
     */
    private _setActiveTab;
    private _renderTabLabel;
    private _renderTabPanel;
    render(): React.ReactNode;
}
export {};
