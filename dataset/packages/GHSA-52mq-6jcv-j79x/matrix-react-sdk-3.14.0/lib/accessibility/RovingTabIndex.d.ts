import React from "react";
import { FocusHandler, Ref } from "./roving/types";
export interface IState {
    activeRef: Ref;
    refs: Ref[];
}
interface IProps {
    handleHomeEnd?: boolean;
    children(renderProps: {
        onKeyDownHandler(ev: React.KeyboardEvent): any;
    }): any;
    onKeyDown?(ev: React.KeyboardEvent, state: IState): any;
}
export declare const RovingTabIndexProvider: React.FC<IProps>;
export declare const useRovingTabIndex: (inputRef?: Ref) => [FocusHandler, boolean, Ref];
export { RovingTabIndexWrapper } from "./roving/RovingTabIndexWrapper";
export { RovingAccessibleButton } from "./roving/RovingAccessibleButton";
export { RovingAccessibleTooltipButton } from "./roving/RovingAccessibleTooltipButton";
