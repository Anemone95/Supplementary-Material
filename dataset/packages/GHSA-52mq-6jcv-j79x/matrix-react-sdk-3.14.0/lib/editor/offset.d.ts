import EditorModel from "./model";
export default class DocumentOffset {
    offset: number;
    readonly atNodeEnd: boolean;
    constructor(offset: number, atNodeEnd: boolean);
    asPosition(model: EditorModel): import("./position").default;
    add(delta: number, atNodeEnd?: boolean): DocumentOffset;
}
