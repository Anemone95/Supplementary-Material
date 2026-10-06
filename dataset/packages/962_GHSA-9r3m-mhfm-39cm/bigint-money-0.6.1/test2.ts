function divide(a, b) {
  let result = a / b;
  let rem = a % b;
  // if remainder > half divisor, should have rounded up instead of down, so add 1
  if (rem * 2n > b) {
    result++;
  } else if (rem * 2n === b) {
    // Add 1 if result is odd to get an even return value
    if (result % 2n === 1n) result++;
  }
  return result;
}
console.log(divide(3000n, 1578n));
console.log(divide(7n, 2n));
console.log(divide(-7n, 2n));
