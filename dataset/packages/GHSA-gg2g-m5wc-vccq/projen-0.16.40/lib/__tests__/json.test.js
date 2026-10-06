"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const util_1 = require("./util");
test('json object can be mutated before synthesis', () => {
    const prj = new util_1.TestProject();
    const obj = {
        hello: 'world',
    };
    new __1.JsonFile(prj, 'my/json/file.json', { obj });
    // mutate obj (should be reflected in the output)
    obj.anotherField = {
        foo: 1234,
    };
    expect(util_1.synthSnapshot(prj)['my/json/file.json']).toStrictEqual({
        hello: 'world',
        anotherField: { foo: 1234 },
    });
});
test('omitEmpty', () => {
    // GIVEN
    const p = new util_1.TestProject();
    // WHEN
    new __1.JsonFile(p, 'file.json', {
        omitEmpty: true,
        obj: {
            hello: 1234,
            empty: {},
            array_with_undefined: [undefined, 123, 456],
            child: {
                with: 'hello',
                empty: {
                    subchild: {},
                },
                empty_strings_are_not_omitted: '',
                zeros_are_not_omitted: 0,
                empty_array: [],
                array_with_empty_objects: [{}, 123],
                array_with_empty_subobjects: [
                    {
                        i_am_empty: {},
                        i_am_not: 'hi there',
                    },
                    {
                        just: 1234,
                    },
                ],
            },
        },
    });
    // THEN
    expect(util_1.synthSnapshot(p)['file.json']).toStrictEqual({
        hello: 1234,
        array_with_undefined: [123, 456],
        child: {
            with: 'hello',
            empty_strings_are_not_omitted: '',
            zeros_are_not_omitted: 0,
            array_with_empty_objects: [123],
            array_with_empty_subobjects: [
                {
                    i_am_not: 'hi there',
                },
                {
                    just: 1234,
                },
            ],
        },
    });
});
test('json file can contain projen marker', () => {
    const prj = new util_1.TestProject();
    const obj = {};
    new __1.JsonFile(prj, 'my/json/file-marker.json', { obj, marker: true });
    const output = util_1.synthSnapshot(prj)['my/json/file-marker.json'];
    expect(output['//']).toBe(__1.JsonFile.PROJEN_MARKER);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL19fdGVzdHNfXy9qc29uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBOEI7QUFDOUIsaUNBQW9EO0FBRXBELElBQUksQ0FBQyw2Q0FBNkMsRUFBRSxHQUFHLEVBQUU7SUFDdkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBVyxFQUFFLENBQUM7SUFFOUIsTUFBTSxHQUFHLEdBQVE7UUFDZixLQUFLLEVBQUUsT0FBTztLQUNmLENBQUM7SUFFRixJQUFJLFlBQVEsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBRWhELGlEQUFpRDtJQUNqRCxHQUFHLENBQUMsWUFBWSxHQUFHO1FBQ2pCLEdBQUcsRUFBRSxJQUFJO0tBQ1YsQ0FBQztJQUVGLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDNUQsS0FBSyxFQUFFLE9BQU87UUFDZCxZQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQzVCLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7SUFDckIsUUFBUTtJQUNSLE1BQU0sQ0FBQyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO0lBRTVCLE9BQU87SUFDUCxJQUFJLFlBQVEsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFO1FBQzNCLFNBQVMsRUFBRSxJQUFJO1FBQ2YsR0FBRyxFQUFFO1lBQ0gsS0FBSyxFQUFFLElBQUk7WUFDWCxLQUFLLEVBQUUsRUFBRTtZQUNULG9CQUFvQixFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDM0MsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRTtvQkFDTCxRQUFRLEVBQUUsRUFBRTtpQkFDYjtnQkFDRCw2QkFBNkIsRUFBRSxFQUFFO2dCQUNqQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUN4QixXQUFXLEVBQUUsRUFBRTtnQkFDZix3QkFBd0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUM7Z0JBQ25DLDJCQUEyQixFQUFFO29CQUMzQjt3QkFDRSxVQUFVLEVBQUUsRUFBRTt3QkFDZCxRQUFRLEVBQUUsVUFBVTtxQkFDckI7b0JBQ0Q7d0JBQ0UsSUFBSSxFQUFFLElBQUk7cUJBQ1g7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1FBQ2xELEtBQUssRUFBRSxJQUFJO1FBQ1gsb0JBQW9CLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQ2hDLEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsNkJBQTZCLEVBQUUsRUFBRTtZQUNqQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3hCLHdCQUF3QixFQUFFLENBQUMsR0FBRyxDQUFDO1lBQy9CLDJCQUEyQixFQUFFO2dCQUMzQjtvQkFDRSxRQUFRLEVBQUUsVUFBVTtpQkFDckI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLElBQUk7aUJBQ1g7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO0lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO0lBRTlCLE1BQU0sR0FBRyxHQUFRLEVBQUUsQ0FBQztJQUVwQixJQUFJLFlBQVEsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFFckUsTUFBTSxNQUFNLEdBQUcsb0JBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRTlELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3BELENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSnNvbkZpbGUgfSBmcm9tICcuLic7XG5pbXBvcnQgeyBzeW50aFNuYXBzaG90LCBUZXN0UHJvamVjdCB9IGZyb20gJy4vdXRpbCc7XG5cbnRlc3QoJ2pzb24gb2JqZWN0IGNhbiBiZSBtdXRhdGVkIGJlZm9yZSBzeW50aGVzaXMnLCAoKSA9PiB7XG4gIGNvbnN0IHByaiA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gIGNvbnN0IG9iajogYW55ID0ge1xuICAgIGhlbGxvOiAnd29ybGQnLFxuICB9O1xuXG4gIG5ldyBKc29uRmlsZShwcmosICdteS9qc29uL2ZpbGUuanNvbicsIHsgb2JqIH0pO1xuXG4gIC8vIG11dGF0ZSBvYmogKHNob3VsZCBiZSByZWZsZWN0ZWQgaW4gdGhlIG91dHB1dClcbiAgb2JqLmFub3RoZXJGaWVsZCA9IHtcbiAgICBmb286IDEyMzQsXG4gIH07XG5cbiAgZXhwZWN0KHN5bnRoU25hcHNob3QocHJqKVsnbXkvanNvbi9maWxlLmpzb24nXSkudG9TdHJpY3RFcXVhbCh7XG4gICAgaGVsbG86ICd3b3JsZCcsXG4gICAgYW5vdGhlckZpZWxkOiB7IGZvbzogMTIzNCB9LFxuICB9KTtcbn0pO1xuXG50ZXN0KCdvbWl0RW1wdHknLCAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IHAgPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICAvLyBXSEVOXG4gIG5ldyBKc29uRmlsZShwLCAnZmlsZS5qc29uJywge1xuICAgIG9taXRFbXB0eTogdHJ1ZSxcbiAgICBvYmo6IHtcbiAgICAgIGhlbGxvOiAxMjM0LFxuICAgICAgZW1wdHk6IHt9LFxuICAgICAgYXJyYXlfd2l0aF91bmRlZmluZWQ6IFt1bmRlZmluZWQsIDEyMywgNDU2XSxcbiAgICAgIGNoaWxkOiB7XG4gICAgICAgIHdpdGg6ICdoZWxsbycsXG4gICAgICAgIGVtcHR5OiB7XG4gICAgICAgICAgc3ViY2hpbGQ6IHt9LFxuICAgICAgICB9LFxuICAgICAgICBlbXB0eV9zdHJpbmdzX2FyZV9ub3Rfb21pdHRlZDogJycsXG4gICAgICAgIHplcm9zX2FyZV9ub3Rfb21pdHRlZDogMCxcbiAgICAgICAgZW1wdHlfYXJyYXk6IFtdLFxuICAgICAgICBhcnJheV93aXRoX2VtcHR5X29iamVjdHM6IFt7fSwgMTIzXSxcbiAgICAgICAgYXJyYXlfd2l0aF9lbXB0eV9zdWJvYmplY3RzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaV9hbV9lbXB0eToge30sXG4gICAgICAgICAgICBpX2FtX25vdDogJ2hpIHRoZXJlJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGp1c3Q6IDEyMzQsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwKVsnZmlsZS5qc29uJ10pLnRvU3RyaWN0RXF1YWwoe1xuICAgIGhlbGxvOiAxMjM0LFxuICAgIGFycmF5X3dpdGhfdW5kZWZpbmVkOiBbMTIzLCA0NTZdLCAvLyB1bmRlZmluZWQgaXMgc2tpcHBlZFxuICAgIGNoaWxkOiB7XG4gICAgICB3aXRoOiAnaGVsbG8nLFxuICAgICAgZW1wdHlfc3RyaW5nc19hcmVfbm90X29taXR0ZWQ6ICcnLFxuICAgICAgemVyb3NfYXJlX25vdF9vbWl0dGVkOiAwLFxuICAgICAgYXJyYXlfd2l0aF9lbXB0eV9vYmplY3RzOiBbMTIzXSxcbiAgICAgIGFycmF5X3dpdGhfZW1wdHlfc3Vib2JqZWN0czogW1xuICAgICAgICB7XG4gICAgICAgICAgaV9hbV9ub3Q6ICdoaSB0aGVyZScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBqdXN0OiAxMjM0LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICB9KTtcbn0pO1xuXG50ZXN0KCdqc29uIGZpbGUgY2FuIGNvbnRhaW4gcHJvamVuIG1hcmtlcicsICgpID0+IHtcbiAgY29uc3QgcHJqID0gbmV3IFRlc3RQcm9qZWN0KCk7XG5cbiAgY29uc3Qgb2JqOiBhbnkgPSB7fTtcblxuICBuZXcgSnNvbkZpbGUocHJqLCAnbXkvanNvbi9maWxlLW1hcmtlci5qc29uJywgeyBvYmosIG1hcmtlcjogdHJ1ZSB9KTtcblxuICBjb25zdCBvdXRwdXQgPSBzeW50aFNuYXBzaG90KHByailbJ215L2pzb24vZmlsZS1tYXJrZXIuanNvbiddO1xuXG4gIGV4cGVjdChvdXRwdXRbJy8vJ10pLnRvQmUoSnNvbkZpbGUuUFJPSkVOX01BUktFUik7XG59KTsiXX0=