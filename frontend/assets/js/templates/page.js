/**
 * Page Template
 * ------------------------------------------------------------------------------
 * Template for standard pages.
 *
 * @namespace pageTemplate
 */

/**
 * Global variables
 */
const selectors = {
  c: 'o',
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

  function componentExists(component) {
    return document.querySelector(`[js-component="${component}"]`)
  }

  /**
   * Initialise component
   */
  function init() {
    console.log('hello im a page', App.strings.pageTemplate)

    return

    if (componentExists('surveyCalculator')) {
      surveyCalculator().init()
    }
    // cacheSelectors()
    // setClickEvents()
    // initiateCarousel()
  }

  return Object.freeze({
    init,
  })
}