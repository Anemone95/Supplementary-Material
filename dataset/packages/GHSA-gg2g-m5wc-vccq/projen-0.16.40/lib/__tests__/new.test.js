"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tests for `projen new`: we run `projen new` for each supported project type
// and compare against a golden snapshot.
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const common_1 = require("../common");
const inventory = require("../inventory");
const util_1 = require("./util");
for (const type of inventory.discover()) {
    test(`projen new ${type.pjid}`, () => {
        const outdir = util_1.mkdtemp();
        try {
            const projectdir = createProjectDir(outdir);
            // execute `projen new PJID --no-synth` in the project directory
            util_1.execProjenCLI(projectdir, ['new', '--no-synth', type.pjid]);
            // compare generated .projenrc.js to the snapshot
            const projenrc = fs_extra_1.readFileSync(path_1.join(projectdir, common_1.PROJEN_RC), 'utf-8');
            expect(projenrc).toMatchSnapshot();
        }
        finally {
            fs_extra_1.removeSync(outdir);
        }
    });
}
test('post-synthesis option enabled', () => {
    const project = new util_1.TestProject();
    expect(util_1.synthSnapshotWithPost(project)['.postsynth']).toContain('postsynth');
});
test('post-synthesis option disabled', () => {
    const project = new util_1.TestProject();
    expect(util_1.synthSnapshot(project)['.postsynth']).toBeUndefined();
});
function createProjectDir(workdir) {
    // create project under "my-project" so that basedir is deterministic
    const projectdir = path_1.join(workdir, 'my-project');
    fs_extra_1.mkdirSync(projectdir);
    const git = (command) => child_process_1.execSync(`git ${command}`, { cwd: projectdir });
    git('init');
    git('remote add origin git@boom.com:foo/bar.git');
    git('config user.name "My User Name"');
    git('config user.email "my@user.email.com"');
    return projectdir;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvX190ZXN0c19fL25ldy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOEVBQThFO0FBQzlFLHlDQUF5QztBQUN6QyxpREFBeUM7QUFDekMsK0JBQTRCO0FBQzVCLHVDQUErRDtBQUMvRCxzQ0FBc0M7QUFDdEMsMENBQTBDO0FBQzFDLGlDQUFtRztBQUVuRyxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtJQUN2QyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFO1FBQ25DLE1BQU0sTUFBTSxHQUFHLGNBQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUk7WUFDRixNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU1QyxnRUFBZ0U7WUFDaEUsb0JBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRTVELGlEQUFpRDtZQUNqRCxNQUFNLFFBQVEsR0FBRyx1QkFBWSxDQUFDLFdBQUksQ0FBQyxVQUFVLEVBQUUsa0JBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUNwQztnQkFBUztZQUNSLHFCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEI7SUFDSCxDQUFDLENBQUMsQ0FBQztDQUNKO0FBRUQsSUFBSSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtJQUN6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFXLEVBQUUsQ0FBQztJQUVsQyxNQUFNLENBQUMsNEJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUUsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO0lBQzFDLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO0lBRWxDLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLGdCQUFnQixDQUFDLE9BQWU7SUFDdkMscUVBQXFFO0lBQ3JFLE1BQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDL0Msb0JBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV0QixNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsd0JBQVEsQ0FBQyxPQUFPLE9BQU8sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ1osR0FBRyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7SUFDbEQsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDdkMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDN0MsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRlc3RzIGZvciBgcHJvamVuIG5ld2A6IHdlIHJ1biBgcHJvamVuIG5ld2AgZm9yIGVhY2ggc3VwcG9ydGVkIHByb2plY3QgdHlwZVxuLy8gYW5kIGNvbXBhcmUgYWdhaW5zdCBhIGdvbGRlbiBzbmFwc2hvdC5cbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBta2RpclN5bmMsIHJlYWRGaWxlU3luYywgcmVtb3ZlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IFBST0pFTl9SQyB9IGZyb20gJy4uL2NvbW1vbic7XG5pbXBvcnQgKiBhcyBpbnZlbnRvcnkgZnJvbSAnLi4vaW52ZW50b3J5JztcbmltcG9ydCB7IGV4ZWNQcm9qZW5DTEksIG1rZHRlbXAsIHN5bnRoU25hcHNob3QsIHN5bnRoU25hcHNob3RXaXRoUG9zdCwgVGVzdFByb2plY3QgfSBmcm9tICcuL3V0aWwnO1xuXG5mb3IgKGNvbnN0IHR5cGUgb2YgaW52ZW50b3J5LmRpc2NvdmVyKCkpIHtcbiAgdGVzdChgcHJvamVuIG5ldyAke3R5cGUucGppZH1gLCAoKSA9PiB7XG4gICAgY29uc3Qgb3V0ZGlyID0gbWtkdGVtcCgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwcm9qZWN0ZGlyID0gY3JlYXRlUHJvamVjdERpcihvdXRkaXIpO1xuXG4gICAgICAvLyBleGVjdXRlIGBwcm9qZW4gbmV3IFBKSUQgLS1uby1zeW50aGAgaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5XG4gICAgICBleGVjUHJvamVuQ0xJKHByb2plY3RkaXIsIFsnbmV3JywgJy0tbm8tc3ludGgnLCB0eXBlLnBqaWRdKTtcblxuICAgICAgLy8gY29tcGFyZSBnZW5lcmF0ZWQgLnByb2plbnJjLmpzIHRvIHRoZSBzbmFwc2hvdFxuICAgICAgY29uc3QgcHJvamVucmMgPSByZWFkRmlsZVN5bmMoam9pbihwcm9qZWN0ZGlyLCBQUk9KRU5fUkMpLCAndXRmLTgnKTtcbiAgICAgIGV4cGVjdChwcm9qZW5yYykudG9NYXRjaFNuYXBzaG90KCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHJlbW92ZVN5bmMob3V0ZGlyKTtcbiAgICB9XG4gIH0pO1xufVxuXG50ZXN0KCdwb3N0LXN5bnRoZXNpcyBvcHRpb24gZW5hYmxlZCcsICgpID0+IHtcbiAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gIGV4cGVjdChzeW50aFNuYXBzaG90V2l0aFBvc3QocHJvamVjdClbJy5wb3N0c3ludGgnXSkudG9Db250YWluKCdwb3N0c3ludGgnKTtcbn0pO1xuXG50ZXN0KCdwb3N0LXN5bnRoZXNpcyBvcHRpb24gZGlzYWJsZWQnLCAoKSA9PiB7XG4gIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcm9qZWN0KVsnLnBvc3RzeW50aCddKS50b0JlVW5kZWZpbmVkKCk7XG59KTtcblxuZnVuY3Rpb24gY3JlYXRlUHJvamVjdERpcih3b3JrZGlyOiBzdHJpbmcpIHtcbiAgLy8gY3JlYXRlIHByb2plY3QgdW5kZXIgXCJteS1wcm9qZWN0XCIgc28gdGhhdCBiYXNlZGlyIGlzIGRldGVybWluaXN0aWNcbiAgY29uc3QgcHJvamVjdGRpciA9IGpvaW4od29ya2RpciwgJ215LXByb2plY3QnKTtcbiAgbWtkaXJTeW5jKHByb2plY3RkaXIpO1xuXG4gIGNvbnN0IGdpdCA9IChjb21tYW5kOiBzdHJpbmcpID0+IGV4ZWNTeW5jKGBnaXQgJHtjb21tYW5kfWAsIHsgY3dkOiBwcm9qZWN0ZGlyIH0pO1xuICBnaXQoJ2luaXQnKTtcbiAgZ2l0KCdyZW1vdGUgYWRkIG9yaWdpbiBnaXRAYm9vbS5jb206Zm9vL2Jhci5naXQnKTtcbiAgZ2l0KCdjb25maWcgdXNlci5uYW1lIFwiTXkgVXNlciBOYW1lXCInKTtcbiAgZ2l0KCdjb25maWcgdXNlci5lbWFpbCBcIm15QHVzZXIuZW1haWwuY29tXCInKTtcbiAgcmV0dXJuIHByb2plY3RkaXI7XG59Il19