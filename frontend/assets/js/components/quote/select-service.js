/**
 * Quote tool: Select service
 * ------------------------------------------------------------------------------
 * Component to choose which quote tool will be used on the instant quote tool.
 *
 * @namespace quoteToolSelectService
 */
import { camelCase } from 'lodash';

import { on, elementIsVisible } from '../../helpers/utils'
import breakpoints from '../../helpers/breakpoints'

/**
 * Global variables
 */
const selectors = {
  header: '[js-component="header"]',
  headerNav: '[js-component="headerNav"]',
  quoteContainer: '[instant-quote="container"]',
  container: '[instant-quote="selectService"]',
  inputs: '[instant-quote-input="selectService"]',
}

let quoteContainer = document.querySelector(selectors.quoteContainer)
let nodes

export default() => {

  /**
   * Cache the node selectors
   */
  function cacheSelectors() {
    nodes = {
      header: document.querySelector(selectors.header),
      headerNav: document.querySelector(selectors.headerNav),
      container: quoteContainer.querySelector(selectors.container),
    }
  }

  /**
   * Select the service from the radio list and emit event.
   */
  function selectService() {
    const inputs = [...nodes.container.querySelectorAll(selectors.inputs)]

    inputs.forEach((input) => {
      on('change', input, () => {
        if (!input.checked) {
          return
        }

        App.QuoteData = {
          type: camelCase(input.dataset.choice),
          step: 2,
        }

        App.EM.emit('QuoteTool::resetRadios')
        App.EM.emit('QuoteTool::initialise', input.dataset.choice)

        scrollToSelectedQuoteType()
      })
    })
  }

  /**
   * Scroll to the active step.
   * Optional param to pass in custom selector to scroll to.
   * @param {Number} step the passed step number.
   */
  function scrollToSelectedQuoteType() {
    const selectedQuoteType = quoteContainer.querySelector('.iq__step-container .is-active')

    if (elementIsVisible(selectedQuoteType)) {
      return
    }

    let scrollDistance = ((selectedQuoteType.getBoundingClientRect().top + window.pageYOffset) - 20)

    if (window.matchMedia(breakpoints.min.medium).matches) {
      scrollDistance -= nodes.headerNav.offsetHeight
    } else {
      scrollDistance -= nodes.header.offsetHeight
    }

    window.scrollTo(0, scrollDistance)
  }

  /**
   * Initialise component
   */
  function init() {
    cacheSelectors()
    selectService()
  }

  return Object.freeze({
    init,
  })
}
