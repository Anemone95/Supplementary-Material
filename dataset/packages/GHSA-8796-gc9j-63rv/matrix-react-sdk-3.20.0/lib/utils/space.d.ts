import { EventType } from "matrix-js-sdk/src/@types/event";
export declare const shouldShowSpaceSettings: (cli: any, space: any) => any;
export declare const makeSpaceParentEvent: (room: any, canonical?: boolean) => {
    type: EventType;
    content: {
        via: string[];
        canonical: boolean;
    };
    state_key: any;
};
export declare const showSpaceSettings: (cli: any, space: any) => void;
export declare const showAddExistingRooms: (cli: any, space: any) => Promise<any[]>;
export declare const showCreateNewRoom: (cli: any, space: any) => Promise<void>;
export declare const showSpaceInvite: (space: any, initialText?: string) => void;
