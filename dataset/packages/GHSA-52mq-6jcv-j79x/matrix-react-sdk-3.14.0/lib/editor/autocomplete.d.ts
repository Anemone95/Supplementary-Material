import { KeyboardEvent } from "react";
import { Part, CommandPartCreator, PartCreator } from "./parts";
import DocumentPosition from "./position";
import { ICompletion } from "../autocomplete/Autocompleter";
import Autocomplete from "../components/views/rooms/Autocomplete";
export interface ICallback {
    replaceParts?: Part[];
    close?: boolean;
}
export declare type UpdateCallback = (data: ICallback) => void;
export declare type GetAutocompleterComponent = () => Autocomplete;
export declare type UpdateQuery = (test: string) => Promise<void>;
export default class AutocompleteWrapperModel {
    private updateCallback;
    private getAutocompleterComponent;
    private updateQuery;
    private partCreator;
    private queryPart;
    private partIndex;
    constructor(updateCallback: UpdateCallback, getAutocompleterComponent: GetAutocompleterComponent, updateQuery: UpdateQuery, partCreator: PartCreator | CommandPartCreator);
    onEscape(e: KeyboardEvent): void;
    close(): void;
    hasSelection(): boolean;
    hasCompletions(): boolean;
    onEnter(): void;
    onTab(e: KeyboardEvent): Promise<void>;
    onUpArrow(e: KeyboardEvent): void;
    onDownArrow(e: KeyboardEvent): void;
    onPartUpdate(part: Part, pos: DocumentPosition): Promise<void>;
    onComponentSelectionChange(completion: ICompletion): void;
    onComponentConfirm(completion: ICompletion): void;
    private partForCompletion;
}
