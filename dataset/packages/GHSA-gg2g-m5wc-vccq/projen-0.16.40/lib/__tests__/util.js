"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directorySnapshot = exports.synthSnapshotWithPost = exports.synthSnapshot = exports.mkdtemp = exports.execProjenCLI = exports.TestProject = void 0;
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const glob_1 = require("glob");
const __1 = require("..");
const logging = require("../logging");
const util_1 = require("../util");
const PROJEN_CLI = require.resolve('../../bin/projen');
logging.disable(); // no logging during tests
class TestProject extends __1.Project {
    constructor(options = {}) {
        const tmpdir = mkdtemp();
        super({
            name: 'my-project',
            outdir: tmpdir,
            clobber: false,
            logging: {
                level: __1.LogLevel.OFF,
            },
            ...options,
        });
    }
    postSynthesize() {
        fs.writeFileSync(path.join(this.outdir, '.postsynth'), '# postsynth');
    }
}
exports.TestProject = TestProject;
function execProjenCLI(workdir, args = []) {
    const command = [
        process.execPath,
        PROJEN_CLI,
        ...args,
    ];
    return util_1.exec(command.map(x => `"${x}"`).join(' '), { cwd: workdir });
}
exports.execProjenCLI = execProjenCLI;
function mkdtemp() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'projen-test-'));
}
exports.mkdtemp = mkdtemp;
function synthSnapshot(project) {
    const ENV_PROJEN_DISABLE_POST = process.env.PROJEN_DISABLE_POST;
    try {
        process.env.PROJEN_DISABLE_POST = 'true';
        project.synth();
        return directorySnapshot(project.outdir);
    }
    finally {
        fs.removeSync(project.outdir);
        // values assigned to process.env.XYZ are automatically converted to strings
        if (ENV_PROJEN_DISABLE_POST === undefined) {
            delete process.env.PROJEN_DISABLE_POST;
        }
        else {
            process.env.PROJEN_DISABLE_POST = ENV_PROJEN_DISABLE_POST;
        }
    }
}
exports.synthSnapshot = synthSnapshot;
function synthSnapshotWithPost(project) {
    try {
        project.synth();
        return directorySnapshot(project.outdir);
    }
    finally {
        fs.removeSync(project.outdir);
    }
}
exports.synthSnapshotWithPost = synthSnapshotWithPost;
function directorySnapshot(root, options = {}) {
    var _a;
    const output = {};
    const files = glob_1.glob.sync('**', {
        ignore: (_a = options.excludeGlobs) !== null && _a !== void 0 ? _a : [],
        cwd: root,
        nodir: true,
        dot: true,
    }); // returns relative file paths with POSIX separators
    for (const file of files) {
        const filePath = path.join(root, file);
        let content;
        if (path.extname(filePath) === '.json') {
            content = fs.readJsonSync(filePath);
        }
        else {
            content = fs.readFileSync(filePath, 'utf-8');
        }
        output[file] = content;
    }
    return output;
}
exports.directorySnapshot = directorySnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9fX3Rlc3RzX18vdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwrQkFBNEI7QUFDNUIsMEJBQXVEO0FBQ3ZELHNDQUFzQztBQUN0QyxrQ0FBK0I7QUFFL0IsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRXZELE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjtBQUU3QyxNQUFhLFdBQVksU0FBUSxXQUFPO0lBQ3RDLFlBQVksVUFBd0MsRUFBRTtRQUNwRCxNQUFNLE1BQU0sR0FBRyxPQUFPLEVBQUUsQ0FBQztRQUN6QixLQUFLLENBQUM7WUFDSixJQUFJLEVBQUUsWUFBWTtZQUNsQixNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxLQUFLO1lBQ2QsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxZQUFRLENBQUMsR0FBRzthQUNwQjtZQUNELEdBQUcsT0FBTztTQUNYLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxjQUFjO1FBQ1osRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNGO0FBakJELGtDQWlCQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxPQUFlLEVBQUUsT0FBaUIsRUFBRTtJQUNoRSxNQUFNLE9BQU8sR0FBRztRQUNkLE9BQU8sQ0FBQyxRQUFRO1FBQ2hCLFVBQVU7UUFDVixHQUFHLElBQUk7S0FDUixDQUFDO0lBQ0YsT0FBTyxXQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN0RSxDQUFDO0FBUEQsc0NBT0M7QUFNRCxTQUFnQixPQUFPO0lBQ3JCLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFGRCwwQkFFQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxPQUFnQjtJQUM1QyxNQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7SUFDaEUsSUFBSTtRQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQztZQUFTO1FBQ1IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUIsNEVBQTRFO1FBQzVFLElBQUksdUJBQXVCLEtBQUssU0FBUyxFQUFFO1lBQ3pDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztTQUN4QzthQUFNO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyx1QkFBdUIsQ0FBQztTQUMzRDtLQUNGO0FBQ0gsQ0FBQztBQWhCRCxzQ0FnQkM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxPQUFnQjtJQUNwRCxJQUFJO1FBQ0YsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE9BQU8saUJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzFDO1lBQVM7UUFDUixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMvQjtBQUNILENBQUM7QUFQRCxzREFPQztBQVVELFNBQWdCLGlCQUFpQixDQUFDLElBQVksRUFBRSxVQUFvQyxFQUFHOztJQUNyRixNQUFNLE1BQU0sR0FBZ0IsRUFBRyxDQUFDO0lBRWhDLE1BQU0sS0FBSyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQzVCLE1BQU0sUUFBRSxPQUFPLENBQUMsWUFBWSxtQ0FBSSxFQUFFO1FBQ2xDLEdBQUcsRUFBRSxJQUFJO1FBQ1QsS0FBSyxFQUFFLElBQUk7UUFDWCxHQUFHLEVBQUUsSUFBSTtLQUNWLENBQUMsQ0FBQyxDQUFDLG9EQUFvRDtJQUV4RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV2QyxJQUFJLE9BQU8sQ0FBQztRQUNaLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDdEMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNMLE9BQU8sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM5QztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7S0FDeEI7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBeEJELDhDQXdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBnbG9iIH0gZnJvbSAnZ2xvYic7XG5pbXBvcnQgeyBMb2dMZXZlbCwgUHJvamVjdCwgUHJvamVjdE9wdGlvbnMgfSBmcm9tICcuLic7XG5pbXBvcnQgKiBhcyBsb2dnaW5nIGZyb20gJy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJy4uL3V0aWwnO1xuXG5jb25zdCBQUk9KRU5fQ0xJID0gcmVxdWlyZS5yZXNvbHZlKCcuLi8uLi9iaW4vcHJvamVuJyk7XG5cbmxvZ2dpbmcuZGlzYWJsZSgpOyAvLyBubyBsb2dnaW5nIGR1cmluZyB0ZXN0c1xuXG5leHBvcnQgY2xhc3MgVGVzdFByb2plY3QgZXh0ZW5kcyBQcm9qZWN0IHtcbiAgY29uc3RydWN0b3Iob3B0aW9uczogT21pdDxQcm9qZWN0T3B0aW9ucywgJ25hbWUnPiA9IHt9KSB7XG4gICAgY29uc3QgdG1wZGlyID0gbWtkdGVtcCgpO1xuICAgIHN1cGVyKHtcbiAgICAgIG5hbWU6ICdteS1wcm9qZWN0JyxcbiAgICAgIG91dGRpcjogdG1wZGlyLFxuICAgICAgY2xvYmJlcjogZmFsc2UsXG4gICAgICBsb2dnaW5nOiB7XG4gICAgICAgIGxldmVsOiBMb2dMZXZlbC5PRkYsXG4gICAgICB9LFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIHBvc3RTeW50aGVzaXplKCkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHRoaXMub3V0ZGlyLCAnLnBvc3RzeW50aCcpLCAnIyBwb3N0c3ludGgnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY1Byb2plbkNMSSh3b3JrZGlyOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdID0gW10pIHtcbiAgY29uc3QgY29tbWFuZCA9IFtcbiAgICBwcm9jZXNzLmV4ZWNQYXRoLFxuICAgIFBST0pFTl9DTEksXG4gICAgLi4uYXJncyxcbiAgXTtcbiAgcmV0dXJuIGV4ZWMoY29tbWFuZC5tYXAoeCA9PiBgXCIke3h9XCJgKS5qb2luKCcgJyksIHsgY3dkOiB3b3JrZGlyIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN5bnRoT3V0cHV0IHtcbiAgW2ZpbGVQYXRoOiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBta2R0ZW1wKCkge1xuICByZXR1cm4gZnMubWtkdGVtcFN5bmMocGF0aC5qb2luKG9zLnRtcGRpcigpLCAncHJvamVuLXRlc3QtJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3ludGhTbmFwc2hvdChwcm9qZWN0OiBQcm9qZWN0KTogYW55IHtcbiAgY29uc3QgRU5WX1BST0pFTl9ESVNBQkxFX1BPU1QgPSBwcm9jZXNzLmVudi5QUk9KRU5fRElTQUJMRV9QT1NUO1xuICB0cnkge1xuICAgIHByb2Nlc3MuZW52LlBST0pFTl9ESVNBQkxFX1BPU1QgPSAndHJ1ZSc7XG4gICAgcHJvamVjdC5zeW50aCgpO1xuICAgIHJldHVybiBkaXJlY3RvcnlTbmFwc2hvdChwcm9qZWN0Lm91dGRpcik7XG4gIH0gZmluYWxseSB7XG4gICAgZnMucmVtb3ZlU3luYyhwcm9qZWN0Lm91dGRpcik7XG5cbiAgICAvLyB2YWx1ZXMgYXNzaWduZWQgdG8gcHJvY2Vzcy5lbnYuWFlaIGFyZSBhdXRvbWF0aWNhbGx5IGNvbnZlcnRlZCB0byBzdHJpbmdzXG4gICAgaWYgKEVOVl9QUk9KRU5fRElTQUJMRV9QT1NUID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlbGV0ZSBwcm9jZXNzLmVudi5QUk9KRU5fRElTQUJMRV9QT1NUO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9jZXNzLmVudi5QUk9KRU5fRElTQUJMRV9QT1NUID0gRU5WX1BST0pFTl9ESVNBQkxFX1BPU1Q7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW50aFNuYXBzaG90V2l0aFBvc3QocHJvamVjdDogUHJvamVjdCkge1xuICB0cnkge1xuICAgIHByb2plY3Quc3ludGgoKTtcbiAgICByZXR1cm4gZGlyZWN0b3J5U25hcHNob3QocHJvamVjdC5vdXRkaXIpO1xuICB9IGZpbmFsbHkge1xuICAgIGZzLnJlbW92ZVN5bmMocHJvamVjdC5vdXRkaXIpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0b3J5U25hcHNob3RPcHRpb25zIHtcbiAgLyoqXG4gICAqIEdsb2JzIG9mIGZpbGVzIHRvIGV4Y2x1ZGUuXG4gICAqIEBkZWZhdWx0IFtdIGluY2x1ZGUgYWxsIGZpbGVzXG4gICAqL1xuICByZWFkb25seSBleGNsdWRlR2xvYnM/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdG9yeVNuYXBzaG90KHJvb3Q6IHN0cmluZywgb3B0aW9uczogRGlyZWN0b3J5U25hcHNob3RPcHRpb25zID0geyB9KSB7XG4gIGNvbnN0IG91dHB1dDogU3ludGhPdXRwdXQgPSB7IH07XG5cbiAgY29uc3QgZmlsZXMgPSBnbG9iLnN5bmMoJyoqJywge1xuICAgIGlnbm9yZTogb3B0aW9ucy5leGNsdWRlR2xvYnMgPz8gW10sXG4gICAgY3dkOiByb290LFxuICAgIG5vZGlyOiB0cnVlLFxuICAgIGRvdDogdHJ1ZSxcbiAgfSk7IC8vIHJldHVybnMgcmVsYXRpdmUgZmlsZSBwYXRocyB3aXRoIFBPU0lYIHNlcGFyYXRvcnNcblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihyb290LCBmaWxlKTtcblxuICAgIGxldCBjb250ZW50O1xuICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLmpzb24nKSB7XG4gICAgICBjb250ZW50ID0gZnMucmVhZEpzb25TeW5jKGZpbGVQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgfVxuXG4gICAgb3V0cHV0W2ZpbGVdID0gY29udGVudDtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59Il19