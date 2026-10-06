export default class DeviceListener {
    private dispatcherRef;
    private dismissed;
    private dismissedThisDeviceToast;
    private keyBackupInfo;
    private keyBackupFetchedAt;
    private ourDeviceIdsAtStart;
    private displayingToastsForDeviceIds;
    static sharedInstance(): DeviceListener;
    start(): void;
    stop(): void;
    /**
     * Dismiss notifications about our own unverified devices
     *
     * @param {String[]} deviceIds List of device IDs to dismiss notifications for
     */
    dismissUnverifiedSessions(deviceIds: Iterable<string>): Promise<void>;
    dismissEncryptionSetup(): void;
    _ensureDeviceIdsAtStartPopulated(): void;
    _onWillUpdateDevices: (users: string[], initialFetch?: boolean) => Promise<void>;
    _onDevicesUpdated: (users: string[]) => void;
    _onDeviceVerificationChanged: (userId: string) => void;
    _onUserTrustStatusChanged: (userId: string) => void;
    _onCrossSingingKeysChanged: () => void;
    _onAccountData: (ev: any) => void;
    _onSync: (state: any, prevState: any) => void;
    _onRoomStateEvents: (ev: any) => void;
    _onAction: ({ action }: {
        action: any;
    }) => void;
    _getKeyBackupInfo(): Promise<object>;
    private shouldShowSetupEncryptionToast;
    _recheck(): Promise<void>;
}
