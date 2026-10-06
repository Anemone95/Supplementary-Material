"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../logger");
const python_1 = require("../../python");
const util_1 = require("../util");
test('poetry enabled', () => {
    const p = new TestPythonProject({
        venv: false,
        pip: false,
        setuptools: false,
        poetry: true,
        homepage: 'http://www.example.com',
        description: 'a short project description',
        license: 'Apache-2.0',
        classifiers: [
            'Development Status :: 4 - Beta',
        ],
    });
    const snapshot = util_1.synthSnapshot(p);
    expect(snapshot['pyproject.toml']).toContain('First Last');
    expect(snapshot['pyproject.toml']).toContain('email@example.com');
    expect(snapshot['pyproject.toml']).toContain('http://www.example.com');
    expect(snapshot['pyproject.toml']).toContain('a short project description');
    expect(snapshot['pyproject.toml']).toContain('Apache-2.0');
    expect(snapshot['pyproject.toml']).toContain('Development Status :: 4 - Beta');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ldHJ5LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvX190ZXN0c19fL3B5dGhvbi9wb2V0cnkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUF3QztBQUN4Qyx5Q0FBbUU7QUFDbkUsa0NBQWlEO0FBRWpELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7SUFDMUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQztRQUM5QixJQUFJLEVBQUUsS0FBSztRQUNYLEdBQUcsRUFBRSxLQUFLO1FBQ1YsVUFBVSxFQUFFLEtBQUs7UUFDakIsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsd0JBQXdCO1FBQ2xDLFdBQVcsRUFBRSw2QkFBNkI7UUFDMUMsT0FBTyxFQUFFLFlBQVk7UUFDckIsV0FBVyxFQUFFO1lBQ1gsZ0NBQWdDO1NBQ2pDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLEdBQUcsb0JBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDdkUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDNUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2pGLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxpQkFBa0IsU0FBUSxzQkFBYTtJQUMzQyxZQUFZLFVBQXlDLEVBQUc7UUFDdEQsS0FBSyxDQUFDO1lBQ0osR0FBRyxPQUFPO1lBQ1YsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUscUJBQXFCO1lBQzNCLFVBQVUsRUFBRSxxQkFBcUI7WUFDakMsVUFBVSxFQUFFLFlBQVk7WUFDeEIsV0FBVyxFQUFFLG1CQUFtQjtZQUNoQyxPQUFPLEVBQUUsT0FBTztZQUNoQixNQUFNLEVBQUUsY0FBTyxFQUFFO1lBQ2pCLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxpQkFBUSxDQUFDLEdBQUcsRUFBRTtZQUNoQyxPQUFPLEVBQUUsNkJBQTZCO1NBQ3ZDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ0xldmVsIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbmltcG9ydCB7IFB5dGhvblByb2plY3QsIFB5dGhvblByb2plY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vcHl0aG9uJztcbmltcG9ydCB7IG1rZHRlbXAsIHN5bnRoU25hcHNob3QgfSBmcm9tICcuLi91dGlsJztcblxudGVzdCgncG9ldHJ5IGVuYWJsZWQnLCAoKSA9PiB7XG4gIGNvbnN0IHAgPSBuZXcgVGVzdFB5dGhvblByb2plY3Qoe1xuICAgIHZlbnY6IGZhbHNlLFxuICAgIHBpcDogZmFsc2UsXG4gICAgc2V0dXB0b29sczogZmFsc2UsXG4gICAgcG9ldHJ5OiB0cnVlLFxuICAgIGhvbWVwYWdlOiAnaHR0cDovL3d3dy5leGFtcGxlLmNvbScsXG4gICAgZGVzY3JpcHRpb246ICdhIHNob3J0IHByb2plY3QgZGVzY3JpcHRpb24nLFxuICAgIGxpY2Vuc2U6ICdBcGFjaGUtMi4wJyxcbiAgICBjbGFzc2lmaWVyczogW1xuICAgICAgJ0RldmVsb3BtZW50IFN0YXR1cyA6OiA0IC0gQmV0YScsXG4gICAgXSxcbiAgfSk7XG5cbiAgY29uc3Qgc25hcHNob3QgPSBzeW50aFNuYXBzaG90KHApO1xuICBleHBlY3Qoc25hcHNob3RbJ3B5cHJvamVjdC50b21sJ10pLnRvQ29udGFpbignRmlyc3QgTGFzdCcpO1xuICBleHBlY3Qoc25hcHNob3RbJ3B5cHJvamVjdC50b21sJ10pLnRvQ29udGFpbignZW1haWxAZXhhbXBsZS5jb20nKTtcbiAgZXhwZWN0KHNuYXBzaG90WydweXByb2plY3QudG9tbCddKS50b0NvbnRhaW4oJ2h0dHA6Ly93d3cuZXhhbXBsZS5jb20nKTtcbiAgZXhwZWN0KHNuYXBzaG90WydweXByb2plY3QudG9tbCddKS50b0NvbnRhaW4oJ2Egc2hvcnQgcHJvamVjdCBkZXNjcmlwdGlvbicpO1xuICBleHBlY3Qoc25hcHNob3RbJ3B5cHJvamVjdC50b21sJ10pLnRvQ29udGFpbignQXBhY2hlLTIuMCcpO1xuICBleHBlY3Qoc25hcHNob3RbJ3B5cHJvamVjdC50b21sJ10pLnRvQ29udGFpbignRGV2ZWxvcG1lbnQgU3RhdHVzIDo6IDQgLSBCZXRhJyk7XG59KTtcblxuY2xhc3MgVGVzdFB5dGhvblByb2plY3QgZXh0ZW5kcyBQeXRob25Qcm9qZWN0IHtcbiAgY29uc3RydWN0b3Iob3B0aW9uczogUGFydGlhbDxQeXRob25Qcm9qZWN0T3B0aW9ucz4gPSB7IH0pIHtcbiAgICBzdXBlcih7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgY2xvYmJlcjogZmFsc2UsXG4gICAgICBuYW1lOiAndGVzdC1weXRob24tcHJvamVjdCcsXG4gICAgICBtb2R1bGVOYW1lOiAndGVzdF9weXRob25fcHJvamVjdCcsXG4gICAgICBhdXRob3JOYW1lOiAnRmlyc3QgTGFzdCcsXG4gICAgICBhdXRob3JFbWFpbDogJ2VtYWlsQGV4YW1wbGUuY29tJyxcbiAgICAgIHZlcnNpb246ICcwLjEuMCcsXG4gICAgICBvdXRkaXI6IG1rZHRlbXAoKSxcbiAgICAgIGxvZ2dpbmc6IHsgbGV2ZWw6IExvZ0xldmVsLk9GRiB9LFxuICAgICAganNpaUZxbjogJ3Byb2plbi5weXRob24uUHl0aG9uUHJvamVjdCcsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==