"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const util_1 = require("./util");
test('makefile synthesises correctly', () => {
    const prj = new util_1.TestProject();
    new __1.Makefile(prj, 'Makefile', {
        all: ['one', 'two', 'three'],
        rules: [
            {
                targets: ['one'],
                recipe: ['touch one'],
                phony: false,
            },
            {
                targets: ['two', 'three'],
                prerequisites: ['one'],
                recipe: ['touch $@'],
            },
            {
                targets: ['clean'],
                recipe: ['rm -f one two three'],
                phony: true,
            },
        ],
    });
    expect(util_1.synthSnapshot(prj).Makefile).toStrictEqual([
        '.PHONY: all',
        'all: one two three',
        '',
        'one:',
        '\ttouch one',
        '',
        'two three: one',
        '\ttouch $@',
        '',
        '.PHONY: clean',
        'clean:',
        '\trm -f one two three',
        '',
    ].join('\n'));
});
test('makefile synthesises correctly using imperative API', () => {
    const prj = new util_1.TestProject();
    new __1.Makefile(prj, 'Makefile')
        .addRule({
        targets: ['one'],
        recipe: ['touch one'],
        phony: false,
    })
        .addRules({
        targets: ['two', 'three'],
        prerequisites: ['one'],
        recipe: ['touch $@'],
    }, {
        targets: ['clean'],
        recipe: ['rm -f one two three'],
        phony: true,
    })
        .addAll('one')
        .addAlls('two', 'three');
    expect(util_1.synthSnapshot(prj).Makefile).toStrictEqual([
        '.PHONY: all',
        'all: one two three',
        '',
        'one:',
        '\ttouch one',
        '',
        'two three: one',
        '\ttouch $@',
        '',
        '.PHONY: clean',
        'clean:',
        '\trm -f one two three',
        '',
    ].join('\n'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZWZpbGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9fX3Rlc3RzX18vbWFrZWZpbGUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBCQUE4QjtBQUM5QixpQ0FBb0Q7QUFFcEQsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtJQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGtCQUFXLEVBQUUsQ0FBQztJQUU5QixJQUFJLFlBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFO1FBQzVCLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDO1FBQzVCLEtBQUssRUFBRTtZQUNMO2dCQUNFLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFDaEIsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDO2dCQUNyQixLQUFLLEVBQUUsS0FBSzthQUNiO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQztnQkFDekIsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUN0QixNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDckI7WUFDRDtnQkFDRSxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2xCLE1BQU0sRUFBRSxDQUFDLHFCQUFxQixDQUFDO2dCQUMvQixLQUFLLEVBQUUsSUFBSTthQUNaO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsb0JBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDaEQsYUFBYTtRQUNiLG9CQUFvQjtRQUNwQixFQUFFO1FBQ0YsTUFBTTtRQUNOLGFBQWE7UUFDYixFQUFFO1FBQ0YsZ0JBQWdCO1FBQ2hCLFlBQVk7UUFDWixFQUFFO1FBQ0YsZUFBZTtRQUNmLFFBQVE7UUFDUix1QkFBdUI7UUFDdkIsRUFBRTtLQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscURBQXFELEVBQUUsR0FBRyxFQUFFO0lBQy9ELE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO0lBRTlCLElBQUksWUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUM7U0FDMUIsT0FBTyxDQUFDO1FBQ1AsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2hCLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUNyQixLQUFLLEVBQUUsS0FBSztLQUNiLENBQUM7U0FDRCxRQUFRLENBQ1A7UUFDRSxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1FBQ3pCLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0QixNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUM7S0FDckIsRUFDRDtRQUNFLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUNsQixNQUFNLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztRQUMvQixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQ0Y7U0FDQSxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQ2IsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUUzQixNQUFNLENBQUMsb0JBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDaEQsYUFBYTtRQUNiLG9CQUFvQjtRQUNwQixFQUFFO1FBQ0YsTUFBTTtRQUNOLGFBQWE7UUFDYixFQUFFO1FBQ0YsZ0JBQWdCO1FBQ2hCLFlBQVk7UUFDWixFQUFFO1FBQ0YsZUFBZTtRQUNmLFFBQVE7UUFDUix1QkFBdUI7UUFDdkIsRUFBRTtLQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYWtlZmlsZSB9IGZyb20gJy4uJztcbmltcG9ydCB7IHN5bnRoU25hcHNob3QsIFRlc3RQcm9qZWN0IH0gZnJvbSAnLi91dGlsJztcblxudGVzdCgnbWFrZWZpbGUgc3ludGhlc2lzZXMgY29ycmVjdGx5JywgKCkgPT4ge1xuICBjb25zdCBwcmogPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICBuZXcgTWFrZWZpbGUocHJqLCAnTWFrZWZpbGUnLCB7XG4gICAgYWxsOiBbJ29uZScsICd0d28nLCAndGhyZWUnXSxcbiAgICBydWxlczogW1xuICAgICAge1xuICAgICAgICB0YXJnZXRzOiBbJ29uZSddLFxuICAgICAgICByZWNpcGU6IFsndG91Y2ggb25lJ10sXG4gICAgICAgIHBob255OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRhcmdldHM6IFsndHdvJywgJ3RocmVlJ10sXG4gICAgICAgIHByZXJlcXVpc2l0ZXM6IFsnb25lJ10sXG4gICAgICAgIHJlY2lwZTogWyd0b3VjaCAkQCddLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGFyZ2V0czogWydjbGVhbiddLFxuICAgICAgICByZWNpcGU6IFsncm0gLWYgb25lIHR3byB0aHJlZSddLFxuICAgICAgICBwaG9ueTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgZXhwZWN0KHN5bnRoU25hcHNob3QocHJqKS5NYWtlZmlsZSkudG9TdHJpY3RFcXVhbChbXG4gICAgJy5QSE9OWTogYWxsJyxcbiAgICAnYWxsOiBvbmUgdHdvIHRocmVlJyxcbiAgICAnJyxcbiAgICAnb25lOicsXG4gICAgJ1xcdHRvdWNoIG9uZScsXG4gICAgJycsXG4gICAgJ3R3byB0aHJlZTogb25lJyxcbiAgICAnXFx0dG91Y2ggJEAnLFxuICAgICcnLFxuICAgICcuUEhPTlk6IGNsZWFuJyxcbiAgICAnY2xlYW46JyxcbiAgICAnXFx0cm0gLWYgb25lIHR3byB0aHJlZScsXG4gICAgJycsIC8vIG5ldyBsaW5lIGF0IGVuZCBvZiBmaWxlXG4gIF0uam9pbignXFxuJykpO1xufSk7XG5cbnRlc3QoJ21ha2VmaWxlIHN5bnRoZXNpc2VzIGNvcnJlY3RseSB1c2luZyBpbXBlcmF0aXZlIEFQSScsICgpID0+IHtcbiAgY29uc3QgcHJqID0gbmV3IFRlc3RQcm9qZWN0KCk7XG5cbiAgbmV3IE1ha2VmaWxlKHByaiwgJ01ha2VmaWxlJylcbiAgICAuYWRkUnVsZSh7XG4gICAgICB0YXJnZXRzOiBbJ29uZSddLFxuICAgICAgcmVjaXBlOiBbJ3RvdWNoIG9uZSddLFxuICAgICAgcGhvbnk6IGZhbHNlLFxuICAgIH0pXG4gICAgLmFkZFJ1bGVzKFxuICAgICAge1xuICAgICAgICB0YXJnZXRzOiBbJ3R3bycsICd0aHJlZSddLFxuICAgICAgICBwcmVyZXF1aXNpdGVzOiBbJ29uZSddLFxuICAgICAgICByZWNpcGU6IFsndG91Y2ggJEAnXSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRhcmdldHM6IFsnY2xlYW4nXSxcbiAgICAgICAgcmVjaXBlOiBbJ3JtIC1mIG9uZSB0d28gdGhyZWUnXSxcbiAgICAgICAgcGhvbnk6IHRydWUsXG4gICAgICB9LFxuICAgIClcbiAgICAuYWRkQWxsKCdvbmUnKVxuICAgIC5hZGRBbGxzKCd0d28nLCAndGhyZWUnKTtcblxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcmopLk1ha2VmaWxlKS50b1N0cmljdEVxdWFsKFtcbiAgICAnLlBIT05ZOiBhbGwnLFxuICAgICdhbGw6IG9uZSB0d28gdGhyZWUnLFxuICAgICcnLFxuICAgICdvbmU6JyxcbiAgICAnXFx0dG91Y2ggb25lJyxcbiAgICAnJyxcbiAgICAndHdvIHRocmVlOiBvbmUnLFxuICAgICdcXHR0b3VjaCAkQCcsXG4gICAgJycsXG4gICAgJy5QSE9OWTogY2xlYW4nLFxuICAgICdjbGVhbjonLFxuICAgICdcXHRybSAtZiBvbmUgdHdvIHRocmVlJyxcbiAgICAnJywgLy8gbmV3IGxpbmUgYXQgZW5kIG9mIGZpbGVcbiAgXS5qb2luKCdcXG4nKSk7XG59KTtcbiJdfQ==