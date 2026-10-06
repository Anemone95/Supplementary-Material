import { MatrixClient } from "matrix-js-sdk/src/client";
import "blueimp-canvas-to-blob";
export declare class UploadCanceledError extends Error {
}
interface IUpload {
    fileName: string;
    roomId: string;
    total: number;
    loaded: number;
    promise: Promise<any>;
    canceled?: boolean;
}
export default class ContentMessages {
    private inprogress;
    private mediaConfig;
    sendStickerContentToRoom(url: string, roomId: string, info: string, text: string, matrixClient: MatrixClient): any;
    getUploadLimit(): number;
    sendContentListToRoom(files: File[], roomId: string, matrixClient: MatrixClient): Promise<void>;
    getCurrentUploads(): IUpload[];
    cancelUpload(promise: Promise<any>): void;
    private sendContentToRoom;
    private isFileSizeAcceptable;
    private ensureMediaConfigFetched;
    static sharedInstance(): ContentMessages;
}
export {};
