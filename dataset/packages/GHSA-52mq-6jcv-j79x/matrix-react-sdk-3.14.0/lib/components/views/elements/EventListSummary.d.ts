import React, { ReactChildren } from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
interface IProps {
    events: MatrixEvent[];
    threshold?: number;
    startExpanded?: boolean;
    summaryMembers?: RoomMember[];
    summaryText?: string;
    children: ReactChildren;
    onToggle?(): void;
}
declare const EventListSummary: React.FC<IProps>;
export default EventListSummary;
