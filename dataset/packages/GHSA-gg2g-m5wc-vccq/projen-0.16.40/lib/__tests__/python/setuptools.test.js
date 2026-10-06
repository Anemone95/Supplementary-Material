"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../logger");
const python_1 = require("../../python");
const util_1 = require("../util");
test('setuptools enabled', () => {
    const p = new TestPythonProject({
        setuptools: true,
        homepage: 'http://www.example.com',
        description: 'a short project description',
        license: 'Apache Software License',
        classifiers: [
            'Development Status :: 4 - Beta',
        ],
    });
    const snapshot = util_1.synthSnapshot(p);
    expect(snapshot['setup.py']).toContain('First Last');
    expect(snapshot['setup.py']).toContain('email@example.com');
    expect(snapshot['setup.py']).toContain('http://www.example.com');
    expect(snapshot['setup.py']).toContain('a short project description');
    expect(snapshot['setup.py']).toContain('Apache Software License');
    expect(snapshot['setup.py']).toContain('Development Status :: 4 - Beta');
});
class TestPythonProject extends python_1.PythonProject {
    constructor(options = {}) {
        super({
            ...options,
            clobber: false,
            name: 'test-python-project',
            moduleName: 'test_python_project',
            authorName: 'First Last',
            authorEmail: 'email@example.com',
            version: '0.1.0',
            outdir: util_1.mkdtemp(),
            logging: { level: logger_1.LogLevel.OFF },
            jsiiFqn: 'projen.python.PythonProject',
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXB0b29scy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL19fdGVzdHNfXy9weXRob24vc2V0dXB0b29scy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXdDO0FBQ3hDLHlDQUFtRTtBQUNuRSxrQ0FBaUQ7QUFFakQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtJQUM5QixNQUFNLENBQUMsR0FBRyxJQUFJLGlCQUFpQixDQUFDO1FBQzlCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSx3QkFBd0I7UUFDbEMsV0FBVyxFQUFFLDZCQUE2QjtRQUMxQyxPQUFPLEVBQUUseUJBQXlCO1FBQ2xDLFdBQVcsRUFBRTtZQUNYLGdDQUFnQztTQUNqQztLQUNGLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxHQUFHLG9CQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNyRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDNUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUN0RSxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQzNFLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxpQkFBa0IsU0FBUSxzQkFBYTtJQUMzQyxZQUFZLFVBQXlDLEVBQUc7UUFDdEQsS0FBSyxDQUFDO1lBQ0osR0FBRyxPQUFPO1lBQ1YsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUscUJBQXFCO1lBQzNCLFVBQVUsRUFBRSxxQkFBcUI7WUFDakMsVUFBVSxFQUFFLFlBQVk7WUFDeEIsV0FBVyxFQUFFLG1CQUFtQjtZQUNoQyxPQUFPLEVBQUUsT0FBTztZQUNoQixNQUFNLEVBQUUsY0FBTyxFQUFFO1lBQ2pCLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxpQkFBUSxDQUFDLEdBQUcsRUFBRTtZQUNoQyxPQUFPLEVBQUUsNkJBQTZCO1NBQ3ZDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ0xldmVsIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbmltcG9ydCB7IFB5dGhvblByb2plY3QsIFB5dGhvblByb2plY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vcHl0aG9uJztcbmltcG9ydCB7IG1rZHRlbXAsIHN5bnRoU25hcHNob3QgfSBmcm9tICcuLi91dGlsJztcblxudGVzdCgnc2V0dXB0b29scyBlbmFibGVkJywgKCkgPT4ge1xuICBjb25zdCBwID0gbmV3IFRlc3RQeXRob25Qcm9qZWN0KHtcbiAgICBzZXR1cHRvb2xzOiB0cnVlLFxuICAgIGhvbWVwYWdlOiAnaHR0cDovL3d3dy5leGFtcGxlLmNvbScsXG4gICAgZGVzY3JpcHRpb246ICdhIHNob3J0IHByb2plY3QgZGVzY3JpcHRpb24nLFxuICAgIGxpY2Vuc2U6ICdBcGFjaGUgU29mdHdhcmUgTGljZW5zZScsXG4gICAgY2xhc3NpZmllcnM6IFtcbiAgICAgICdEZXZlbG9wbWVudCBTdGF0dXMgOjogNCAtIEJldGEnLFxuICAgIF0sXG4gIH0pO1xuXG4gIGNvbnN0IHNuYXBzaG90ID0gc3ludGhTbmFwc2hvdChwKTtcbiAgZXhwZWN0KHNuYXBzaG90WydzZXR1cC5weSddKS50b0NvbnRhaW4oJ0ZpcnN0IExhc3QnKTtcbiAgZXhwZWN0KHNuYXBzaG90WydzZXR1cC5weSddKS50b0NvbnRhaW4oJ2VtYWlsQGV4YW1wbGUuY29tJyk7XG4gIGV4cGVjdChzbmFwc2hvdFsnc2V0dXAucHknXSkudG9Db250YWluKCdodHRwOi8vd3d3LmV4YW1wbGUuY29tJyk7XG4gIGV4cGVjdChzbmFwc2hvdFsnc2V0dXAucHknXSkudG9Db250YWluKCdhIHNob3J0IHByb2plY3QgZGVzY3JpcHRpb24nKTtcbiAgZXhwZWN0KHNuYXBzaG90WydzZXR1cC5weSddKS50b0NvbnRhaW4oJ0FwYWNoZSBTb2Z0d2FyZSBMaWNlbnNlJyk7XG4gIGV4cGVjdChzbmFwc2hvdFsnc2V0dXAucHknXSkudG9Db250YWluKCdEZXZlbG9wbWVudCBTdGF0dXMgOjogNCAtIEJldGEnKTtcbn0pO1xuXG5jbGFzcyBUZXN0UHl0aG9uUHJvamVjdCBleHRlbmRzIFB5dGhvblByb2plY3Qge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQYXJ0aWFsPFB5dGhvblByb2plY3RPcHRpb25zPiA9IHsgfSkge1xuICAgIHN1cGVyKHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBjbG9iYmVyOiBmYWxzZSxcbiAgICAgIG5hbWU6ICd0ZXN0LXB5dGhvbi1wcm9qZWN0JyxcbiAgICAgIG1vZHVsZU5hbWU6ICd0ZXN0X3B5dGhvbl9wcm9qZWN0JyxcbiAgICAgIGF1dGhvck5hbWU6ICdGaXJzdCBMYXN0JyxcbiAgICAgIGF1dGhvckVtYWlsOiAnZW1haWxAZXhhbXBsZS5jb20nLFxuICAgICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAgIG91dGRpcjogbWtkdGVtcCgpLFxuICAgICAgbG9nZ2luZzogeyBsZXZlbDogTG9nTGV2ZWwuT0ZGIH0sXG4gICAgICBqc2lpRnFuOiAncHJvamVuLnB5dGhvbi5QeXRob25Qcm9qZWN0JyxcbiAgICB9KTtcbiAgfVxufVxuIl19