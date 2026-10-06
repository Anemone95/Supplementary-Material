"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YAML = require("yaml");
const __1 = require("..");
const util_1 = require("./util");
test('yaml object can be mutated before synthesis', () => {
    const prj = new util_1.TestProject();
    const obj = {
        hello: 'world',
    };
    new __1.YamlFile(prj, 'my/yaml/file.yaml', { obj });
    // mutate obj (should be reflected in the output)
    obj.anotherField = {
        foo: 1234,
    };
    expect(YAML.parse(util_1.synthSnapshot(prj)['my/yaml/file.yaml'])).toStrictEqual({
        hello: 'world',
        anotherField: { foo: 1234 },
    });
});
test('yaml file can contain projen marker', () => {
    const prj = new util_1.TestProject();
    const obj = {};
    new __1.YamlFile(prj, 'my/yaml/file-marker.yaml', { obj, marker: true });
    const output = util_1.synthSnapshot(prj)['my/yaml/file-marker.yaml'];
    const firstLine = output.split('\n')[0];
    expect(firstLine).toBe(`# ${__1.YamlFile.PROJEN_MARKER}`);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFtbC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL19fdGVzdHNfXy95YW1sLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsMEJBQThCO0FBQzlCLGlDQUFvRDtBQUVwRCxJQUFJLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO0lBRTlCLE1BQU0sR0FBRyxHQUFRO1FBQ2YsS0FBSyxFQUFFLE9BQU87S0FDZixDQUFDO0lBRUYsSUFBSSxZQUFRLENBQUMsR0FBRyxFQUFFLG1CQUFtQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUVoRCxpREFBaUQ7SUFDakQsR0FBRyxDQUFDLFlBQVksR0FBRztRQUNqQixHQUFHLEVBQUUsSUFBSTtLQUNWLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUN4RSxLQUFLLEVBQUUsT0FBTztRQUNkLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7S0FDNUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO0lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO0lBRTlCLE1BQU0sR0FBRyxHQUFRLEVBQUUsQ0FBQztJQUVwQixJQUFJLFlBQVEsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFFckUsTUFBTSxNQUFNLEdBQUcsb0JBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRTlELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgWUFNTCBmcm9tICd5YW1sJztcbmltcG9ydCB7IFlhbWxGaWxlIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgc3ludGhTbmFwc2hvdCwgVGVzdFByb2plY3QgfSBmcm9tICcuL3V0aWwnO1xuXG50ZXN0KCd5YW1sIG9iamVjdCBjYW4gYmUgbXV0YXRlZCBiZWZvcmUgc3ludGhlc2lzJywgKCkgPT4ge1xuICBjb25zdCBwcmogPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICBjb25zdCBvYmo6IGFueSA9IHtcbiAgICBoZWxsbzogJ3dvcmxkJyxcbiAgfTtcblxuICBuZXcgWWFtbEZpbGUocHJqLCAnbXkveWFtbC9maWxlLnlhbWwnLCB7IG9iaiB9KTtcblxuICAvLyBtdXRhdGUgb2JqIChzaG91bGQgYmUgcmVmbGVjdGVkIGluIHRoZSBvdXRwdXQpXG4gIG9iai5hbm90aGVyRmllbGQgPSB7XG4gICAgZm9vOiAxMjM0LFxuICB9O1xuXG4gIGV4cGVjdChZQU1MLnBhcnNlKHN5bnRoU25hcHNob3QocHJqKVsnbXkveWFtbC9maWxlLnlhbWwnXSkpLnRvU3RyaWN0RXF1YWwoe1xuICAgIGhlbGxvOiAnd29ybGQnLFxuICAgIGFub3RoZXJGaWVsZDogeyBmb286IDEyMzQgfSxcbiAgfSk7XG59KTtcblxudGVzdCgneWFtbCBmaWxlIGNhbiBjb250YWluIHByb2plbiBtYXJrZXInLCAoKSA9PiB7XG4gIGNvbnN0IHByaiA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gIGNvbnN0IG9iajogYW55ID0ge307XG5cbiAgbmV3IFlhbWxGaWxlKHByaiwgJ215L3lhbWwvZmlsZS1tYXJrZXIueWFtbCcsIHsgb2JqLCBtYXJrZXI6IHRydWUgfSk7XG5cbiAgY29uc3Qgb3V0cHV0ID0gc3ludGhTbmFwc2hvdChwcmopWydteS95YW1sL2ZpbGUtbWFya2VyLnlhbWwnXTtcblxuICBjb25zdCBmaXJzdExpbmUgPSBvdXRwdXQuc3BsaXQoJ1xcbicpWzBdO1xuXG4gIGV4cGVjdChmaXJzdExpbmUpLnRvQmUoYCMgJHtZYW1sRmlsZS5QUk9KRU5fTUFSS0VSfWApO1xufSk7Il19