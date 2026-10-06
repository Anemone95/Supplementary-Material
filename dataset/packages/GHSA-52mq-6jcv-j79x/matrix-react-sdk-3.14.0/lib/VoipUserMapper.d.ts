export declare function voipUserMapperEnabled(): boolean;
export declare function userToVirtualUser(userId: string, templateString?: string): string;
export declare function virtualUserToUser(userId: string, templateString?: string): string;
export declare function getOrCreateVirtualRoomForRoom(roomId: string): Promise<string>;
export declare function roomForVirtualRoom(roomId: string): string;
export declare function isVirtualRoom(roomId: string): boolean;
