"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMapNodeParser = void 0;
const creator_1 = require("./creator");
const placeFirstGoogleMapRegExp = /\[([^\]]*[^\s])\s+([NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?)\]/;
const coordFirstGoogleMapRegExp = /\[([NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?)(?:\s+([^\]]*[^\s]))?\]/;
const parseCoordinate = format => {
    const [lat, lng, z] = format.split(',');
    const latitude = parseFloat(lat.replace(/^N/, '').replace(/^S/, '-'));
    const longitude = parseFloat(lng.replace(/^E/, '').replace(/^W/, '-'));
    const zoom = /^Z\d+$/.test(z) ? parseInt(z.replace(/^Z/, ''), 10) : 14;
    return { latitude, longitude, zoom };
};
const createGoogleMapNode = raw => {
    var _a;
    const match = (_a = raw.match(placeFirstGoogleMapRegExp)) !== null && _a !== void 0 ? _a : raw.match(coordFirstGoogleMapRegExp);
    if (match === null)
        return [];
    const isCoordFirst = raw.startsWith('[N') || raw.startsWith('[S');
    const [, coord, place = ''] = isCoordFirst ? match : [match[0], match[2], match[1]];
    const { latitude, longitude, zoom } = parseCoordinate(coord);
    const url = place !== ''
        ? `https://www.google.com/maps/place/${encodeURIComponent(place)}/@${latitude},${longitude},${zoom}z`
        : `https://www.google.com/maps/@${latitude},${longitude},${zoom}z`;
    return {
        type: 'googleMap',
        raw,
        latitude,
        longitude,
        zoom,
        place,
        url
    };
};
exports.GoogleMapNodeParser = creator_1.createNodeParser(createGoogleMapNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [placeFirstGoogleMapRegExp, coordFirstGoogleMapRegExp]
});
//# sourceMappingURL=GoogleMapNode.js.map