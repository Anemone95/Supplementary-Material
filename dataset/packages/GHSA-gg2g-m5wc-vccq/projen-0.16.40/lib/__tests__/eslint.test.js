"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const logger_1 = require("../logger");
const util_1 = require("./util");
test('devdirs', () => {
    // GIVEN
    const project = new __1.NodeProject({
        outdir: util_1.mkdtemp(),
        name: 'test',
        logging: { level: logger_1.LogLevel.OFF },
        defaultReleaseBranch: 'master',
    });
    // WHEN
    new __1.Eslint(project, {
        devdirs: ['foo', 'bar'],
        dirs: ['mysrc'],
    });
    // THEN
    expect(util_1.synthSnapshot(project)['.eslintrc.json']).toMatchSnapshot();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNsaW50LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvX190ZXN0c19fL2VzbGludC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEJBQXlDO0FBQ3pDLHNDQUFxQztBQUNyQyxpQ0FBZ0Q7QUFFaEQsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7SUFDbkIsUUFBUTtJQUNSLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBVyxDQUFDO1FBQzlCLE1BQU0sRUFBRSxjQUFPLEVBQUU7UUFDakIsSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsaUJBQVEsQ0FBQyxHQUFHLEVBQUU7UUFDaEMsb0JBQW9CLEVBQUUsUUFBUTtLQUMvQixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsSUFBSSxVQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2xCLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdkIsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDO0tBQ2hCLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsb0JBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFc2xpbnQsIE5vZGVQcm9qZWN0IH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgTG9nTGV2ZWwgfSBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgbWtkdGVtcCwgc3ludGhTbmFwc2hvdCB9IGZyb20gJy4vdXRpbCc7XG5cbnRlc3QoJ2RldmRpcnMnLCAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IHByb2plY3QgPSBuZXcgTm9kZVByb2plY3Qoe1xuICAgIG91dGRpcjogbWtkdGVtcCgpLFxuICAgIG5hbWU6ICd0ZXN0JyxcbiAgICBsb2dnaW5nOiB7IGxldmVsOiBMb2dMZXZlbC5PRkYgfSxcbiAgICBkZWZhdWx0UmVsZWFzZUJyYW5jaDogJ21hc3RlcicsXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgbmV3IEVzbGludChwcm9qZWN0LCB7XG4gICAgZGV2ZGlyczogWydmb28nLCAnYmFyJ10sXG4gICAgZGlyczogWydteXNyYyddLFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChzeW50aFNuYXBzaG90KHByb2plY3QpWycuZXNsaW50cmMuanNvbiddKS50b01hdGNoU25hcHNob3QoKTtcbn0pOyJdfQ==