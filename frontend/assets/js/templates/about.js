/**
 * About Template
 * ------------------------------------------------------------------------------
 * Template for about page.
 *
 * @namespace aboutTemplate
 */

/**
 * Global variables
 */
const selectors = {
}

let nodes = {}

export default () => {

  /**
   * Cache the node selectors
   */
  function cacheSelectors() {
    nodes = {
      container: document.querySelector(selectors.container),
    }
  }

  /**
   * Set listeners
   */
  function setListeners() {
  }

  /**
   * Initialise component
   */
  function init() {
    // cacheSelectors()
    // setClickEvents()
    // initiateCarousel()
  }

  return Object.freeze({
    init,
  })
}