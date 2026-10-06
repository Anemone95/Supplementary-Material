import React, { ReactNode } from "react";
interface IProps {
    className: string;
    title: string;
    subtitle?: ReactNode;
}
declare const EventTileBubble: React.ForwardRefExoticComponent<IProps & React.RefAttributes<HTMLDivElement>>;
export default EventTileBubble;
