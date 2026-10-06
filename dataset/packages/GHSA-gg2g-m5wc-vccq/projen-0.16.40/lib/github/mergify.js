"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mergify = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const yaml_1 = require("../yaml");
/**
 * @experimental
 */
class Mergify extends component_1.Component {
    /**
     * @experimental
     */
    constructor(github, options = {}) {
        var _b;
        super(github.project);
        this.rules = new Array();
        new yaml_1.YamlFile(this.project, '.mergify.yml', {
            obj: {
                pull_request_rules: this.rules,
            },
            marker: true,
        });
        ((_b = options.rules) !== null && _b !== void 0 ? _b : []).forEach(rule => this.addRule(rule));
    }
    /**
     * @experimental
     */
    addRule(rule) {
        this.rules.push(rule);
    }
}
exports.Mergify = Mergify;
_a = JSII_RTTI_SYMBOL_1;
Mergify[_a] = { fqn: "projen.github.Mergify", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2lmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9naXRodWIvbWVyZ2lmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUF5QztBQUN6QyxrQ0FBbUM7Ozs7QUFhbkMsTUFBYSxPQUFRLFNBQVEscUJBQVM7Ozs7SUFHcEMsWUFBWSxNQUFjLEVBQUUsVUFBMEIsRUFBRzs7UUFDdkQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhQLFVBQUssR0FBRyxJQUFJLEtBQUssRUFBZSxDQUFDO1FBS2hELElBQUksZUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFO1lBQ3pDLEdBQUcsRUFBRTtnQkFDSCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSzthQUMvQjtZQUNELE1BQU0sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFDO1FBRUgsT0FBQyxPQUFPLENBQUMsS0FBSyxtQ0FBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQzs7OztJQUVNLE9BQU8sQ0FBQyxJQUFpQjtRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDOztBQWxCSCwwQkFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgWWFtbEZpbGUgfSBmcm9tICcuLi95YW1sJztcbmltcG9ydCB7IEdpdEh1YiB9IGZyb20gJy4vZ2l0aHViJztcblxuZXhwb3J0IGludGVyZmFjZSBNZXJnaWZ5UnVsZSB7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgY29uZGl0aW9uczogc3RyaW5nW107XG4gIHJlYWRvbmx5IGFjdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogYW55IH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2lmeU9wdGlvbnMge1xuICByZWFkb25seSBydWxlcz86IE1lcmdpZnlSdWxlW107XG59XG5cbmV4cG9ydCBjbGFzcyBNZXJnaWZ5IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBydWxlcyA9IG5ldyBBcnJheTxNZXJnaWZ5UnVsZT4oKTtcblxuICBjb25zdHJ1Y3RvcihnaXRodWI6IEdpdEh1Yiwgb3B0aW9uczogTWVyZ2lmeU9wdGlvbnMgPSB7IH0pIHtcbiAgICBzdXBlcihnaXRodWIucHJvamVjdCk7XG5cbiAgICBuZXcgWWFtbEZpbGUodGhpcy5wcm9qZWN0LCAnLm1lcmdpZnkueW1sJywge1xuICAgICAgb2JqOiB7XG4gICAgICAgIHB1bGxfcmVxdWVzdF9ydWxlczogdGhpcy5ydWxlcyxcbiAgICAgIH0sXG4gICAgICBtYXJrZXI6IHRydWUsXG4gICAgfSk7XG5cbiAgICAob3B0aW9ucy5ydWxlcyA/PyBbXSkuZm9yRWFjaChydWxlID0+IHRoaXMuYWRkUnVsZShydWxlKSk7XG4gIH1cblxuICBwdWJsaWMgYWRkUnVsZShydWxlOiBNZXJnaWZ5UnVsZSkge1xuICAgIHRoaXMucnVsZXMucHVzaChydWxlKTtcbiAgfVxufSJdfQ==