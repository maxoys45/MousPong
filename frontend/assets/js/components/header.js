/**
 * Header
 * ------------------------------------------------------------------------------
 * Component for the site header.
 *
 * @namespace header
 */
import {debounce} from 'debounce'

import {on} from '../helpers/utils'
import cssClasses from '../helpers/cssClasses'
import breakpoints from '../helpers/breakpoints'

/**
 * Global variables
 */
const selectors = {
  header: '[js-component="header"]',
  headerBrand: '[js-el="headerBrand"]',
  content: '[js-el="pageContent"]',
}

let passedWaypoint = false
let lastScrollPos = 0

export default () => {

  /**
   * Node selectors
   */
  const nodes = {
    header: document.querySelector(selectors.header),
    headerBrand: document.querySelector(selectors.headerBrand),
    content: document.querySelector(selectors.content),
  }

  /**
   * Set listeners
   */
  function setListeners() {
    on('resize', debounce(() => {
      setupMainContent()
      maximiseHeader()
    }, 250))

    on('scroll', debounce(() => toggleFullHeader(), 50))
  }

  /**
   * Set the amount of padding for the main content area based on fixed header height.
   */
  function setupMainContent() {
    nodes.content.classList.add(cssClasses.active)
    nodes.content.style.paddingTop = `${nodes.header.getBoundingClientRect().height}px`
  }

  /**
   * Check how far the page has scrolled, and if exceeds header brand height,
   * transform header to only show navigation.
   * - Also maximise header on any upward scroll.
   * - Also set to not continuously check.
   */
  function toggleFullHeader() {
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
    const brandHeight = nodes.headerBrand.getBoundingClientRect().height

    if (window.matchMedia(breakpoints.min.medium).matches) {
      if (scrollTop >= brandHeight) {
        if (!passedWaypoint) {
          minimiseHeader(brandHeight)
        }
      } else {
        if (passedWaypoint) {
          maximiseHeader()
        }
      }

      if (scrollTop < lastScrollPos) {
        maximiseHeader()
      }
    }
    lastScrollPos = scrollTop <= 0 ? 0 : scrollTop
  }

  /**
   * Minimise the header with transform.
   * @param {Integer} brandHeight Size of header
   */
  function minimiseHeader(brandHeight) {
    passedWaypoint = true
    nodes.header.style.transform = `translateY(-${brandHeight}px)`
  }

  /**
   * Maximise the header with transform.
   */
  function maximiseHeader() {
    passedWaypoint = false
    nodes.header.style.transform = `none`
  }

  /**
   * Initialise component
   */
  function init() {
    setListeners()
    setupMainContent()
    toggleFullHeader()
  }

  return Object.freeze({
    init,
  })
}