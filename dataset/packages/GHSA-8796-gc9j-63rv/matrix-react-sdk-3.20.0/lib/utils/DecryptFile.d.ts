import { IEncryptedFile } from "../customisations/models/IMediaEventContent";
/**
 * Decrypt a file attached to a matrix event.
 * @param {IEncryptedFile} file The json taken from the matrix event.
 *   This passed to [link]{@link https://github.com/matrix-org/browser-encrypt-attachments}
 *   as the encryption info object, so will also have the those keys in addition to
 *   the keys below.
 * @returns {Promise<Blob>} Resolves to a Blob of the file.
 */
export declare function decryptFile(file: IEncryptedFile): Promise<Blob>;
