"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const java_project_1 = require("../../java/java-project");
const logger_1 = require("../../logger");
const util_1 = require("../util");
let cwd = process.cwd();
beforeEach(() => process.chdir(util_1.mkdtemp()));
afterEach(() => process.chdir(cwd));
test('defaults', () => {
    const p = new TestJavaProject();
    expect(util_1.synthSnapshot(p)).toMatchSnapshot();
});
test('pom options', () => {
    const p = new TestJavaProject({
        groupId: 'com.myorg',
        artifactId: 'play-202101050157',
    });
    snapPom(p);
});
test('dependencies', () => {
    const p = new TestJavaProject();
    p.pom.addDependency('software.amazon.awscdk/core@^1.2.3');
    p.pom.addTestDependency('org.assertj/assertj-core@3.18.1');
    p.pom.addPlugin('org.apache.maven.plugins/maven-compiler-plugin@3.8.1', {
        configuration: {
            source: '1.8',
            target: '1.8',
        },
    });
    snapPom(p);
});
test('dependencies via ctor', () => {
    const p = new TestJavaProject({
        deps: [
            'software.amazon.awscdk/core@^1.2.3',
            'software.amazon.awscdk/aws-s3@^1',
        ],
        testDeps: [
            'org.assertj/assertj-core@^3',
        ],
    });
    snapPom(p);
});
test('no junit', () => {
    const p = new TestJavaProject({
        junit: false,
    });
    expect(util_1.synthSnapshot(p)).toMatchSnapshot();
});
test('projenrc in java', () => {
    const p = new TestJavaProject();
    expect(util_1.synthSnapshot(p)['src/test/java/projenrc.java']).toMatchSnapshot();
});
test('disable projenrc in java', () => {
    const p = new TestJavaProject({
        projenrcJava: false,
    });
    expect(util_1.synthSnapshot(p)['src/test/java/projenrc.java']).toBeUndefined();
});
function snapPom(p) {
    expect(util_1.synthSnapshot(p)['pom.xml']).toMatchSnapshot();
}
class TestJavaProject extends java_project_1.JavaProject {
    constructor(options = {}) {
        // using a subdirectory to ensure synthSnapshot can clean up the project safely
        fs_extra_1.mkdirpSync('project-dir');
        super({
            ...options,
            // not using outdir: mkdtemp() since that will make snapshots non-deterministic
            outdir: './project-dir',
            groupId: 'org.acme',
            artifactId: 'my-artifact',
            name: 'test-project',
            version: '1.0.0',
            logging: { level: logger_1.LogLevel.OFF },
            jsiiFqn: 'projen.java.JavaProject',
            projenrcJavaOptions: {
                projenVersion: '^1.2.3',
            },
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YS1wcm9qZWN0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvX190ZXN0c19fL2phdmEvamF2YS1wcm9qZWN0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBc0M7QUFDdEMsMERBQTBFO0FBQzFFLHlDQUF3QztBQUN4QyxrQ0FBaUQ7QUFFakQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRXhCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRXBDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLE1BQU0sQ0FBQyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7SUFDaEMsTUFBTSxDQUFDLG9CQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUM3QyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLElBQUksZUFBZSxDQUFDO1FBQzVCLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLFVBQVUsRUFBRSxtQkFBbUI7S0FDaEMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtJQUN4QixNQUFNLENBQUMsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDMUQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQzNELENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHNEQUFzRCxFQUFFO1FBQ3RFLGFBQWEsRUFBRTtZQUNiLE1BQU0sRUFBRSxLQUFLO1lBQ2IsTUFBTSxFQUFFLEtBQUs7U0FDZDtLQUNGLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNiLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtJQUNqQyxNQUFNLENBQUMsR0FBRyxJQUFJLGVBQWUsQ0FBQztRQUM1QixJQUFJLEVBQUU7WUFDSixvQ0FBb0M7WUFDcEMsa0NBQWtDO1NBQ25DO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsNkJBQTZCO1NBQzlCO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtJQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLGVBQWUsQ0FBQztRQUM1QixLQUFLLEVBQUUsS0FBSztLQUNiLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxvQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDN0MsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzVCLE1BQU0sQ0FBQyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7SUFDaEMsTUFBTSxDQUFDLG9CQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzVFLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtJQUNwQyxNQUFNLENBQUMsR0FBRyxJQUFJLGVBQWUsQ0FBQztRQUM1QixZQUFZLEVBQUUsS0FBSztLQUNwQixDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsb0JBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDMUUsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLE9BQU8sQ0FBQyxDQUFjO0lBQzdCLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDeEQsQ0FBQztBQUVELE1BQU0sZUFBZ0IsU0FBUSwwQkFBVztJQUN2QyxZQUFZLFVBQXVDLEVBQUc7UUFDcEQsK0VBQStFO1FBQy9FLHFCQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFMUIsS0FBSyxDQUFDO1lBQ0osR0FBRyxPQUFPO1lBQ1YsK0VBQStFO1lBQy9FLE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLE9BQU8sRUFBRSxVQUFVO1lBQ25CLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxpQkFBUSxDQUFDLEdBQUcsRUFBRTtZQUNoQyxPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLG1CQUFtQixFQUFFO2dCQUNuQixhQUFhLEVBQUUsUUFBUTthQUN4QjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgbWtkaXJwU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IEphdmFQcm9qZWN0LCBKYXZhUHJvamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qYXZhL2phdmEtcHJvamVjdCc7XG5pbXBvcnQgeyBMb2dMZXZlbCB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBta2R0ZW1wLCBzeW50aFNuYXBzaG90IH0gZnJvbSAnLi4vdXRpbCc7XG5cbmxldCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuXG5iZWZvcmVFYWNoKCgpID0+IHByb2Nlc3MuY2hkaXIobWtkdGVtcCgpKSk7XG5hZnRlckVhY2goKCkgPT4gcHJvY2Vzcy5jaGRpcihjd2QpKTtcblxudGVzdCgnZGVmYXVsdHMnLCAoKSA9PiB7XG4gIGNvbnN0IHAgPSBuZXcgVGVzdEphdmFQcm9qZWN0KCk7XG4gIGV4cGVjdChzeW50aFNuYXBzaG90KHApKS50b01hdGNoU25hcHNob3QoKTtcbn0pO1xuXG50ZXN0KCdwb20gb3B0aW9ucycsICgpID0+IHtcbiAgY29uc3QgcCA9IG5ldyBUZXN0SmF2YVByb2plY3Qoe1xuICAgIGdyb3VwSWQ6ICdjb20ubXlvcmcnLFxuICAgIGFydGlmYWN0SWQ6ICdwbGF5LTIwMjEwMTA1MDE1NycsXG4gIH0pO1xuXG4gIHNuYXBQb20ocCk7XG59KTtcblxudGVzdCgnZGVwZW5kZW5jaWVzJywgKCkgPT4ge1xuICBjb25zdCBwID0gbmV3IFRlc3RKYXZhUHJvamVjdCgpO1xuICBwLnBvbS5hZGREZXBlbmRlbmN5KCdzb2Z0d2FyZS5hbWF6b24uYXdzY2RrL2NvcmVAXjEuMi4zJyk7XG4gIHAucG9tLmFkZFRlc3REZXBlbmRlbmN5KCdvcmcuYXNzZXJ0ai9hc3NlcnRqLWNvcmVAMy4xOC4xJyk7XG4gIHAucG9tLmFkZFBsdWdpbignb3JnLmFwYWNoZS5tYXZlbi5wbHVnaW5zL21hdmVuLWNvbXBpbGVyLXBsdWdpbkAzLjguMScsIHtcbiAgICBjb25maWd1cmF0aW9uOiB7XG4gICAgICBzb3VyY2U6ICcxLjgnLFxuICAgICAgdGFyZ2V0OiAnMS44JyxcbiAgICB9LFxuICB9KTtcbiAgc25hcFBvbShwKTtcbn0pO1xuXG50ZXN0KCdkZXBlbmRlbmNpZXMgdmlhIGN0b3InLCAoKSA9PiB7XG4gIGNvbnN0IHAgPSBuZXcgVGVzdEphdmFQcm9qZWN0KHtcbiAgICBkZXBzOiBbXG4gICAgICAnc29mdHdhcmUuYW1hem9uLmF3c2Nkay9jb3JlQF4xLjIuMycsXG4gICAgICAnc29mdHdhcmUuYW1hem9uLmF3c2Nkay9hd3MtczNAXjEnLFxuICAgIF0sXG4gICAgdGVzdERlcHM6IFtcbiAgICAgICdvcmcuYXNzZXJ0ai9hc3NlcnRqLWNvcmVAXjMnLFxuICAgIF0sXG4gIH0pO1xuICBzbmFwUG9tKHApO1xufSk7XG5cbnRlc3QoJ25vIGp1bml0JywgKCkgPT4ge1xuICBjb25zdCBwID0gbmV3IFRlc3RKYXZhUHJvamVjdCh7XG4gICAganVuaXQ6IGZhbHNlLFxuICB9KTtcblxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwKSkudG9NYXRjaFNuYXBzaG90KCk7XG59KTtcblxudGVzdCgncHJvamVucmMgaW4gamF2YScsICgpID0+IHtcbiAgY29uc3QgcCA9IG5ldyBUZXN0SmF2YVByb2plY3QoKTtcbiAgZXhwZWN0KHN5bnRoU25hcHNob3QocClbJ3NyYy90ZXN0L2phdmEvcHJvamVucmMuamF2YSddKS50b01hdGNoU25hcHNob3QoKTtcbn0pO1xuXG50ZXN0KCdkaXNhYmxlIHByb2plbnJjIGluIGphdmEnLCAoKSA9PiB7XG4gIGNvbnN0IHAgPSBuZXcgVGVzdEphdmFQcm9qZWN0KHtcbiAgICBwcm9qZW5yY0phdmE6IGZhbHNlLFxuICB9KTtcblxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwKVsnc3JjL3Rlc3QvamF2YS9wcm9qZW5yYy5qYXZhJ10pLnRvQmVVbmRlZmluZWQoKTtcbn0pO1xuXG5mdW5jdGlvbiBzbmFwUG9tKHA6IEphdmFQcm9qZWN0KSB7XG4gIGV4cGVjdChzeW50aFNuYXBzaG90KHApWydwb20ueG1sJ10pLnRvTWF0Y2hTbmFwc2hvdCgpO1xufVxuXG5jbGFzcyBUZXN0SmF2YVByb2plY3QgZXh0ZW5kcyBKYXZhUHJvamVjdCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBhcnRpYWw8SmF2YVByb2plY3RPcHRpb25zPiA9IHsgfSkge1xuICAgIC8vIHVzaW5nIGEgc3ViZGlyZWN0b3J5IHRvIGVuc3VyZSBzeW50aFNuYXBzaG90IGNhbiBjbGVhbiB1cCB0aGUgcHJvamVjdCBzYWZlbHlcbiAgICBta2RpcnBTeW5jKCdwcm9qZWN0LWRpcicpO1xuXG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIG5vdCB1c2luZyBvdXRkaXI6IG1rZHRlbXAoKSBzaW5jZSB0aGF0IHdpbGwgbWFrZSBzbmFwc2hvdHMgbm9uLWRldGVybWluaXN0aWNcbiAgICAgIG91dGRpcjogJy4vcHJvamVjdC1kaXInLFxuICAgICAgZ3JvdXBJZDogJ29yZy5hY21lJyxcbiAgICAgIGFydGlmYWN0SWQ6ICdteS1hcnRpZmFjdCcsXG4gICAgICBuYW1lOiAndGVzdC1wcm9qZWN0JyxcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBsb2dnaW5nOiB7IGxldmVsOiBMb2dMZXZlbC5PRkYgfSxcbiAgICAgIGpzaWlGcW46ICdwcm9qZW4uamF2YS5KYXZhUHJvamVjdCcsXG4gICAgICBwcm9qZW5yY0phdmFPcHRpb25zOiB7XG4gICAgICAgIHByb2plblZlcnNpb246ICdeMS4yLjMnLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufSJdfQ==