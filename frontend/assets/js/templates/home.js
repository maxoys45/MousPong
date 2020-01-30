/**
 * Home Template
 * ------------------------------------------------------------------------------
 * Template for home page.
 *
 * @namespace homeTemplate
 */
// import {on} from '../helpers/utils'

import Slideshow from '../components/slideshow'

/**
 * Global variables
 */
const selectors = {
  header: '[js-component="header"]',
  headerNav: '[js-component="headerNav"]',
  scrollAnchors: '[js-el="scrollAnchor"]',
}

let nodes = {}

export default () => {

  /**
   * Cache the node selectors
   */
  function cacheSelectors() {
    nodes = {
      header: document.querySelector(selectors.header),
      headerNav: document.querySelector(selectors.headerNav),
      scrollAnchors: [...document.querySelectorAll(selectors.scrollAnchors)],
    }
  }

  /**
   * Set click events
   */
  function setClickEvents() {
  }

  /**
   * Initialise component
   */
  function init() {
    // cacheSelectors()
    // setClickEvents()
    Slideshow().init()
  }

  return Object.freeze({
    init,
  })
}