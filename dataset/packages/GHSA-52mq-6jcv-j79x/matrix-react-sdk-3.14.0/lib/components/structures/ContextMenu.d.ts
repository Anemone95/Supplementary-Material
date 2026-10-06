import React, { RefObject } from "react";
interface IPosition {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}
export declare enum ChevronFace {
    Top = "top",
    Bottom = "bottom",
    Left = "left",
    Right = "right",
    None = "none"
}
export interface IProps extends IPosition {
    menuWidth?: number;
    menuHeight?: number;
    chevronOffset?: number;
    chevronFace?: ChevronFace;
    menuPaddingTop?: number;
    menuPaddingBottom?: number;
    menuPaddingLeft?: number;
    menuPaddingRight?: number;
    zIndex?: number;
    hasBackground?: boolean;
    managed?: boolean;
    onFinished(): any;
    windowResize?(): any;
}
interface IState {
    contextMenuElem: HTMLDivElement;
}
export declare class ContextMenu extends React.PureComponent<IProps, IState> {
    private initialFocus;
    static defaultProps: {
        hasBackground: boolean;
        managed: boolean;
    };
    constructor(props: any, context: any);
    componentWillUnmount(): void;
    private collectContextMenuRect;
    private onContextMenu;
    private onContextMenuPreventBubbling;
    private onFinished;
    private onMoveFocus;
    private onMoveFocusHomeEnd;
    private onKeyDown;
    protected renderMenu(hasBackground?: boolean): JSX.Element;
    render(): React.ReactChild;
}
export declare const toRightOf: (elementRect: DOMRect, chevronOffset?: number) => {
    left: number;
    top: number;
    chevronOffset: number;
};
export declare const aboveLeftOf: (elementRect: DOMRect, chevronFace?: ChevronFace, vPadding?: number) => IPosition & {
    chevronFace: ChevronFace;
};
export declare const alwaysAboveLeftOf: (elementRect: DOMRect, chevronFace?: ChevronFace, vPadding?: number) => IPosition & {
    chevronFace: ChevronFace;
};
export declare const alwaysAboveRightOf: (elementRect: DOMRect, chevronFace?: ChevronFace, vPadding?: number) => IPosition & {
    chevronFace: ChevronFace;
};
declare type ContextMenuTuple<T> = [boolean, RefObject<T>, () => void, () => void, (val: boolean) => void];
export declare const useContextMenu: <T extends unknown = HTMLElement>() => ContextMenuTuple<T>;
export default class LegacyContextMenu extends ContextMenu {
    render(): JSX.Element;
}
export declare function createMenu(ElementClass: any, props: any): {
    close: (...args: any[]) => void;
};
export { ContextMenuButton } from "../../accessibility/context_menu/ContextMenuButton";
export { ContextMenuTooltipButton } from "../../accessibility/context_menu/ContextMenuTooltipButton";
export { MenuGroup } from "../../accessibility/context_menu/MenuGroup";
export { MenuItem } from "../../accessibility/context_menu/MenuItem";
export { MenuItemCheckbox } from "../../accessibility/context_menu/MenuItemCheckbox";
export { MenuItemRadio } from "../../accessibility/context_menu/MenuItemRadio";
export { StyledMenuItemCheckbox } from "../../accessibility/context_menu/StyledMenuItemCheckbox";
export { StyledMenuItemRadio } from "../../accessibility/context_menu/StyledMenuItemRadio";
