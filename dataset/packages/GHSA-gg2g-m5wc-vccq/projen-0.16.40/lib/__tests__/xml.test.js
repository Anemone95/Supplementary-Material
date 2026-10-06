"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const util_1 = require("./util");
test('simple use', () => {
    // WHEN
    const project = new util_1.TestProject();
    const file = new __1.XmlFile(project, 'pom.xml', {
        obj: {
            project: {
                modelVersion: '4.0.0',
                groupId: 'com.myorg',
                artifactId: 'play-202101050157',
                version: '0.1',
            },
        },
    });
    file.addOverride('project.properties', {
        'project.build.sourceEncoding': 'UTF-8',
    });
    // THEN
    expect(util_1.synthSnapshot(project)['pom.xml']).toMatchSnapshot();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvX190ZXN0c19fL3htbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEJBQTZCO0FBQzdCLGlDQUFvRDtBQUVwRCxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0QixPQUFPO0lBQ1AsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxFQUFFLENBQUM7SUFFbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRTtRQUMzQyxHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUU7Z0JBQ1AsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLE9BQU8sRUFBRSxXQUFXO2dCQUNwQixVQUFVLEVBQUUsbUJBQW1CO2dCQUMvQixPQUFPLEVBQUUsS0FBSzthQUNmO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFO1FBQ3JDLDhCQUE4QixFQUFFLE9BQU87S0FDeEMsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDOUQsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBYbWxGaWxlIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgc3ludGhTbmFwc2hvdCwgVGVzdFByb2plY3QgfSBmcm9tICcuL3V0aWwnO1xuXG50ZXN0KCdzaW1wbGUgdXNlJywgKCkgPT4ge1xuICAvLyBXSEVOXG4gIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICBjb25zdCBmaWxlID0gbmV3IFhtbEZpbGUocHJvamVjdCwgJ3BvbS54bWwnLCB7XG4gICAgb2JqOiB7XG4gICAgICBwcm9qZWN0OiB7XG4gICAgICAgIG1vZGVsVmVyc2lvbjogJzQuMC4wJyxcbiAgICAgICAgZ3JvdXBJZDogJ2NvbS5teW9yZycsXG4gICAgICAgIGFydGlmYWN0SWQ6ICdwbGF5LTIwMjEwMTA1MDE1NycsXG4gICAgICAgIHZlcnNpb246ICcwLjEnLFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBmaWxlLmFkZE92ZXJyaWRlKCdwcm9qZWN0LnByb3BlcnRpZXMnLCB7XG4gICAgJ3Byb2plY3QuYnVpbGQuc291cmNlRW5jb2RpbmcnOiAnVVRGLTgnLFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChzeW50aFNuYXBzaG90KHByb2plY3QpWydwb20ueG1sJ10pLnRvTWF0Y2hTbmFwc2hvdCgpO1xufSk7Il19