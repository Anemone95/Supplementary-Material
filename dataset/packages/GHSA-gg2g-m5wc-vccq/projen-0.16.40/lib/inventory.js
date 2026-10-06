"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discover = void 0;
const path = require("path");
const fs = require("fs-extra");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const decamelize = require('decamelize');
const PROJEN_MODULE_ROOT = path.join(__dirname, '..');
const PROJECT_BASE_FQN = 'projen.Project';
/**
 * Returns a list of project types exported the modules defined in `moduleDirs`.
 * This list will always also include the built-in projen project types.
 * Modules without a .jsii manifest are skipped.
 *
 * @param moduleDirs A list of npm module directories
 */
function discover(...moduleDirs) {
    var _a, _b, _c, _d;
    const jsii = {};
    const discoverJsii = (dir) => {
        const jsiiFile = path.join(dir, '.jsii');
        if (!fs.existsSync(jsiiFile)) {
            return;
        } // no jsii manifest
        const manifest = fs.readJsonSync(jsiiFile);
        for (const [fqn, type] of Object.entries(manifest.types)) {
            jsii[fqn] = type;
        }
    };
    // read all .jsii manifests from all modules (incl. projen itself) and merge
    // them all into a single map of fqn->type.
    for (const dir of [...moduleDirs, PROJEN_MODULE_ROOT]) {
        discoverJsii(dir);
        if (dir.includes('@') && fs.lstatSync(dir).isDirectory()) {
            const childDirs = fs.readdirSync(dir).map(file => path.join(dir, file));
            for (const child of childDirs) {
                discoverJsii(child);
            }
        }
    }
    const result = new Array();
    for (const [fqn, typeinfo] of Object.entries(jsii)) {
        if (!isProjectType(jsii, fqn)) {
            continue;
        }
        // projen.web.ReactProject -> web.ReactProject
        const typename = fqn.substring(fqn.indexOf('.') + 1);
        const docsurl = `https://github.com/projen/projen/blob/master/API.md#projen-${typename.toLocaleLowerCase()}`;
        let pjid = (_c = (_b = (_a = typeinfo.docs) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.pjid) !== null && _c !== void 0 ? _c : decamelize(typename).replace(/_project$/, '');
        result.push({
            moduleName: typeinfo.assembly,
            typename,
            pjid,
            fqn,
            options: discoverOptions(jsii, fqn).sort((o1, o2) => o1.name.localeCompare(o2.name)),
            docs: (_d = typeinfo.docs) === null || _d === void 0 ? void 0 : _d.summary,
            docsurl,
        });
    }
    return result.sort((r1, r2) => r1.pjid.localeCompare(r2.pjid));
}
exports.discover = discover;
function discoverOptions(jsii, fqn) {
    var _a, _b, _c, _d;
    const options = {};
    const params = (_c = (_b = (_a = jsii[fqn]) === null || _a === void 0 ? void 0 : _a.initializer) === null || _b === void 0 ? void 0 : _b.parameters) !== null && _c !== void 0 ? _c : [];
    const optionsParam = params[0];
    const optionsTypeFqn = (_d = optionsParam === null || optionsParam === void 0 ? void 0 : optionsParam.type) === null || _d === void 0 ? void 0 : _d.fqn;
    if (params.length > 1 || (params.length === 1 && (optionsParam === null || optionsParam === void 0 ? void 0 : optionsParam.name) !== 'options')) {
        throw new Error(`constructor for project ${fqn} must have a single "options" argument of a struct type. got ${JSON.stringify(params)}`);
    }
    addOptions(optionsTypeFqn);
    const opts = Object.values(options);
    return opts.sort((a, b) => a.switch.localeCompare(b.switch));
    function addOptions(ofqn, basePath = [], optional = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (!ofqn) {
            return;
        }
        const struct = jsii[ofqn];
        if (!struct) {
            throw new Error(`unable to find options type ${ofqn} for project ${fqn}`);
        }
        for (const prop of (_a = struct.properties) !== null && _a !== void 0 ? _a : []) {
            const propPath = [...basePath, prop.name];
            // protect against double-booking
            if (prop.name in options) {
                throw new Error(`duplicate option "${prop.name}" in ${fqn} (already declared in ${options[prop.name].parent})`);
            }
            let typeName;
            if ((_b = prop.type) === null || _b === void 0 ? void 0 : _b.primitive) {
                typeName = (_c = prop.type) === null || _c === void 0 ? void 0 : _c.primitive; // e.g. 'string', 'boolean', 'number'
            }
            else if ((_d = prop.type) === null || _d === void 0 ? void 0 : _d.fqn) {
                typeName = (_e = prop.type) === null || _e === void 0 ? void 0 : _e.fqn.split('.').pop(); // projen.NodeProjectOptions -> NodeProjectOptions
            }
            else { // any other types such as collection types
                typeName = 'unknown';
            }
            const isOptional = optional || prop.optional;
            let defaultValue = (_f = prop.docs) === null || _f === void 0 ? void 0 : _f.default;
            if (defaultValue === 'undefined') {
                defaultValue = undefined;
            }
            // if this is a mandatory option and we have a default value, it has to be JSON-parsable to the correct type
            if (!isOptional && defaultValue) {
                if (!((_g = prop.type) === null || _g === void 0 ? void 0 : _g.primitive)) {
                    throw new Error(`required option "${prop.name}" with a @default must use primitive types (string, number or boolean). type found is: ${typeName}`);
                }
                checkDefaultIsParsable(prop.name, defaultValue, (_h = prop.type) === null || _h === void 0 ? void 0 : _h.primitive);
            }
            options[prop.name] = filterUndefined({
                path: propPath,
                parent: struct.name,
                name: prop.name,
                docs: prop.docs.summary,
                type: typeName,
                switch: propPath.map(p => decamelize(p).replace(/_/g, '-')).join('-'),
                default: defaultValue,
                optional: isOptional,
                deprecated: prop.docs.stability === 'deprecated' ? true : undefined,
            });
        }
        for (const ifc of (_j = struct.interfaces) !== null && _j !== void 0 ? _j : []) {
            addOptions(ifc);
        }
    }
}
function filterUndefined(obj) {
    const ret = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) {
            ret[k] = v;
        }
    }
    return ret;
}
function isProjectType(jsii, fqn) {
    var _a;
    const type = jsii[fqn];
    if (type.kind !== 'class') {
        return false;
    }
    if (type.abstract) {
        return false;
    }
    if ((_a = type.docs) === null || _a === void 0 ? void 0 : _a.deprecated) {
        return false;
    }
    let curr = type;
    while (true) {
        if (curr.fqn === PROJECT_BASE_FQN) {
            return true;
        }
        if (!curr.base) {
            return false;
        }
        curr = jsii[curr.base];
        if (!curr) {
            return false;
        }
    }
}
function checkDefaultIsParsable(prop, value, type) {
    // macros are pass-through
    if (value.startsWith('$')) {
        return;
    }
    try {
        const parsed = JSON.parse(value);
        if (typeof (parsed) !== type) {
            throw new Error(`cannot parse @default value for mandatory option ${prop} as a ${type}: ${parsed}`);
        }
    }
    catch (e) {
        throw new Error(`unable to JSON.parse() value "${value}" specified as @default for mandatory option "${prop}": ${e.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBRS9CLGlFQUFpRTtBQUNqRSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDekMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0RCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBK0QxQzs7Ozs7O0dBTUc7QUFDSCxTQUFnQixRQUFRLENBQUMsR0FBRyxVQUFvQjs7SUFDOUMsTUFBTSxJQUFJLEdBQWMsRUFBRSxDQUFDO0lBRTNCLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUUsQ0FBQyxtQkFBbUI7UUFFN0QsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBa0IsQ0FBQyxFQUFFO1lBQ3JFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDbEI7SUFDSCxDQUFDLENBQUM7SUFFRiw0RUFBNEU7SUFDNUUsMkNBQTJDO0lBQzNDLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3JELFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsQixJ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QUFJLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2QsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLElBQVk7SUFDdkUsMEJBQTBCO0lBQzFCLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QixPQUFPO0tBQ1I7SUFDRCxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxvREFBb0QsSUFBSSxTQUFTLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3JHO0tBRUY7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLEtBQUssaURBQWlELElBQUksTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUMvSDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuY29uc3QgZGVjYW1lbGl6ZSA9IHJlcXVpcmUoJ2RlY2FtZWxpemUnKTtcbmNvbnN0IFBST0pFTl9NT0RVTEVfUk9PVCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicpO1xuY29uc3QgUFJPSkVDVF9CQVNFX0ZRTiA9ICdwcm9qZW4uUHJvamVjdCc7XG5cbnR5cGUgSnNpaVR5cGVzID0geyBbbmFtZTogc3RyaW5nXTogSnNpaVR5cGUgfTtcblxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0T3B0aW9uIHtcbiAgcGF0aDogc3RyaW5nW107XG4gIG5hbWU6IHN0cmluZztcbiAgc3dpdGNoOiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcbiAgcGFyZW50OiBzdHJpbmc7XG4gIGRvY3M/OiBzdHJpbmc7XG4gIGRlZmF1bHQ/OiBzdHJpbmc7XG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgZGVwcmVjYXRlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvamVjdFR5cGUge1xuICBtb2R1bGVOYW1lOiBzdHJpbmc7XG4gIHBqaWQ6IHN0cmluZztcbiAgZnFuOiBzdHJpbmc7XG4gIHR5cGVuYW1lOiBzdHJpbmc7XG4gIG9wdGlvbnM6IFByb2plY3RPcHRpb25bXTtcbiAgZG9jcz86IHN0cmluZztcbiAgZG9jc3VybDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSnNpaVR5cGUge1xuICBuYW1lOiBzdHJpbmc7XG4gIGFzc2VtYmx5OiBzdHJpbmc7XG4gIGtpbmQ6IHN0cmluZztcbiAgYWJzdHJhY3Q/OiBib29sZWFuO1xuICBiYXNlPzogc3RyaW5nO1xuICBmcW46IHN0cmluZztcbiAgaW50ZXJmYWNlcz86IHN0cmluZ1tdO1xuICBpbml0aWFsaXplcj86IHtcbiAgICBwYXJhbWV0ZXJzPzogQXJyYXk8e1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdHlwZT86IHsgZnFuPzogc3RyaW5nIH07XG4gICAgfT47XG4gIH07XG4gIHByb3BlcnRpZXM/OiBBcnJheTx7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRvY3M6IHtcbiAgICAgIHN1bW1hcnk/OiBzdHJpbmc7XG4gICAgICBkZWZhdWx0Pzogc3RyaW5nO1xuICAgICAgZGVwcmVjYXRlZD86IHN0cmluZztcbiAgICAgIHN0YWJpbGl0eT86IHN0cmluZztcbiAgICB9O1xuICAgIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgICB0eXBlPzoge1xuICAgICAgcHJpbWl0aXZlPzogc3RyaW5nO1xuICAgICAgZnFuPzogc3RyaW5nO1xuICAgIH07XG4gIH0+O1xuICBkb2NzPzoge1xuICAgIHN1bW1hcnk/OiBzdHJpbmc7XG4gICAgZGVwcmVjYXRlZD86IHN0cmluZztcbiAgICBjdXN0b20/OiB7XG4gICAgICBwamlkPzogc3RyaW5nO1xuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgcHJvamVjdCB0eXBlcyBleHBvcnRlZCB0aGUgbW9kdWxlcyBkZWZpbmVkIGluIGBtb2R1bGVEaXJzYC5cbiAqIFRoaXMgbGlzdCB3aWxsIGFsd2F5cyBhbHNvIGluY2x1ZGUgdGhlIGJ1aWx0LWluIHByb2plbiBwcm9qZWN0IHR5cGVzLlxuICogTW9kdWxlcyB3aXRob3V0IGEgLmpzaWkgbWFuaWZlc3QgYXJlIHNraXBwZWQuXG4gKlxuICogQHBhcmFtIG1vZHVsZURpcnMgQSBsaXN0IG9mIG5wbSBtb2R1bGUgZGlyZWN0b3JpZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc2NvdmVyKC4uLm1vZHVsZURpcnM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGpzaWk6IEpzaWlUeXBlcyA9IHt9O1xuXG4gIGNvbnN0IGRpc2NvdmVySnNpaSA9IChkaXI6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGpzaWlGaWxlID0gcGF0aC5qb2luKGRpciwgJy5qc2lpJyk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGpzaWlGaWxlKSkgeyByZXR1cm47IH0gLy8gbm8ganNpaSBtYW5pZmVzdFxuXG4gICAgY29uc3QgbWFuaWZlc3QgPSBmcy5yZWFkSnNvblN5bmMoanNpaUZpbGUpO1xuICAgIGZvciAoY29uc3QgW2ZxbiwgdHlwZV0gb2YgT2JqZWN0LmVudHJpZXMobWFuaWZlc3QudHlwZXMgYXMgSnNpaVR5cGVzKSkge1xuICAgICAganNpaVtmcW5dID0gdHlwZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gcmVhZCBhbGwgLmpzaWkgbWFuaWZlc3RzIGZyb20gYWxsIG1vZHVsZXMgKGluY2wuIHByb2plbiBpdHNlbGYpIGFuZCBtZXJnZVxuICAvLyB0aGVtIGFsbCBpbnRvIGEgc2luZ2xlIG1hcCBvZiBmcW4tPnR5cGUuXG4gIGZvciAoY29uc3QgZGlyIG9mIFsuLi5tb2R1bGVEaXJzLCBQUk9KRU5fTU9EVUxFX1JPT1RdKSB7XG4gICAgZGlzY292ZXJKc2lpKGRpcik7XG5cbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdAJykgJiYgZnMubHN0YXRTeW5jKGRpcikuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc3QgY2hpbGREaXJzID0gZnMucmVhZGRpclN5bmMoZGlyKS5tYXAoZmlsZSA9PiBwYXRoLmpvaW4oZGlyLCBmaWxlKSk7XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkRGlycykge1xuICAgICAgICBkaXNjb3ZlckpzaWkoY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheTxQcm9qZWN0VHlwZT4oKTtcblxuICBmb3IgKGNvbnN0IFtmcW4sIHR5cGVpbmZvXSBvZiBPYmplY3QuZW50cmllcyhqc2lpKSkge1xuICAgIGlmICghaXNQcm9qZWN0VHlwZShqc2lpLCBmcW4pKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBwcm9qZW4ud2ViLlJlYWN0UHJvamVjdCAtPiB3ZWIuUmVhY3RQcm9qZWN0XG4gICAgY29uc3QgdHlwZW5hbWUgPSBmcW4uc3Vic3RyaW5nKGZxbi5pbmRleE9mKCcuJykgKyAxKTtcblxuICAgIGNvbnN0IGRvY3N1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3Byb2plbi9wcm9qZW4vYmxvYi9tYXN0ZXIvQVBJLm1kI3Byb2plbi0ke3R5cGVuYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCl9YDtcbiAgICBsZXQgcGppZCA9IHR5cGVpbmZvLmRvY3M/LmN1c3RvbT8ucGppZCA/PyBkZWNhbWVsaXplKHR5cGVuYW1lKS5yZXBsYWNlKC9fcHJvamVjdCQvLCAnJyk7XG4gICAgcmVzdWx0LnB1c2goe1xuICAgICAgbW9kdWxlTmFtZTogdHlwZWluZm8uYXNzZW1ibHksXG4gICAgICB0eXBlbmFtZSxcbiAgICAgIHBqaWQsXG4gICAgICBmcW4sXG4gICAgICBvcHRpb25zOiBkaXNjb3Zlck9wdGlvbnMoanNpaSwgZnFuKS5zb3J0KChvMSwgbzIpID0+IG8xLm5hbWUubG9jYWxlQ29tcGFyZShvMi5uYW1lKSksXG4gICAgICBkb2NzOiB0eXBlaW5mby5kb2NzPy5zdW1tYXJ5LFxuICAgICAgZG9jc3VybCxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc29ydCgocjEsIHIyKSA9PiByMS5wamlkLmxvY2FsZUNvbXBhcmUocjIucGppZCkpO1xufVxuXG5mdW5jdGlvbiBkaXNjb3Zlck9wdGlvbnMoanNpaTogSnNpaVR5cGVzLCBmcW46IHN0cmluZyk6IFByb2plY3RPcHRpb25bXSB7XG4gIGNvbnN0IG9wdGlvbnM6IHsgW25hbWU6IHN0cmluZ106IFByb2plY3RPcHRpb24gfSA9IHt9O1xuICBjb25zdCBwYXJhbXMgPSBqc2lpW2Zxbl0/LmluaXRpYWxpemVyPy5wYXJhbWV0ZXJzID8/IFtdO1xuICBjb25zdCBvcHRpb25zUGFyYW0gPSBwYXJhbXNbMF07XG4gIGNvbnN0IG9wdGlvbnNUeXBlRnFuID0gb3B0aW9uc1BhcmFtPy50eXBlPy5mcW47XG5cbiAgaWYgKHBhcmFtcy5sZW5ndGggPiAxIHx8IChwYXJhbXMubGVuZ3RoID09PSAxICYmIG9wdGlvbnNQYXJhbT8ubmFtZSAhPT0gJ29wdGlvbnMnKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgY29uc3RydWN0b3IgZm9yIHByb2plY3QgJHtmcW59IG11c3QgaGF2ZSBhIHNpbmdsZSBcIm9wdGlvbnNcIiBhcmd1bWVudCBvZiBhIHN0cnVjdCB0eXBlLiBnb3QgJHtKU09OLnN0cmluZ2lmeShwYXJhbXMpfWApO1xuICB9XG5cbiAgYWRkT3B0aW9ucyhvcHRpb25zVHlwZUZxbik7XG5cbiAgY29uc3Qgb3B0cyA9IE9iamVjdC52YWx1ZXMob3B0aW9ucyk7XG5cbiAgcmV0dXJuIG9wdHMuc29ydCgoYSwgYikgPT4gYS5zd2l0Y2gubG9jYWxlQ29tcGFyZShiLnN3aXRjaCkpO1xuXG4gIGZ1bmN0aW9uIGFkZE9wdGlvbnMob2Zxbj86IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZ1tdID0gW10sIG9wdGlvbmFsID0gZmFsc2UpIHtcbiAgICBpZiAoIW9mcW4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJ1Y3QgPSBqc2lpW29mcW5dO1xuICAgIGlmICghc3RydWN0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuYWJsZSB0byBmaW5kIG9wdGlvbnMgdHlwZSAke29mcW59IGZvciBwcm9qZWN0ICR7ZnFufWApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcHJvcCBvZiBzdHJ1Y3QucHJvcGVydGllcyA/PyBbXSkge1xuICAgICAgY29uc3QgcHJvcFBhdGggPSBbLi4uYmFzZVBhdGgsIHByb3AubmFtZV07XG5cbiAgICAgIC8vIHByb3RlY3QgYWdhaW5zdCBkb3VibGUtYm9va2luZ1xuICAgICAgaWYgKHByb3AubmFtZSBpbiBvcHRpb25zKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZHVwbGljYXRlIG9wdGlvbiBcIiR7cHJvcC5uYW1lfVwiIGluICR7ZnFufSAoYWxyZWFkeSBkZWNsYXJlZCBpbiAke29wdGlvbnNbcHJvcC5uYW1lXS5wYXJlbnR9KWApO1xuICAgICAgfVxuXG4gICAgICBsZXQgdHlwZU5hbWU7XG4gICAgICBpZiAocHJvcC50eXBlPy5wcmltaXRpdmUpIHtcbiAgICAgICAgdHlwZU5hbWUgPSBwcm9wLnR5cGU/LnByaW1pdGl2ZTsgLy8gZS5nLiAnc3RyaW5nJywgJ2Jvb2xlYW4nLCAnbnVtYmVyJ1xuICAgICAgfSBlbHNlIGlmIChwcm9wLnR5cGU/LmZxbikge1xuICAgICAgICB0eXBlTmFtZSA9IHByb3AudHlwZT8uZnFuLnNwbGl0KCcuJykucG9wKCk7IC8vIHByb2plbi5Ob2RlUHJvamVjdE9wdGlvbnMgLT4gTm9kZVByb2plY3RPcHRpb25zXG4gICAgICB9IGVsc2UgeyAvLyBhbnkgb3RoZXIgdHlwZXMgc3VjaCBhcyBjb2xsZWN0aW9uIHR5cGVzXG4gICAgICAgIHR5cGVOYW1lID0gJ3Vua25vd24nO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc09wdGlvbmFsID0gb3B0aW9uYWwgfHwgcHJvcC5vcHRpb25hbDtcbiAgICAgIGxldCBkZWZhdWx0VmFsdWUgPSBwcm9wLmRvY3M/LmRlZmF1bHQ7XG5cbiAgICAgIGlmIChkZWZhdWx0VmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhpcyBpcyBhIG1hbmRhdG9yeSBvcHRpb24gYW5kIHdlIGhhdmUgYSBkZWZhdWx0IHZhbHVlLCBpdCBoYXMgdG8gYmUgSlNPTi1wYXJzYWJsZSB0byB0aGUgY29ycmVjdCB0eXBlXG4gICAgICBpZiAoIWlzT3B0aW9uYWwgJiYgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgIGlmICghcHJvcC50eXBlPy5wcmltaXRpdmUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHJlcXVpcmVkIG9wdGlvbiBcIiR7cHJvcC5uYW1lfVwiIHdpdGggYSBAZGVmYXVsdCBtdXN0IHVzZSBwcmltaXRpdmUgdHlwZXMgKHN0cmluZywgbnVtYmVyIG9yIGJvb2xlYW4pLiB0eXBlIGZvdW5kIGlzOiAke3R5cGVOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hlY2tEZWZhdWx0SXNQYXJzYWJsZShwcm9wLm5hbWUsIGRlZmF1bHRWYWx1ZSwgcHJvcC50eXBlPy5wcmltaXRpdmUpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zW3Byb3AubmFtZV0gPSBmaWx0ZXJVbmRlZmluZWQoe1xuICAgICAgICBwYXRoOiBwcm9wUGF0aCxcbiAgICAgICAgcGFyZW50OiBzdHJ1Y3QubmFtZSxcbiAgICAgICAgbmFtZTogcHJvcC5uYW1lLFxuICAgICAgICBkb2NzOiBwcm9wLmRvY3Muc3VtbWFyeSxcbiAgICAgICAgdHlwZTogdHlwZU5hbWUsXG4gICAgICAgIHN3aXRjaDogcHJvcFBhdGgubWFwKHAgPT4gZGVjYW1lbGl6ZShwKS5yZXBsYWNlKC9fL2csICctJykpLmpvaW4oJy0nKSxcbiAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICBvcHRpb25hbDogaXNPcHRpb25hbCxcbiAgICAgICAgZGVwcmVjYXRlZDogcHJvcC5kb2NzLnN0YWJpbGl0eSA9PT0gJ2RlcHJlY2F0ZWQnID8gdHJ1ZSA6IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgaWZjIG9mIHN0cnVjdC5pbnRlcmZhY2VzID8/IFtdKSB7XG4gICAgICBhZGRPcHRpb25zKGlmYyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlclVuZGVmaW5lZChvYmo6IGFueSkge1xuICBjb25zdCByZXQ6IGFueSA9IHt9O1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0W2tdID0gdjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gaXNQcm9qZWN0VHlwZShqc2lpOiBKc2lpVHlwZXMsIGZxbjogc3RyaW5nKSB7XG4gIGNvbnN0IHR5cGUgPSBqc2lpW2Zxbl07XG5cbiAgaWYgKHR5cGUua2luZCAhPT0gJ2NsYXNzJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZS5hYnN0cmFjdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlLmRvY3M/LmRlcHJlY2F0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBsZXQgY3VyciA9IHR5cGU7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgaWYgKGN1cnIuZnFuID09PSBQUk9KRUNUX0JBU0VfRlFOKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWN1cnIuYmFzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGN1cnIgPSBqc2lpW2N1cnIuYmFzZV07XG4gICAgaWYgKCFjdXJyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrRGVmYXVsdElzUGFyc2FibGUocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgLy8gbWFjcm9zIGFyZSBwYXNzLXRocm91Z2hcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJyQnKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgIGlmICh0eXBlb2YocGFyc2VkKSAhPT0gdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcGFyc2UgQGRlZmF1bHQgdmFsdWUgZm9yIG1hbmRhdG9yeSBvcHRpb24gJHtwcm9wfSBhcyBhICR7dHlwZX06ICR7cGFyc2VkfWApO1xuICAgIH1cblxuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGB1bmFibGUgdG8gSlNPTi5wYXJzZSgpIHZhbHVlIFwiJHt2YWx1ZX1cIiBzcGVjaWZpZWQgYXMgQGRlZmF1bHQgZm9yIG1hbmRhdG9yeSBvcHRpb24gXCIke3Byb3B9XCI6ICR7ZS5tZXNzYWdlfWApO1xuICB9XG59Il19