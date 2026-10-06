import { MapType } from '@sap-cloud-sdk/util';
import { HttpRequestConfig } from '../http-client';
import { ODataRequestConfig } from '../odata/common/request';
import { Destination, DestinationNameAndJwt } from '../scp-cf';
import { ODataRequest } from '../odata/common/request/odata-request';
/**
 * Get CSRF token and cookies for a destination and request configuration. The CSRF token and cookies will be retrieved based on the url of the destination and the custom configuration given by the `requestConfig`.
 * If there is a relative url in the `requestConfig` it will be appended to the destination's url, an absolute url overwrites the destination related url.
 * @param destination The destination to get the headers from
 * @param requestConfig An http request configuration containing additional information about the request, like url or headers
 * @returns A promise to an object containing the CSRF related headers
 */
export declare function buildCsrfHeaders<T extends HttpRequestConfig>(destination: Destination | DestinationNameAndJwt, requestConfig: Partial<T>): Promise<MapType<string>>;
/**
 * @deprecated Since v1.20.0, use [[buildCsrfHeaders]] instead.
 *
 * Add CSRF token and cookies for a request to destination related headers.
 * @param request The request to get CSRF headers for.
 * @param headers Destination related headers to include in the request.
 * @returns A promise to an object containing the CSRF related headers
 */
export declare function addCsrfTokenAndCookies<RequestT extends ODataRequestConfig>(request: ODataRequest<RequestT>, headers: MapType<string>): Promise<MapType<string>>;
//# sourceMappingURL=csrf-token-header.d.ts.map