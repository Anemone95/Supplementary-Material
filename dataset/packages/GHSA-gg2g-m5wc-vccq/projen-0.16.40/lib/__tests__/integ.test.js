"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const glob_1 = require("glob");
const util_1 = require("./util");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const projenVersion = require('../../package.json').version;
const samples = path_1.join(__dirname, '..', '..', 'src', '__tests__', 'integration');
const files = glob_1.glob.sync('**/*.projenrc.js', { cwd: samples });
for (const projenrc of files) {
    test(path_1.basename(projenrc, '.projenrc.js'), () => {
        const workdir = util_1.mkdtemp();
        const base = path_1.join(samples, path_1.dirname(projenrc));
        if (base !== samples) {
            fs_extra_1.copySync(base, workdir, { recursive: true });
        }
        fs_extra_1.copySync(path_1.join(samples, projenrc), path_1.join(workdir, '.projenrc.js'));
        util_1.execProjenCLI(workdir, ['--no-post']);
        // patch the projen version in package.json to match the current version
        // otherwise, every bump would need to update these snapshots.
        sanitizeOutput(workdir);
        expect(util_1.directorySnapshot(workdir, { excludeGlobs: ['node_modules/**'] })).toMatchSnapshot();
    });
}
/**
 * Removes any non-determinstic aspects from the synthesized output.
 * @param dir The output directory.
 */
function sanitizeOutput(dir) {
    const filepath = path_1.join(dir, 'package.json');
    const pkg = fs_extra_1.readJsonSync(filepath);
    const prev = pkg.devDependencies.projen;
    if (!prev) {
        throw new Error(`expecting "${filepath}" to include a devDependency on "projen"`);
    }
    // replace the current projen version with 999.999.999 for deterministic output.
    // this will preserve any semantic version requirements (e.g. "^", "~", etc).
    pkg.devDependencies.projen = prev.replace(projenVersion, '999.999.999');
    fs_extra_1.writeJsonSync(filepath, pkg);
    // we will also patch deps.json so that all projen deps will be set to 999.999.999
    const depsPath = path_1.join(dir, '.projen', 'deps.json');
    const deps = fs_extra_1.readJsonSync(depsPath);
    for (const dep of deps.dependencies) {
        if (dep.name === 'projen') {
            dep.version = dep.version.replace(projenVersion, '999.999.999');
        }
    }
    fs_extra_1.chmodSync(depsPath, '777');
    fs_extra_1.writeJsonSync(depsPath, deps);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9fX3Rlc3RzX18vaW50ZWcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQztBQUMvQyx1Q0FBNEU7QUFDNUUsK0JBQTRCO0FBQzVCLGlDQUFtRTtBQUVuRSxpRUFBaUU7QUFDakUsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzVELE1BQU0sT0FBTyxHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sS0FBSyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUU5RCxLQUFLLE1BQU0sUUFBUSxJQUFJLEtBQUssRUFBRTtJQUM1QixJQUFJLENBQUMsZUFBUSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDNUMsTUFBTSxPQUFPLEdBQUcsY0FBTyxFQUFFLENBQUM7UUFDMUIsTUFBTSxJQUFJLEdBQUcsV0FBSSxDQUFDLE9BQU8sRUFBRSxjQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM5QyxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDcEIsbUJBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDOUM7UUFDRCxtQkFBUSxDQUFDLFdBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsV0FBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLG9CQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUV0Qyx3RUFBd0U7UUFDeEUsOERBQThEO1FBQzlELGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV4QixNQUFNLENBQUMsd0JBQWlCLENBQUMsT0FBTyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUM5RixDQUFDLENBQUMsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsR0FBVztJQUNqQyxNQUFNLFFBQVEsR0FBRyxXQUFJLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sR0FBRyxHQUFHLHVCQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDeEMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxRQUFRLDBDQUEwQyxDQUFDLENBQUM7S0FDbkY7SUFFRCxnRkFBZ0Y7SUFDaEYsNkVBQTZFO0lBQzdFLEdBQUcsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3hFLHdCQUFhLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTdCLGtGQUFrRjtJQUNsRixNQUFNLFFBQVEsR0FBRyxXQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNuRCxNQUFNLElBQUksR0FBRyx1QkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNuQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3pCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQ2pFO0tBQ0Y7SUFDRCxvQkFBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzQix3QkFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgam9pbiwgZGlybmFtZSwgYmFzZW5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGNobW9kU3luYywgY29weVN5bmMsIHJlYWRKc29uU3luYywgd3JpdGVKc29uU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGdsb2IgfSBmcm9tICdnbG9iJztcbmltcG9ydCB7IG1rZHRlbXAsIGRpcmVjdG9yeVNuYXBzaG90LCBleGVjUHJvamVuQ0xJIH0gZnJvbSAnLi91dGlsJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbmNvbnN0IHByb2plblZlcnNpb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uO1xuY29uc3Qgc2FtcGxlcyA9IGpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnc3JjJywgJ19fdGVzdHNfXycsICdpbnRlZ3JhdGlvbicpO1xuY29uc3QgZmlsZXMgPSBnbG9iLnN5bmMoJyoqLyoucHJvamVucmMuanMnLCB7IGN3ZDogc2FtcGxlcyB9KTtcblxuZm9yIChjb25zdCBwcm9qZW5yYyBvZiBmaWxlcykge1xuICB0ZXN0KGJhc2VuYW1lKHByb2plbnJjLCAnLnByb2plbnJjLmpzJyksICgpID0+IHtcbiAgICBjb25zdCB3b3JrZGlyID0gbWtkdGVtcCgpO1xuICAgIGNvbnN0IGJhc2UgPSBqb2luKHNhbXBsZXMsIGRpcm5hbWUocHJvamVucmMpKTtcbiAgICBpZiAoYmFzZSAhPT0gc2FtcGxlcykge1xuICAgICAgY29weVN5bmMoYmFzZSwgd29ya2RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuICAgIGNvcHlTeW5jKGpvaW4oc2FtcGxlcywgcHJvamVucmMpLCBqb2luKHdvcmtkaXIsICcucHJvamVucmMuanMnKSk7XG4gICAgZXhlY1Byb2plbkNMSSh3b3JrZGlyLCBbJy0tbm8tcG9zdCddKTtcblxuICAgIC8vIHBhdGNoIHRoZSBwcm9qZW4gdmVyc2lvbiBpbiBwYWNrYWdlLmpzb24gdG8gbWF0Y2ggdGhlIGN1cnJlbnQgdmVyc2lvblxuICAgIC8vIG90aGVyd2lzZSwgZXZlcnkgYnVtcCB3b3VsZCBuZWVkIHRvIHVwZGF0ZSB0aGVzZSBzbmFwc2hvdHMuXG4gICAgc2FuaXRpemVPdXRwdXQod29ya2Rpcik7XG5cbiAgICBleHBlY3QoZGlyZWN0b3J5U25hcHNob3Qod29ya2RpciwgeyBleGNsdWRlR2xvYnM6IFsnbm9kZV9tb2R1bGVzLyoqJ10gfSkpLnRvTWF0Y2hTbmFwc2hvdCgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFueSBub24tZGV0ZXJtaW5zdGljIGFzcGVjdHMgZnJvbSB0aGUgc3ludGhlc2l6ZWQgb3V0cHV0LlxuICogQHBhcmFtIGRpciBUaGUgb3V0cHV0IGRpcmVjdG9yeS5cbiAqL1xuZnVuY3Rpb24gc2FuaXRpemVPdXRwdXQoZGlyOiBzdHJpbmcpIHtcbiAgY29uc3QgZmlsZXBhdGggPSBqb2luKGRpciwgJ3BhY2thZ2UuanNvbicpO1xuICBjb25zdCBwa2cgPSByZWFkSnNvblN5bmMoZmlsZXBhdGgpO1xuICBjb25zdCBwcmV2ID0gcGtnLmRldkRlcGVuZGVuY2llcy5wcm9qZW47XG4gIGlmICghcHJldikge1xuICAgIHRocm93IG5ldyBFcnJvcihgZXhwZWN0aW5nIFwiJHtmaWxlcGF0aH1cIiB0byBpbmNsdWRlIGEgZGV2RGVwZW5kZW5jeSBvbiBcInByb2plblwiYCk7XG4gIH1cblxuICAvLyByZXBsYWNlIHRoZSBjdXJyZW50IHByb2plbiB2ZXJzaW9uIHdpdGggOTk5Ljk5OS45OTkgZm9yIGRldGVybWluaXN0aWMgb3V0cHV0LlxuICAvLyB0aGlzIHdpbGwgcHJlc2VydmUgYW55IHNlbWFudGljIHZlcnNpb24gcmVxdWlyZW1lbnRzIChlLmcuIFwiXlwiLCBcIn5cIiwgZXRjKS5cbiAgcGtnLmRldkRlcGVuZGVuY2llcy5wcm9qZW4gPSBwcmV2LnJlcGxhY2UocHJvamVuVmVyc2lvbiwgJzk5OS45OTkuOTk5Jyk7XG4gIHdyaXRlSnNvblN5bmMoZmlsZXBhdGgsIHBrZyk7XG5cbiAgLy8gd2Ugd2lsbCBhbHNvIHBhdGNoIGRlcHMuanNvbiBzbyB0aGF0IGFsbCBwcm9qZW4gZGVwcyB3aWxsIGJlIHNldCB0byA5OTkuOTk5Ljk5OVxuICBjb25zdCBkZXBzUGF0aCA9IGpvaW4oZGlyLCAnLnByb2plbicsICdkZXBzLmpzb24nKTtcbiAgY29uc3QgZGVwcyA9IHJlYWRKc29uU3luYyhkZXBzUGF0aCk7XG4gIGZvciAoY29uc3QgZGVwIG9mIGRlcHMuZGVwZW5kZW5jaWVzKSB7XG4gICAgaWYgKGRlcC5uYW1lID09PSAncHJvamVuJykge1xuICAgICAgZGVwLnZlcnNpb24gPSBkZXAudmVyc2lvbi5yZXBsYWNlKHByb2plblZlcnNpb24sICc5OTkuOTk5Ljk5OScpO1xuICAgIH1cbiAgfVxuICBjaG1vZFN5bmMoZGVwc1BhdGgsICc3NzcnKTtcbiAgd3JpdGVKc29uU3luYyhkZXBzUGF0aCwgZGVwcyk7XG59Il19