import { IMatrixClientCreds } from "../MatrixClientPeg";
import { Kind as SetupEncryptionKind } from "../toasts/SetupEncryptionToast";
import { ISecretStorageKeyInfo } from 'matrix-js-sdk/src/matrix';
declare function examineLoginResponse(response: any, credentials: IMatrixClientCreds): void;
declare function persistCredentials(credentials: IMatrixClientCreds): void;
declare function createSecretStorageKey(): Uint8Array;
declare function getSecretStorageKey(): Uint8Array;
declare function getDehydrationKey(keyInfo: ISecretStorageKeyInfo): Promise<Uint8Array>;
declare function catchAccessSecretStorageError(e: Error): void;
declare function setupEncryptionNeeded(kind: SetupEncryptionKind): boolean;
export interface ISecurityCustomisations {
    examineLoginResponse?: typeof examineLoginResponse;
    persistCredentials?: typeof persistCredentials;
    createSecretStorageKey?: typeof createSecretStorageKey;
    getSecretStorageKey?: typeof getSecretStorageKey;
    catchAccessSecretStorageError?: typeof catchAccessSecretStorageError;
    setupEncryptionNeeded?: typeof setupEncryptionNeeded;
    getDehydrationKey?: typeof getDehydrationKey;
}
declare const _default: ISecurityCustomisations;
export default _default;
