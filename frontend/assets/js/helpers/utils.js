/**
 * Helper: Utils
 * ------------------------------------------------------------------------------
 * Utility functions.
 *
 * @namespace utils
 */

/**
 * Shortcut function to add an event listener.
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param {String} event -The event type.
 * @param {Node} elem - The element to attach the event to (optional, defaults to window).
 * @param {Function} callback - The callback to run on the event.
 * @param {Boolean} capture - If true, forces bubbling on non-bubbling events.
 */
export function on(event, elem = window, callback, capture = false) {
  /**
   * If only a string is passed into the element parameter.
   */
  if (typeof elem === 'string') {
    document.querySelector(elem).addEventListener(event, callback, capture)
    return
  }

  /**
   * If an element is not defined in parameters, then shift callback across.
   */
  if (typeof elem === 'function') {
    window.addEventListener(event, elem)
    return
  }

  /**
   * Default listener.
   */
  elem.addEventListener(event, callback, capture)
}

/**
 * Check each input has a valid value.
 * @param {Object} inputs current inputs being interated
 */
export function validateInputs(inputs) {
  let inputValid = true

  inputs.forEach((input) => {
    if (!input.value) {
      inputValid = false
    }
  })

  return inputValid
}

/**
 * Convert a number to GBP format.
 * @param {Number} num number to be converted
 */
export function toGbpFormat(num) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(num)
}

/**
 * Convert a string from camelCase to Capitalised Case.
 * @param {String} string passed text
 */
export function camelToCapitalCase(string) {
  return string
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => { return str.toUpperCase() })
}

export function elementIsVisible(el) {
  const bounding = el.getBoundingClientRect()

  return (
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}