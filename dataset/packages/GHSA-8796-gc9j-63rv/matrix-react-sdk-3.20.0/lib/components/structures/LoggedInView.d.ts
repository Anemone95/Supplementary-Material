import * as React from 'react';
import * as PropTypes from 'prop-types';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { IMatrixClientCreds } from '../../MatrixClientPeg';
import ResizeHandle from '../views/elements/ResizeHandle';
import { Resizer } from '../../resizer';
import ResizeNotifier from "../../utils/ResizeNotifier";
import { IThreepidInvite } from "../../stores/ThreepidInviteStore";
import { ICollapseConfig } from "../../resizer/distributors/collapse";
import { IOpts } from "../../createRoom";
interface IProps {
    matrixClient: MatrixClient;
    onRegistered: (credentials: IMatrixClientCreds) => Promise<MatrixClient>;
    hideToSRUsers: boolean;
    resizeNotifier: ResizeNotifier;
    page_type: string;
    autoJoin: boolean;
    threepidInvite?: IThreepidInvite;
    roomOobData?: object;
    currentRoomId: string;
    collapseLhs: boolean;
    config: {
        piwik: {
            policyUrl: string;
        };
        [key: string]: any;
    };
    currentUserId?: string;
    currentGroupId?: string;
    currentGroupIsNew?: boolean;
    justRegistered?: boolean;
    roomJustCreatedOpts?: IOpts;
}
interface IUsageLimit {
    limit_type: "monthly_active_user" | "hs_disabled" | string;
    admin_contact?: string;
}
interface IState {
    syncErrorData?: {
        error: {
            data: IUsageLimit;
            errcode: string;
        };
    };
    usageLimitDismissed: boolean;
    usageLimitEventContent?: IUsageLimit;
    usageLimitEventTs?: number;
    useCompactLayout: boolean;
}
/**
 * This is what our MatrixChat shows when we are logged in. The precise view is
 * determined by the page_type property.
 *
 * Currently it's very tightly coupled with MatrixChat. We should try to do
 * something about that.
 *
 * Components mounted below us can access the matrix client via the react context.
 */
declare class LoggedInView extends React.Component<IProps, IState> {
    static displayName: string;
    static propTypes: {
        matrixClient: PropTypes.Validator<unknown>;
        page_type: PropTypes.Validator<string>;
        onRoomCreated: PropTypes.Requireable<(...args: any[]) => any>;
        onRegistered: PropTypes.Requireable<(...args: any[]) => any>;
    };
    protected readonly _matrixClient: MatrixClient;
    protected readonly _roomView: React.RefObject<any>;
    protected readonly _resizeContainer: React.RefObject<ResizeHandle>;
    protected compactLayoutWatcherRef: string;
    protected resizer: Resizer;
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(): boolean;
    canResetTimelineInRoom: (roomId: any) => any;
    _createResizer(): Resizer<ICollapseConfig>;
    _loadResizerPreferences(): void;
    onAccountData: (event: any) => void;
    onCompactLayoutChanged: (setting: any, roomId: any, level: any, valueAtLevel: any, newValue: any) => void;
    onSync: (syncState: any, oldSyncState: any, data: any) => void;
    onRoomStateEvents: (ev: any, state: any) => void;
    private onUsageLimitDismissed;
    _calculateServerLimitToast(syncError: IState["syncErrorData"], usageLimitEventContent?: IUsageLimit): void;
    _updateServerNoticeEvents: () => Promise<any[]>;
    _onPaste: (ev: any) => void;
    _onReactKeyDown: (ev: any) => void;
    _onNativeKeyDown: (ev: any) => void;
    _onKeyDown: (ev: any) => void;
    /**
     * dispatch a page-up/page-down/etc to the appropriate component
     * @param {Object} ev The key event
     */
    _onScrollKeyPressed: (ev: any) => void;
    _onDragEnd: (result: any) => void;
    _onRoomTileEndDrag: (result: any) => void;
    render(): JSX.Element;
}
export default LoggedInView;
