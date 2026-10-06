import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    matrixClient: MatrixClient;
    space: Room;
    onCreateRoomClick(cli: MatrixClient, space: Room): void;
}
interface IAddExistingToSpaceProps {
    space: Room;
    selected: Set<Room>;
    onChange(checked: boolean, room: Room): void;
}
export declare const AddExistingToSpace: React.FC<IAddExistingToSpaceProps>;
declare const AddExistingToSpaceDialog: React.FC<IProps>;
export default AddExistingToSpaceDialog;
