/**
 * Toggle nav
 * ------------------------------------------------------------------------------
 * Component to toggle mobile navigation.
 *
 * @namespace toggleNav
 */
import {on} from '../helpers/utils'
import cssClasses from '../helpers/cssClasses'

/**
 * Global variables
 */
const selectors = {
  htmlEl: 'html',
  header: '[js-component="header"]',
  navToggle: '[js-trigger="mobileMenu"]',
  slideOutMenu: '[js-component="slideOutMenu"]',
}

let nodes = {}

export default () => {

  /**
   * Cache the node selectors
   */
  function cacheSelectors() {
    nodes = {
      htmlEl: document.querySelector(selectors.htmlEl),
      header: document.querySelector(selectors.header),
      navToggle: document.querySelector(selectors.navToggle),
      slideOutMenu: document.querySelector(selectors.slideOutMenu),
    }
  }

  /**
   * Set listeners
   */
  function setListeners() {
    App.EM.on('Nav::toggle', () => {
      toggleMobileNavigation()
      slideOutMenuPadding()
    })
  }

  /**
   * Set the click events
   */
  function setClickEvents() {
    on('click', nodes.navToggle, () => App.EM.emit('Nav::toggle'))
  }

  /**
   * Toggle mobile navigation by adding/removing class
   */
  function toggleMobileNavigation() {
    nodes.htmlEl.classList.toggle(cssClasses.navOpen)
    nodes.htmlEl.classList.toggle(cssClasses.locked)
  }

  /**
   * Position the slide out menu below the mobile header.
   */
  function slideOutMenuPadding() {
    nodes.slideOutMenu.style.top = `${nodes.header.getBoundingClientRect().height}px`
  }
  /**
   * Initialise component
   */
  function init() {
    cacheSelectors()
    setListeners()
    setClickEvents()
  }

  return Object.freeze({
    init,
  })
}