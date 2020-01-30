/**
 * Component exists
 * ------------------------------------------------------------------------------
 * Component to see if components are present on page.
 *
 * @namespace componentExists
 */

export default(el) => {
  return document.querySelector(`[${el}]`)
}