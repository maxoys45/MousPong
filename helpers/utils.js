/**
 * Get the difference between 2 numbers.
 * @param {Number} a first number to compare
 * @param {Number} b second number to compare
 */
export const numDifference = (a, b) => {
  return Math.abs(a - b)
}

/**
 * Round a given number to decimal places.
 * Correctly rounds numbers like 1.005 to 1.01 (just Math.round would fail)
 * @param {Number} num number to be rounded
 */
export const roundNumberTwoDecimals = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}
