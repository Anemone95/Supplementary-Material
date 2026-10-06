 function divide(a, b) {
      let result = a/b;
      // if modulo is over half or equal to divisor
      if ((a % b) * 2n >= b) {
         // If result was odd, go to nearest even
         if (result % 2n === 1n) {
            result += (result > 0) ? 1 : -1;
         }
      } 
      return result;
    }

console.log(divide(-10n, 4n));
