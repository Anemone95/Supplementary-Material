import { MapType } from '@sap-cloud-sdk/util';
import { Destination } from '../scp-cf';
import { ODataRequestConfig } from '../odata/common/request';
import { ODataRequest } from '../odata/common/request/odata-request';
/**
 * Create object containing all headers, including custom headers for a given  OData request configuration and destination.
 * Custom headers override duplicate headers.
 *
 * @typeparam RequestT - Type of the request the headers are built for
 * @param request - OData request configuration to create headers for
 * @returns Key-value pairs where the key is the name of a header property and the value is the respective value
 */
export declare function buildHeaders<RequestT extends ODataRequestConfig>(request: ODataRequest<RequestT>): Promise<MapType<string>>;
/**
 * Builds the authorization, proxy authorization and SAP headers for a given destination.
 *
 * @param destination - A destination.
 * @param customHeaders - Custom default headers for the resulting HTTP headers.
 * @returns HTTP headers for the given destination.
 */
export declare function buildHeadersForDestination(destination: Destination, customHeaders?: MapType<any>): Promise<MapType<string>>;
//# sourceMappingURL=header-builder.d.ts.map