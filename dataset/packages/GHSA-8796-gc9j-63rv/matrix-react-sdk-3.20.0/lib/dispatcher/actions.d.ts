export declare type DispatcherAction = Action | string;
export declare enum Action {
    /**
     * View a user's profile. Should be used with a ViewUserPayload.
     */
    ViewUser = "view_user",
    /**
     * Open the user settings. No additional payload information required.
     * Optionally can include an OpenToTabPayload.
     */
    ViewUserSettings = "view_user_settings",
    /**
     * Opens the room directory. No additional payload information required.
     */
    ViewRoomDirectory = "view_room_directory",
    /**
     * Forces the theme to reload. No additional payload information required.
     */
    RecheckTheme = "recheck_theme",
    /**
     * Provide status information for an ongoing update check. Should be used with a CheckUpdatesPayload.
     */
    CheckUpdates = "check_updates",
    /**
     * Focuses the user's cursor to the composer. No additional payload information required.
     */
    FocusComposer = "focus_composer",
    /**
     * Opens the user menu (previously known as the top left menu). No additional payload information required.
     */
    ToggleUserMenu = "toggle_user_menu",
    /**
     * Sets the apps root font size. Should be used with UpdateFontSizePayload
     */
    UpdateFontSize = "update_font_size",
    /**
     * Sets a system font. Should be used with UpdateSystemFontPayload
     */
    UpdateSystemFont = "update_system_font",
    /**
     * Changes room based on room list order and payload parameters. Should be used with ViewRoomDeltaPayload.
     */
    ViewRoomDelta = "view_room_delta",
    /**
     * Sets the phase for the right panel. Should be used with SetRightPanelPhasePayload.
     */
    SetRightPanelPhase = "set_right_panel_phase",
    /**
     * Toggles the right panel. Should be used with ToggleRightPanelPayload.
     */
    ToggleRightPanel = "toggle_right_panel",
    /**
     * Trigged after the phase of the right panel is set. Should be used with AfterRightPanelPhaseChangePayload.
     */
    AfterRightPanelPhaseChange = "after_right_panel_phase_change",
    /**
     * Opens the modal dial pad
     */
    OpenDialPad = "open_dial_pad",
    /**
     * Fired when CallHandler has checked for PSTN protocol support
     * payload: none
     * XXX: Is an action the right thing for this?
     */
    PstnSupportUpdated = "pstn_support_updated",
    /**
     * Similar to PstnSupportUpdated, fired when CallHandler has checked for virtual room support
     * payload: none
     * XXX: Ditto
     */
    VirtualRoomSupportUpdated = "virtual_room_support_updated",
    CallChangeRoom = "call_change_room",
    /**
     * Fired when an upload has started. Should be used with UploadStartedPayload.
     */
    UploadStarted = "upload_started",
    /**
     * Fired when an upload makes progress. Should be used with UploadProgressPayload.
     */
    UploadProgress = "upload_progress",
    /**
     * Fired when an upload is completed. Should be used with UploadFinishedPayload.
     */
    UploadFinished = "upload_finished",
    /**
     * Fired when an upload fails. Should be used with UploadErrorPayload.
     */
    UploadFailed = "upload_failed",
    /**
     * Fired when an upload is cancelled by the user. Should be used with UploadCanceledPayload.
     */
    UploadCanceled = "upload_canceled"
}
