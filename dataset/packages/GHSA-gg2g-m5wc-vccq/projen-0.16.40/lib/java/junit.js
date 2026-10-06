"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Junit = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path_1 = require("path");
const component_1 = require("../component");
const sample_file_1 = require("../sample-file");
const tasks_1 = require("../tasks");
const TESTDIR = path_1.join('src', 'test', 'java');
/**
 * (experimental) Implements JUnit-based testing.
 *
 * @experimental
 */
class Junit extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _b, _c;
        super(project);
        const pom = options.pom;
        const version = (_b = options.version) !== null && _b !== void 0 ? _b : '5.7.0';
        pom.addTestDependency(`org.junit.jupiter/junit-jupiter-api@${version}`);
        pom.addTestDependency(`org.junit.jupiter/junit-jupiter-engine@${version}`);
        project.addTask('test', {
            description: 'Runs tests',
            category: tasks_1.TaskCategory.TEST,
            exec: 'mvn test',
        });
        const javaPackage = (_c = options.sampleJavaPackage) !== null && _c !== void 0 ? _c : 'org.acme';
        const javaPackagePath = javaPackage.split('.');
        new sample_file_1.SampleDir(project, path_1.join(TESTDIR, ...javaPackagePath), {
            files: {
                'MyTest.java': [
                    `package ${javaPackage};`,
                    '',
                    'import org.junit.jupiter.api.Test;',
                    '',
                    'public class MyTest {',
                    '  @Test',
                    '  public void testHello() {',
                    '    System.out.println("Hello, world!");',
                    '  }',
                    '}',
                ].join('\n'),
            },
        });
    }
}
exports.Junit = Junit;
_a = JSII_RTTI_SYMBOL_1;
Junit[_a] = { fqn: "projen.java.Junit", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvamF2YS9qdW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUE0QjtBQUM1Qiw0Q0FBeUM7QUFFekMsZ0RBQTJDO0FBQzNDLG9DQUF3QztBQUd4QyxNQUFNLE9BQU8sR0FBRyxXQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7Ozs7O0FBNEI1QyxNQUFhLEtBQU0sU0FBUSxxQkFBUzs7OztJQUNsQyxZQUFZLE9BQWdCLEVBQUUsT0FBcUI7O1FBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDeEIsTUFBTSxPQUFPLFNBQUcsT0FBTyxDQUFDLE9BQU8sbUNBQUksT0FBTyxDQUFDO1FBRTNDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyx1Q0FBdUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN4RSxHQUFHLENBQUMsaUJBQWlCLENBQUMsMENBQTBDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFM0UsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdEIsV0FBVyxFQUFFLFlBQVk7WUFDekIsUUFBUSxFQUFFLG9CQUFZLENBQUMsSUFBSTtZQUMzQixJQUFJLEVBQUUsVUFBVTtTQUNqQixDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsU0FBRyxPQUFPLENBQUMsaUJBQWlCLG1DQUFJLFVBQVUsQ0FBQztRQUM1RCxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLElBQUksdUJBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLGVBQWUsQ0FBQyxFQUFFO1lBQ3hELEtBQUssRUFBRTtnQkFDTCxhQUFhLEVBQUU7b0JBQ2IsV0FBVyxXQUFXLEdBQUc7b0JBQ3pCLEVBQUU7b0JBQ0Ysb0NBQW9DO29CQUNwQyxFQUFFO29CQUNGLHVCQUF1QjtvQkFDdkIsU0FBUztvQkFDVCw2QkFBNkI7b0JBQzdCLDBDQUEwQztvQkFDMUMsS0FBSztvQkFDTCxHQUFHO2lCQUNKLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNiO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7QUFsQ0gsc0JBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuLi9wcm9qZWN0JztcbmltcG9ydCB7IFNhbXBsZURpciB9IGZyb20gJy4uL3NhbXBsZS1maWxlJztcbmltcG9ydCB7IFRhc2tDYXRlZ29yeSB9IGZyb20gJy4uL3Rhc2tzJztcbmltcG9ydCB7IFBvbSB9IGZyb20gJy4vcG9tJztcblxuY29uc3QgVEVTVERJUiA9IGpvaW4oJ3NyYycsICd0ZXN0JywgJ2phdmEnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBKdW5pdE9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcG9tOiBQb207XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB2ZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzYW1wbGVKYXZhUGFja2FnZT86IHN0cmluZztcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgSnVuaXQgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0LCBvcHRpb25zOiBKdW5pdE9wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIGNvbnN0IHBvbSA9IG9wdGlvbnMucG9tO1xuICAgIGNvbnN0IHZlcnNpb24gPSBvcHRpb25zLnZlcnNpb24gPz8gJzUuNy4wJztcblxuICAgIHBvbS5hZGRUZXN0RGVwZW5kZW5jeShgb3JnLmp1bml0Lmp1cGl0ZXIvanVuaXQtanVwaXRlci1hcGlAJHt2ZXJzaW9ufWApO1xuICAgIHBvbS5hZGRUZXN0RGVwZW5kZW5jeShgb3JnLmp1bml0Lmp1cGl0ZXIvanVuaXQtanVwaXRlci1lbmdpbmVAJHt2ZXJzaW9ufWApO1xuXG4gICAgcHJvamVjdC5hZGRUYXNrKCd0ZXN0Jywge1xuICAgICAgZGVzY3JpcHRpb246ICdSdW5zIHRlc3RzJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuVEVTVCxcbiAgICAgIGV4ZWM6ICdtdm4gdGVzdCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqYXZhUGFja2FnZSA9IG9wdGlvbnMuc2FtcGxlSmF2YVBhY2thZ2UgPz8gJ29yZy5hY21lJztcbiAgICBjb25zdCBqYXZhUGFja2FnZVBhdGggPSBqYXZhUGFja2FnZS5zcGxpdCgnLicpO1xuICAgIG5ldyBTYW1wbGVEaXIocHJvamVjdCwgam9pbihURVNURElSLCAuLi5qYXZhUGFja2FnZVBhdGgpLCB7XG4gICAgICBmaWxlczoge1xuICAgICAgICAnTXlUZXN0LmphdmEnOiBbXG4gICAgICAgICAgYHBhY2thZ2UgJHtqYXZhUGFja2FnZX07YCxcbiAgICAgICAgICAnJyxcbiAgICAgICAgICAnaW1wb3J0IG9yZy5qdW5pdC5qdXBpdGVyLmFwaS5UZXN0OycsXG4gICAgICAgICAgJycsXG4gICAgICAgICAgJ3B1YmxpYyBjbGFzcyBNeVRlc3QgeycsXG4gICAgICAgICAgJyAgQFRlc3QnLFxuICAgICAgICAgICcgIHB1YmxpYyB2b2lkIHRlc3RIZWxsbygpIHsnLFxuICAgICAgICAgICcgICAgU3lzdGVtLm91dC5wcmludGxuKFwiSGVsbG8sIHdvcmxkIVwiKTsnLFxuICAgICAgICAgICcgIH0nLFxuICAgICAgICAgICd9JyxcbiAgICAgICAgXS5qb2luKCdcXG4nKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==