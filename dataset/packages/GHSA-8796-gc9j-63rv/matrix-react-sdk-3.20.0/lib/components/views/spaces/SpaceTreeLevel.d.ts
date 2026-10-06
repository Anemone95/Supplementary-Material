import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IItemProps {
    space?: Room;
    activeSpaces: Room[];
    isNested?: boolean;
    isPanelCollapsed?: boolean;
    onExpand?: Function;
    parents?: Set<string>;
}
interface IItemState {
    collapsed: boolean;
    contextMenuPosition: Pick<DOMRect, "right" | "top" | "height">;
}
export declare class SpaceItem extends React.PureComponent<IItemProps, IItemState> {
    static contextType: React.Context<any>;
    constructor(props: any);
    private toggleCollapse;
    private onContextMenu;
    private onClick;
    private onMenuOpenClick;
    private onMenuClose;
    private onInviteClick;
    private onSettingsClick;
    private onLeaveClick;
    private onNewRoomClick;
    private onAddExistingRoomClick;
    private onMembersClick;
    private onExploreRoomsClick;
    private renderContextMenu;
    render(): JSX.Element;
}
interface ITreeLevelProps {
    spaces: Room[];
    activeSpaces: Room[];
    isNested?: boolean;
    parents: Set<string>;
}
declare const SpaceTreeLevel: React.FC<ITreeLevelProps>;
export default SpaceTreeLevel;
