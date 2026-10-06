"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const json_1 = require("../json");
const util_1 = require("./util");
class ChildObjectFile extends __1.ObjectFile {
}
test('json object can be mutated before synthesis', () => {
    const prj = new util_1.TestProject();
    const obj = {
        hello: 'world',
    };
    new ChildObjectFile(prj, 'my/object/file.json', { obj });
    // mutate obj (should be reflected in the output)
    obj.anotherField = {
        foo: 1234,
    };
    expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
        hello: 'world',
        anotherField: { foo: 1234 },
    });
});
describe('overrides', () => {
    test('addOverride(p, v) allows assigning arbitrary values to synthesized resource definitions', () => {
        // GIVEN
        const prj = new util_1.TestProject();
        const file = new json_1.JsonFile(prj, 'my/object/file.json', { obj: { initialObj: 'must be nonempty' } });
        // WHEN
        file.addOverride('metadata', { key: 12 });
        file.addOverride('use.dot.notation', 'to create subtrees');
        // THEN
        expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
            initialObj: 'must be nonempty',
            use: { dot: { notation: 'to create subtrees' } },
            metadata: { key: 12 },
        });
    });
    test('addOverride(p, undefined) can be used to delete a value', () => {
        // GIVEN
        const prj = new util_1.TestProject();
        const file = new json_1.JsonFile(prj, 'my/object/file.json', {
            obj: {
                hello: {
                    world: {
                        value1: 'Hello',
                        value2: 129,
                    },
                },
            },
        });
        // WHEN
        file.addOverride('hello.world.value2', undefined);
        // THEN
        expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
            hello: {
                world: {
                    value1: 'Hello',
                },
            },
        });
    });
    test('addOverride(p, undefined) will not create empty trees', () => {
        // GIVEN
        const prj = new util_1.TestProject();
        const file = new json_1.JsonFile(prj, 'my/object/file.json', { obj: { initialObj: 'must be nonempty' } });
        // WHEN
        file.addOverride('tree.exists', 42);
        file.addOverride('tree.does.not.exist', undefined);
        // THEN
        expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
            initialObj: 'must be nonempty',
            tree: {
                exists: 42,
            },
        });
    });
    test('addDeletionOverride(p) is sugar for `undefined`', () => {
        // GIVEN
        const prj = new util_1.TestProject();
        const file = new json_1.JsonFile(prj, 'my/object/file.json', {
            obj: {
                hello: {
                    world: {
                        value1: 'Hello',
                        value2: 129,
                        value3: ['foo', 'bar'],
                    },
                },
            },
        });
        // WHEN
        file.addDeletionOverride('hello.world.value2');
        // THEN
        expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
            hello: {
                world: {
                    value1: 'Hello',
                    value3: ['foo', 'bar'],
                },
            },
        });
    });
    test('addOverride(p, v) will overwrite any non-objects along the path', () => {
        // GIVEN
        const prj = new util_1.TestProject();
        const file = new json_1.JsonFile(prj, 'my/object/file.json', {
            obj: {
                hello: {
                    world: 42,
                },
            },
        });
        // WHEN
        file.addOverride('override1', ['Hello', 123]);
        file.addOverride('override1.override2', { foo: [1] });
        file.addOverride('hello.world.foo.bar', 42);
        // THEN
        expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
            hello: { world: { foo: { bar: 42 } } },
            override1: {
                override2: { foo: [1] },
            },
        });
    });
    test('addOverride(p, v) will not split on escaped dots', () => {
        // GIVEN
        const prj = new util_1.TestProject();
        const file = new json_1.JsonFile(prj, 'my/object/file.json', { obj: { initialObj: 'cannot be empty' } });
        // WHEN
        file.addOverride(String.raw `Hello\.World.Foo\.Bar\.Baz`, 42);
        file.addOverride(String.raw `Single\Back\Slashes`, 42);
        file.addOverride(String.raw `Escaped\\.Back\\.Slashes`, 42);
        file.addOverride(String.raw `DoublyEscaped\\\\Back\\\\Slashes`, 42);
        file.addOverride('EndWith\\', 42); // Raw string cannot end with a backslash
        // THEN
        expect(util_1.synthSnapshot(prj)['my/object/file.json']).toStrictEqual({
            'initialObj': 'cannot be empty',
            'Hello.World': { 'Foo.Bar.Baz': 42 },
            'SingleBackSlashes': 42,
            'Escaped\\': { 'Back\\': { Slashes: 42 } },
            'DoublyEscaped\\\\Back\\\\Slashes': 42,
            'EndWith\\': 42,
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LWZpbGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9fX3Rlc3RzX18vb2JqZWN0LWZpbGUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBCQUFnQztBQUNoQyxrQ0FBbUM7QUFDbkMsaUNBQW9EO0FBRXBELE1BQU0sZUFBZ0IsU0FBUSxjQUFVO0NBQUc7QUFFM0MsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLEdBQUcsRUFBRTtJQUN2RCxNQUFNLEdBQUcsR0FBRyxJQUFJLGtCQUFXLEVBQUUsQ0FBQztJQUU5QixNQUFNLEdBQUcsR0FBUTtRQUNmLEtBQUssRUFBRSxPQUFPO0tBQ2YsQ0FBQztJQUVGLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFekQsaURBQWlEO0lBQ2pELEdBQUcsQ0FBQyxZQUFZLEdBQUc7UUFDakIsR0FBRyxFQUFFLElBQUk7S0FDVixDQUFDO0lBRUYsTUFBTSxDQUFDLG9CQUFhLENBQUMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUM5RCxLQUFLLEVBQUUsT0FBTztRQUNkLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7S0FDNUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUN6QixJQUFJLENBQUMseUZBQXlGLEVBQUUsR0FBRyxFQUFFO1FBQ25HLFFBQVE7UUFDUixNQUFNLEdBQUcsR0FBRyxJQUFJLGtCQUFXLEVBQUUsQ0FBQztRQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLGVBQVEsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbkcsT0FBTztRQUNQ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Q29udGVudCI6WyJpbXBvcnQgeyBPYmplY3RGaWxlIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgSnNvbkZpbGUgfSBmcm9tICcuLi9qc29uJztcbmltcG9ydCB7IHN5bnRoU25hcHNob3QsIFRlc3RQcm9qZWN0IH0gZnJvbSAnLi91dGlsJztcblxuY2xhc3MgQ2hpbGRPYmplY3RGaWxlIGV4dGVuZHMgT2JqZWN0RmlsZSB7fVxuXG50ZXN0KCdqc29uIG9iamVjdCBjYW4gYmUgbXV0YXRlZCBiZWZvcmUgc3ludGhlc2lzJywgKCkgPT4ge1xuICBjb25zdCBwcmogPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICBjb25zdCBvYmo6IGFueSA9IHtcbiAgICBoZWxsbzogJ3dvcmxkJyxcbiAgfTtcblxuICBuZXcgQ2hpbGRPYmplY3RGaWxlKHByaiwgJ215L29iamVjdC9maWxlLmpzb24nLCB7IG9iaiB9KTtcblxuICAvLyBtdXRhdGUgb2JqIChzaG91bGQgYmUgcmVmbGVjdGVkIGluIHRoZSBvdXRwdXQpXG4gIG9iai5hbm90aGVyRmllbGQgPSB7XG4gICAgZm9vOiAxMjM0LFxuICB9O1xuXG4gIGV4cGVjdChzeW50aFNuYXBzaG90KHByailbJ215L29iamVjdC9maWxlLmpzb24nXSkudG9TdHJpY3RFcXVhbCh7XG4gICAgaGVsbG86ICd3b3JsZCcsXG4gICAgYW5vdGhlckZpZWxkOiB7IGZvbzogMTIzNCB9LFxuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnb3ZlcnJpZGVzJywgKCkgPT4ge1xuICB0ZXN0KCdhZGRPdmVycmlkZShwLCB2KSBhbGxvd3MgYXNzaWduaW5nIGFyYml0cmFyeSB2YWx1ZXMgdG8gc3ludGhlc2l6ZWQgcmVzb3VyY2UgZGVmaW5pdGlvbnMnLCAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBjb25zdCBwcmogPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICBjb25zdCBmaWxlID0gbmV3IEpzb25GaWxlKHByaiwgJ215L29iamVjdC9maWxlLmpzb24nLCB7IG9iajogeyBpbml0aWFsT2JqOiAnbXVzdCBiZSBub25lbXB0eScgfSB9KTtcblxuICAgIC8vIFdIRU5cbiAgICBmaWxlLmFkZE92ZXJyaWRlKCdtZXRhZGF0YScsIHsga2V5OiAxMiB9KTtcbiAgICBmaWxlLmFkZE92ZXJyaWRlKCd1c2UuZG90Lm5vdGF0aW9uJywgJ3RvIGNyZWF0ZSBzdWJ0cmVlcycpO1xuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChzeW50aFNuYXBzaG90KHByailbJ215L29iamVjdC9maWxlLmpzb24nXSkudG9TdHJpY3RFcXVhbCh7XG4gICAgICBpbml0aWFsT2JqOiAnbXVzdCBiZSBub25lbXB0eScsXG4gICAgICB1c2U6IHsgZG90OiB7IG5vdGF0aW9uOiAndG8gY3JlYXRlIHN1YnRyZWVzJyB9IH0sXG4gICAgICBtZXRhZGF0YTogeyBrZXk6IDEyIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2FkZE92ZXJyaWRlKHAsIHVuZGVmaW5lZCkgY2FuIGJlIHVzZWQgdG8gZGVsZXRlIGEgdmFsdWUnLCAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBjb25zdCBwcmogPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICBjb25zdCBmaWxlID0gbmV3IEpzb25GaWxlKHByaiwgJ215L29iamVjdC9maWxlLmpzb24nLCB7XG4gICAgICBvYmo6IHtcbiAgICAgICAgaGVsbG86IHtcbiAgICAgICAgICB3b3JsZDoge1xuICAgICAgICAgICAgdmFsdWUxOiAnSGVsbG8nLFxuICAgICAgICAgICAgdmFsdWUyOiAxMjksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXSEVOXG4gICAgZmlsZS5hZGRPdmVycmlkZSgnaGVsbG8ud29ybGQudmFsdWUyJywgdW5kZWZpbmVkKTtcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcmopWydteS9vYmplY3QvZmlsZS5qc29uJ10pLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgaGVsbG86IHtcbiAgICAgICAgd29ybGQ6IHtcbiAgICAgICAgICB2YWx1ZTE6ICdIZWxsbycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICB0ZXN0KCdhZGRPdmVycmlkZShwLCB1bmRlZmluZWQpIHdpbGwgbm90IGNyZWF0ZSBlbXB0eSB0cmVlcycsICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIGNvbnN0IHByaiA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgIGNvbnN0IGZpbGUgPSBuZXcgSnNvbkZpbGUocHJqLCAnbXkvb2JqZWN0L2ZpbGUuanNvbicsIHsgb2JqOiB7IGluaXRpYWxPYmo6ICdtdXN0IGJlIG5vbmVtcHR5JyB9IH0pO1xuXG4gICAgLy8gV0hFTlxuICAgIGZpbGUuYWRkT3ZlcnJpZGUoJ3RyZWUuZXhpc3RzJywgNDIpO1xuICAgIGZpbGUuYWRkT3ZlcnJpZGUoJ3RyZWUuZG9lcy5ub3QuZXhpc3QnLCB1bmRlZmluZWQpO1xuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChzeW50aFNuYXBzaG90KHByailbJ215L29iamVjdC9maWxlLmpzb24nXSkudG9TdHJpY3RFcXVhbCh7XG4gICAgICBpbml0aWFsT2JqOiAnbXVzdCBiZSBub25lbXB0eScsXG4gICAgICB0cmVlOiB7XG4gICAgICAgIGV4aXN0czogNDIsXG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICB0ZXN0KCdhZGREZWxldGlvbk92ZXJyaWRlKHApIGlzIHN1Z2FyIGZvciBgdW5kZWZpbmVkYCcsICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIGNvbnN0IHByaiA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgIGNvbnN0IGZpbGUgPSBuZXcgSnNvbkZpbGUocHJqLCAnbXkvb2JqZWN0L2ZpbGUuanNvbicsIHtcbiAgICAgIG9iajoge1xuICAgICAgICBoZWxsbzoge1xuICAgICAgICAgIHdvcmxkOiB7XG4gICAgICAgICAgICB2YWx1ZTE6ICdIZWxsbycsXG4gICAgICAgICAgICB2YWx1ZTI6IDEyOSxcbiAgICAgICAgICAgIHZhbHVlMzogWydmb28nLCAnYmFyJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXSEVOXG4gICAgZmlsZS5hZGREZWxldGlvbk92ZXJyaWRlKCdoZWxsby53b3JsZC52YWx1ZTInKTtcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcmopWydteS9vYmplY3QvZmlsZS5qc29uJ10pLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgaGVsbG86IHtcbiAgICAgICAgd29ybGQ6IHtcbiAgICAgICAgICB2YWx1ZTE6ICdIZWxsbycsXG4gICAgICAgICAgdmFsdWUzOiBbJ2ZvbycsICdiYXInXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2FkZE92ZXJyaWRlKHAsIHYpIHdpbGwgb3ZlcndyaXRlIGFueSBub24tb2JqZWN0cyBhbG9uZyB0aGUgcGF0aCcsICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIGNvbnN0IHByaiA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgIGNvbnN0IGZpbGUgPSBuZXcgSnNvbkZpbGUocHJqLCAnbXkvb2JqZWN0L2ZpbGUuanNvbicsIHtcbiAgICAgIG9iajoge1xuICAgICAgICBoZWxsbzoge1xuICAgICAgICAgIHdvcmxkOiA0MixcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXSEVOXG4gICAgZmlsZS5hZGRPdmVycmlkZSgnb3ZlcnJpZGUxJywgWydIZWxsbycsIDEyM10pO1xuICAgIGZpbGUuYWRkT3ZlcnJpZGUoJ292ZXJyaWRlMS5vdmVycmlkZTInLCB7IGZvbzogWzFdIH0pO1xuICAgIGZpbGUuYWRkT3ZlcnJpZGUoJ2hlbGxvLndvcmxkLmZvby5iYXInLCA0Mik7XG5cbiAgICAvLyBUSEVOXG4gICAgZXhwZWN0KHN5bnRoU25hcHNob3QocHJqKVsnbXkvb2JqZWN0L2ZpbGUuanNvbiddKS50b1N0cmljdEVxdWFsKHtcbiAgICAgIGhlbGxvOiB7IHdvcmxkOiB7IGZvbzogeyBiYXI6IDQyIH0gfSB9LFxuICAgICAgb3ZlcnJpZGUxOiB7XG4gICAgICAgIG92ZXJyaWRlMjogeyBmb286IFsxXSB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgdGVzdCgnYWRkT3ZlcnJpZGUocCwgdikgd2lsbCBub3Qgc3BsaXQgb24gZXNjYXBlZCBkb3RzJywgKCkgPT4ge1xuICAgIC8vIEdJVkVOXG4gICAgY29uc3QgcHJqID0gbmV3IFRlc3RQcm9qZWN0KCk7XG4gICAgY29uc3QgZmlsZSA9IG5ldyBKc29uRmlsZShwcmosICdteS9vYmplY3QvZmlsZS5qc29uJywgeyBvYmo6IHsgaW5pdGlhbE9iajogJ2Nhbm5vdCBiZSBlbXB0eScgfSB9KTtcblxuICAgIC8vIFdIRU5cbiAgICBmaWxlLmFkZE92ZXJyaWRlKFN0cmluZy5yYXdgSGVsbG9cXC5Xb3JsZC5Gb29cXC5CYXJcXC5CYXpgLCA0Mik7XG4gICAgZmlsZS5hZGRPdmVycmlkZShTdHJpbmcucmF3YFNpbmdsZVxcQmFja1xcU2xhc2hlc2AsIDQyKTtcbiAgICBmaWxlLmFkZE92ZXJyaWRlKFN0cmluZy5yYXdgRXNjYXBlZFxcXFwuQmFja1xcXFwuU2xhc2hlc2AsIDQyKTtcbiAgICBmaWxlLmFkZE92ZXJyaWRlKFN0cmluZy5yYXdgRG91Ymx5RXNjYXBlZFxcXFxcXFxcQmFja1xcXFxcXFxcU2xhc2hlc2AsIDQyKTtcbiAgICBmaWxlLmFkZE92ZXJyaWRlKCdFbmRXaXRoXFxcXCcsIDQyKTsgLy8gUmF3IHN0cmluZyBjYW5ub3QgZW5kIHdpdGggYSBiYWNrc2xhc2hcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcmopWydteS9vYmplY3QvZmlsZS5qc29uJ10pLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgJ2luaXRpYWxPYmonOiAnY2Fubm90IGJlIGVtcHR5JyxcbiAgICAgICdIZWxsby5Xb3JsZCc6IHsgJ0Zvby5CYXIuQmF6JzogNDIgfSxcbiAgICAgICdTaW5nbGVCYWNrU2xhc2hlcyc6IDQyLFxuICAgICAgJ0VzY2FwZWRcXFxcJzogeyAnQmFja1xcXFwnOiB7IFNsYXNoZXM6IDQyIH0gfSxcbiAgICAgICdEb3VibHlFc2NhcGVkXFxcXFxcXFxCYWNrXFxcXFxcXFxTbGFzaGVzJzogNDIsXG4gICAgICAnRW5kV2l0aFxcXFwnOiA0MixcbiAgICB9KTtcbiAgfSk7XG59KTsiXX0=