import React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    matrixClient: MatrixClient;
    space: Room;
}
declare const SpaceSettingsDialog: React.FC<IProps>;
export default SpaceSettingsDialog;
