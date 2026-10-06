export interface IEncryptedFile {
    url: string;
    mimetype?: string;
    key: {
        alg: string;
        key_ops: string[];
        kty: string;
        k: string;
        ext: boolean;
    };
    iv: string;
    hashes: {
        [alg: string]: string;
    };
    v: string;
}
export interface IMediaEventContent {
    url?: string;
    file?: IEncryptedFile;
    info?: {
        thumbnail_url?: string;
        thumbnail_file?: IEncryptedFile;
    };
}
export interface IPreparedMedia extends IMediaObject {
    thumbnail?: IMediaObject;
}
export interface IMediaObject {
    mxc: string;
    file?: IEncryptedFile;
}
/**
 * Parses an event content body into a prepared media object. This prepared media object
 * can be used with other functions to manipulate the media.
 * @param {IMediaEventContent} content Unredacted media event content. See interface.
 * @returns {IPreparedMedia} A prepared media object.
 * @throws Throws if the given content cannot be packaged into a prepared media object.
 */
export declare function prepEventContentAsMedia(content: IMediaEventContent): IPreparedMedia;
