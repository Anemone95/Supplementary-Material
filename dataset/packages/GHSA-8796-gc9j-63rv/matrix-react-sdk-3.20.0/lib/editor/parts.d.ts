import { MatrixClient } from "matrix-js-sdk/src/client";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { Room } from "matrix-js-sdk/src/models/room";
import AutocompleteWrapperModel, { GetAutocompleterComponent, UpdateCallback, UpdateQuery } from "./autocomplete";
interface ISerializedPart {
    type: Type.Plain | Type.Newline | Type.Command | Type.PillCandidate;
    text: string;
}
interface ISerializedPillPart {
    type: Type.AtRoomPill | Type.RoomPill | Type.UserPill;
    text: string;
    resourceId?: string;
}
export declare type SerializedPart = ISerializedPart | ISerializedPillPart;
declare enum Type {
    Plain = "plain",
    Newline = "newline",
    Command = "command",
    UserPill = "user-pill",
    RoomPill = "room-pill",
    AtRoomPill = "at-room-pill",
    PillCandidate = "pill-candidate"
}
interface IBasePart {
    text: string;
    type: Type.Plain | Type.Newline;
    canEdit: boolean;
    createAutoComplete(updateCallback: UpdateCallback): void;
    serialize(): SerializedPart;
    remove(offset: number, len: number): string;
    split(offset: number): IBasePart;
    validateAndInsert(offset: number, str: string, inputType: string): boolean;
    appendUntilRejected(str: string, inputType: string): string;
    updateDOMNode(node: Node): any;
    canUpdateDOMNode(node: Node): any;
    toDOMNode(): Node;
}
interface IPillCandidatePart extends Omit<IBasePart, "type" | "createAutoComplete"> {
    type: Type.PillCandidate | Type.Command;
    createAutoComplete(updateCallback: UpdateCallback): AutocompleteWrapperModel;
}
interface IPillPart extends Omit<IBasePart, "type" | "resourceId"> {
    type: Type.AtRoomPill | Type.RoomPill | Type.UserPill;
    resourceId: string;
}
export declare type Part = IBasePart | IPillCandidatePart | IPillPart;
declare abstract class BasePart {
    protected _text: string;
    constructor(text?: string);
    acceptsInsertion(chr: string, offset: number, inputType: string): boolean;
    acceptsRemoval(position: number, chr: string): boolean;
    merge(part: Part): boolean;
    split(offset: number): PlainPart;
    remove(offset: number, len: number): string;
    appendUntilRejected(str: string, inputType: string): string;
    validateAndInsert(offset: number, str: string, inputType: string): boolean;
    createAutoComplete(updateCallback: UpdateCallback): void;
    trim(len: number): string;
    get text(): string;
    abstract get type(): Type;
    get canEdit(): boolean;
    toString(): string;
    serialize(): SerializedPart;
    abstract updateDOMNode(node: Node): any;
    abstract canUpdateDOMNode(node: Node): any;
    abstract toDOMNode(): Node;
}
declare abstract class PlainBasePart extends BasePart {
    acceptsInsertion(chr: string, offset: number, inputType: string): boolean;
    toDOMNode(): Text;
    merge(part: any): boolean;
    updateDOMNode(node: Node): void;
    canUpdateDOMNode(node: Node): boolean;
}
export declare class PlainPart extends PlainBasePart implements IBasePart {
    get type(): IBasePart["type"];
}
declare abstract class PillPart extends BasePart implements IPillPart {
    resourceId: string;
    constructor(resourceId: string, label: any);
    acceptsInsertion(chr: string): boolean;
    acceptsRemoval(position: number, chr: string): boolean;
    toDOMNode(): HTMLSpanElement;
    updateDOMNode(node: HTMLElement): void;
    canUpdateDOMNode(node: HTMLElement): boolean;
    _setAvatarVars(node: HTMLElement, avatarUrl: string, initialLetter: string): void;
    serialize(): ISerializedPillPart;
    get canEdit(): boolean;
    abstract get type(): IPillPart["type"];
    abstract get className(): string;
    abstract setAvatar(node: HTMLElement): void;
}
declare class NewlinePart extends BasePart implements IBasePart {
    acceptsInsertion(chr: string, offset: number): boolean;
    acceptsRemoval(position: number, chr: string): boolean;
    toDOMNode(): HTMLBRElement;
    merge(): boolean;
    updateDOMNode(): void;
    canUpdateDOMNode(node: HTMLElement): boolean;
    get type(): IBasePart["type"];
    get canEdit(): boolean;
}
declare class RoomPillPart extends PillPart {
    private room;
    constructor(resourceId: string, label: string, room: Room);
    setAvatar(node: HTMLElement): void;
    get type(): IPillPart["type"];
    get className(): string;
}
declare class AtRoomPillPart extends RoomPillPart {
    constructor(text: string, room: Room);
    get type(): IPillPart["type"];
    serialize(): ISerializedPillPart;
}
declare class UserPillPart extends PillPart {
    private member;
    constructor(userId: any, displayName: any, member: RoomMember);
    setAvatar(node: HTMLElement): void;
    get type(): IPillPart["type"];
    get className(): string;
}
declare class PillCandidatePart extends PlainBasePart implements IPillCandidatePart {
    private autoCompleteCreator;
    constructor(text: string, autoCompleteCreator: IAutocompleteCreator);
    createAutoComplete(updateCallback: UpdateCallback): AutocompleteWrapperModel;
    acceptsInsertion(chr: string, offset: number, inputType: string): boolean;
    merge(): boolean;
    acceptsRemoval(position: number, chr: string): boolean;
    get type(): IPillCandidatePart["type"];
}
export declare function getAutoCompleteCreator(getAutocompleterComponent: GetAutocompleterComponent, updateQuery: UpdateQuery): (partCreator: PartCreator) => (updateCallback: UpdateCallback) => AutocompleteWrapperModel;
declare type AutoCompleteCreator = ReturnType<typeof getAutoCompleteCreator>;
interface IAutocompleteCreator {
    create(updateCallback: UpdateCallback): AutocompleteWrapperModel;
}
export declare class PartCreator {
    private room;
    private client;
    protected readonly autoCompleteCreator: IAutocompleteCreator;
    constructor(room: Room, client: MatrixClient, autoCompleteCreator?: AutoCompleteCreator);
    setAutoCompleteCreator(autoCompleteCreator: AutoCompleteCreator): void;
    createPartForInput(input: string, partIndex: number, inputType?: string): Part;
    createDefaultPart(text: string): PlainPart;
    deserializePart(part: SerializedPart): Part;
    plain(text: string): PlainPart;
    newline(): NewlinePart;
    pillCandidate(text: string): PillCandidatePart;
    roomPill(alias: string, roomId?: string): RoomPillPart;
    atRoomPill(text: string): AtRoomPillPart;
    userPill(displayName: string, userId: string): UserPillPart;
    createMentionParts(insertTrailingCharacter: boolean, displayName: string, userId: string): (PlainPart | UserPillPart)[];
}
export declare class CommandPartCreator extends PartCreator {
    createPartForInput(text: string, partIndex: number): Part;
    command(text: string): CommandPart;
    deserializePart(part: Part): Part;
}
declare class CommandPart extends PillCandidatePart {
    get type(): IPillCandidatePart["type"];
}
export {};
