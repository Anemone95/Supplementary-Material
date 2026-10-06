export interface IUpload {
    fileName: string;
    roomId: string;
    total: number;
    loaded: number;
    promise: Promise<any>;
    canceled?: boolean;
}
