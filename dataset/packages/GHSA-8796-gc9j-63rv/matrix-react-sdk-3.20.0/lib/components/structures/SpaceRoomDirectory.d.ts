import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IHierarchyProps {
    space: Room;
    initialText?: string;
    refreshToken?: any;
    showRoom(room: ISpaceSummaryRoom, viaServers?: string[], autoJoin?: boolean): void;
}
export interface ISpaceSummaryRoom {
    canonical_alias?: string;
    aliases: string[];
    avatar_url?: string;
    guest_can_join: boolean;
    name?: string;
    num_joined_members: number;
    room_id: string;
    topic?: string;
    world_readable: boolean;
    num_refs: number;
    room_type: string;
}
export interface ISpaceSummaryEvent {
    room_id: string;
    event_id: string;
    origin_server_ts: number;
    type: string;
    state_key: string;
    content: {
        order?: string;
        suggested?: boolean;
        auto_join?: boolean;
        via?: string;
    };
}
export declare const showRoom: (room: ISpaceSummaryRoom, viaServers?: string[], autoJoin?: boolean) => void;
interface IHierarchyLevelProps {
    spaceId: string;
    rooms: Map<string, ISpaceSummaryRoom>;
    relations: Map<string, Map<string, ISpaceSummaryEvent>>;
    parents: Set<string>;
    selectedMap?: Map<string, Set<string>>;
    onViewRoomClick(roomId: string, autoJoin: boolean): void;
    onToggleClick?(parentId: string, childId: string): void;
}
export declare const HierarchyLevel: ({ spaceId, rooms, relations, parents, selectedMap, onViewRoomClick, onToggleClick, }: IHierarchyLevelProps) => JSX.Element;
export declare const useSpaceSummary: (cli: any, space: any, refreshToken?: any) => [
    null,
    ISpaceSummaryRoom[],
    Map<string, Map<string, ISpaceSummaryEvent>>?,
    Map<string, Set<string>>?,
    Map<string, Set<string>>?
] | [Error];
export declare const SpaceHierarchy: React.FC<IHierarchyProps>;
interface IProps {
    space: Room;
    initialText?: string;
    onFinished(): void;
}
declare const SpaceRoomDirectory: React.FC<IProps>;
export default SpaceRoomDirectory;
