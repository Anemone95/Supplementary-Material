"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupPy = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const file_1 = require("../file");
/**
 * (experimental) Python packaging script where package metadata can be placed.
 *
 * @experimental
 */
class SetupPy extends file_1.FileBase {
    /**
     * @experimental
     */
    constructor(project, options) {
        super(project, 'setup.py');
        this.setupConfig = {
            name: project.name,
            packages: [project.moduleName],
            python_requires: '>=3.6',
            classifiers: [
                'Intended Audience :: Developers',
                'Programming Language :: Python :: 3 :: Only',
                'Programming Language :: Python :: 3.6',
                'Programming Language :: Python :: 3.7',
                'Programming Language :: Python :: 3.8',
                'Programming Language :: Python :: 3.9',
            ],
            ...options ? this.renameFields(options) : [],
        };
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(resolver) {
        const lines = [
            `# ${file_1.FileBase.PROJEN_MARKER}`,
            '',
            'import json',
            'from setuptools import setup',
            '',
            'kwargs = json.loads(',
            '    """',
            JSON.stringify(this.setupConfig, null, 4),
            '"""',
            ')',
            '',
            'setup(**kwargs)',
        ];
        return `${resolver.resolve(lines).join('\n')}\n`;
    }
    // modify some key names since JSII interfaces require fields to be camelCase
    renameFields(options) {
        const obj = {};
        for (const [key, value] of Object.entries(options)) {
            if (key === 'authorName') {
                obj.author = value;
            }
            else if (key === 'authorEmail') {
                obj.author_email = value;
            }
            else if (key === 'homepage') {
                obj.url = value;
            }
            else {
                obj[key] = value;
            }
        }
        return obj;
    }
}
exports.SetupPy = SetupPy;
_a = JSII_RTTI_SYMBOL_1;
SetupPy[_a] = { fqn: "projen.python.SetupPy", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBweS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9weXRob24vc2V0dXBweS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtDQUE4Qzs7Ozs7O0FBaUU5QyxNQUFhLE9BQVEsU0FBUSxlQUFROzs7O0lBR25DLFlBQVksT0FBc0IsRUFBRSxPQUF1QjtRQUN6RCxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxXQUFXLEdBQUc7WUFDakIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDOUIsZUFBZSxFQUFFLE9BQU87WUFDeEIsV0FBVyxFQUFFO2dCQUNYLGlDQUFpQztnQkFDakMsNkNBQTZDO2dCQUM3Qyx1Q0FBdUM7Z0JBQ3ZDLHVDQUF1QztnQkFDdkMsdUNBQXVDO2dCQUN2Qyx1Q0FBdUM7YUFDeEM7WUFDRCxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUM3QyxDQUFDO0lBQ0osQ0FBQzs7Ozs7O0lBRVMsaUJBQWlCLENBQUMsUUFBbUI7UUFDN0MsTUFBTSxLQUFLLEdBQUc7WUFDWixLQUFLLGVBQVEsQ0FBQyxhQUFhLEVBQUU7WUFDN0IsRUFBRTtZQUNGLGFBQWE7WUFDYiw4QkFBOEI7WUFDOUIsRUFBRTtZQUNGLHNCQUFzQjtZQUN0QixTQUFTO1lBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDekMsS0FBSztZQUNMLEdBQUc7WUFDSCxFQUFFO1lBQ0YsaUJBQWlCO1NBQ2xCLENBQUM7UUFFRixPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuRCxDQUFDO0lBRUQsNkVBQTZFO0lBQ3JFLFlBQVksQ0FBQyxPQUF1QjtRQUMxQyxNQUFNLEdBQUcsR0FBMkIsRUFBRSxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2xELElBQUksR0FBRyxLQUFLLFlBQVksRUFBRTtnQkFDeEIsR0FBRyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDcEI7aUJBQU0sSUFBSSxHQUFHLEtBQUssYUFBYSxFQUFFO2dCQUNoQyxHQUFHLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQzthQUMxQjtpQkFBTSxJQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUU7Z0JBQzdCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDbEI7U0FDRjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQzs7QUF4REgsMEJBeURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlsZUJhc2UsIElSZXNvbHZlciB9IGZyb20gJy4uL2ZpbGUnO1xuaW1wb3J0IHsgUHl0aG9uUHJvamVjdCB9IGZyb20gJy4vcHl0aG9uLXByb2plY3QnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBTZXR1cFB5T3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbmFtZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcGFja2FnZXM/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGF1dGhvck5hbWU/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGF1dGhvckVtYWlsPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGljZW5zZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGhvbWVwYWdlPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNsYXNzaWZpZXJzPzogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEVzY2FwZSBoYXRjaCB0byBhbGxvdyBhbnkgdmFsdWVcbiAgICovXG4gIHJlYWRvbmx5IFtuYW1lOiBzdHJpbmddOiBhbnk7XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFNldHVwUHkgZXh0ZW5kcyBGaWxlQmFzZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc2V0dXBDb25maWc6IGFueTtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQeXRob25Qcm9qZWN0LCBvcHRpb25zOiBTZXR1cFB5T3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QsICdzZXR1cC5weScpO1xuXG4gICAgdGhpcy5zZXR1cENvbmZpZyA9IHtcbiAgICAgIG5hbWU6IHByb2plY3QubmFtZSxcbiAgICAgIHBhY2thZ2VzOiBbcHJvamVjdC5tb2R1bGVOYW1lXSxcbiAgICAgIHB5dGhvbl9yZXF1aXJlczogJz49My42JyxcbiAgICAgIGNsYXNzaWZpZXJzOiBbXG4gICAgICAgICdJbnRlbmRlZCBBdWRpZW5jZSA6OiBEZXZlbG9wZXJzJyxcbiAgICAgICAgJ1Byb2dyYW1taW5nIExhbmd1YWdlIDo6IFB5dGhvbiA6OiAzIDo6IE9ubHknLFxuICAgICAgICAnUHJvZ3JhbW1pbmcgTGFuZ3VhZ2UgOjogUHl0aG9uIDo6IDMuNicsXG4gICAgICAgICdQcm9ncmFtbWluZyBMYW5ndWFnZSA6OiBQeXRob24gOjogMy43JyxcbiAgICAgICAgJ1Byb2dyYW1taW5nIExhbmd1YWdlIDo6IFB5dGhvbiA6OiAzLjgnLFxuICAgICAgICAnUHJvZ3JhbW1pbmcgTGFuZ3VhZ2UgOjogUHl0aG9uIDo6IDMuOScsXG4gICAgICBdLFxuICAgICAgLi4ub3B0aW9ucyA/IHRoaXMucmVuYW1lRmllbGRzKG9wdGlvbnMpIDogW10sXG4gICAgfTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzeW50aGVzaXplQ29udGVudChyZXNvbHZlcjogSVJlc29sdmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBsaW5lcyA9IFtcbiAgICAgIGAjICR7RmlsZUJhc2UuUFJPSkVOX01BUktFUn1gLFxuICAgICAgJycsXG4gICAgICAnaW1wb3J0IGpzb24nLFxuICAgICAgJ2Zyb20gc2V0dXB0b29scyBpbXBvcnQgc2V0dXAnLFxuICAgICAgJycsXG4gICAgICAna3dhcmdzID0ganNvbi5sb2FkcygnLFxuICAgICAgJyAgICBcIlwiXCInLFxuICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5zZXR1cENvbmZpZywgbnVsbCwgNCksXG4gICAgICAnXCJcIlwiJyxcbiAgICAgICcpJyxcbiAgICAgICcnLFxuICAgICAgJ3NldHVwKCoqa3dhcmdzKScsXG4gICAgXTtcblxuICAgIHJldHVybiBgJHtyZXNvbHZlci5yZXNvbHZlKGxpbmVzKS5qb2luKCdcXG4nKX1cXG5gO1xuICB9XG5cbiAgLy8gbW9kaWZ5IHNvbWUga2V5IG5hbWVzIHNpbmNlIEpTSUkgaW50ZXJmYWNlcyByZXF1aXJlIGZpZWxkcyB0byBiZSBjYW1lbENhc2VcbiAgcHJpdmF0ZSByZW5hbWVGaWVsZHMob3B0aW9uczogU2V0dXBQeU9wdGlvbnMpOiBhbnkge1xuICAgIGNvbnN0IG9iajogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpKSB7XG4gICAgICBpZiAoa2V5ID09PSAnYXV0aG9yTmFtZScpIHtcbiAgICAgICAgb2JqLmF1dGhvciA9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdhdXRob3JFbWFpbCcpIHtcbiAgICAgICAgb2JqLmF1dGhvcl9lbWFpbCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdob21lcGFnZScpIHtcbiAgICAgICAgb2JqLnVybCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufSJdfQ==