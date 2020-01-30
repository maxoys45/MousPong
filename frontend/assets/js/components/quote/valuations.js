/**
 * Quote Tool: Valuations
 * ------------------------------------------------------------------------------
 * Component to control the valuations logic.
 *
 * @namespace quoteToolValuations
 */
import { camelCase } from 'lodash'

import { on, validateInputs, elementIsVisible } from '../../helpers/utils'
import cssClasses from '../../helpers/cssClasses'
import breakpoints from '../../helpers/breakpoints'

/**
 * Global variables
 */
const selectors = {
  header: '[js-component="header"]',
  headerNav: '[js-component="headerNav"]',
  quoteContainer: '[instant-quote="container"]',
  container: '[instant-quote="valuations"]',
  valuationRadios: '[instant-quote-input="radio"]',
  valuationSelects: '[instant-quote-input="select"]',
}

let quoteContainer = document.querySelector(selectors.quoteContainer)
let nodes
let currentStep
let firstInit = true

export default() => {

  /**
   * Set the event bus listeners.
   */
  function setListeners() {
    App.EM.on('QuoteTool::valuationRadioChosen', (choice) => {
      console.log('QuoteTool::valuationRadioChosen', choice)

      showStep(App.QuoteData.step + 1)
      scrollToStep(App.QuoteData.step + 1)
    })

    App.EM.on('QuoteTool::valuationSelectsChosen', () => {
      console.log('QuoteTool::valuationSelectsChosen')
      addSelectValuesToQuoteData()
      scrollToStep(App.QuoteData.step + 2, '[instant-quote="quote"]')
    })
  }

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
   * Show the passed step for the valuations tool.
   * @param {Number} step the step to show
   */
  function showStep(step) {
    currentStep = nodes.container.querySelector(`[data-step="${step}"]`)

    currentStep.classList.add(cssClasses.active)
  }

  /**
   * Scroll to the active step.
   * Optional param to pass in custom selector to scroll to.
   * @param {Number} step the passed step number.
   */
  function scrollToStep(step, selector = null) {
    let el

    if (selector) {
      el = quoteContainer.querySelector(`[data-step="${step}"]${selector}`)
    } else {
      el = nodes.container.querySelector(`[data-step="${step}"]`)
    }

    if (elementIsVisible(el)) {
      return
    }

    let scrollDistance = ((el.getBoundingClientRect().top + window.pageYOffset) - 20)

    if (window.matchMedia(breakpoints.min.medium).matches) {
      scrollDistance -= nodes.headerNav.offsetHeight
    } else {
      scrollDistance -= nodes.header.offsetHeight
    }

    window.scrollTo(0, scrollDistance)
  }

  /**
   * Logic for the valuation radio buttons
   */
  function selectValuationType() {
    const inputs = [...nodes.container.querySelectorAll(selectors.valuationRadios)]

    inputs.forEach((input) => {
      on('change', input, () => {
        resetValuationSelects()
        App.QuoteData.typeVariant = camelCase(input.dataset.choice)

        if (!input.checked) {
          return
        }

        App.EM.emit('QuoteTool::hideNoQuote')
        App.EM.emit('QuoteTool::valuationRadioChosen', input.dataset.choice)
      })
    })
  }

  /**
   * Logic for the valuation select boxes, only pass when all fields have an entered value.
   */
  function selectValuationSelects() {
    const selects = [...nodes.container.querySelectorAll(selectors.valuationSelects)]

    selects.forEach((select) => {
      on('change', select, () => {
        if (select.type === 'select-one' && !validateInputs(selects)) {
          App.EM.emit('QuoteTool::hideEstimatedQuote')
          App.EM.emit('QuoteTool::hideNoQuote')

          return
        }

        App.EM.emit('QuoteTool::valuationSelectsChosen')
        App.EM.emit('QuoteTool::showEstimatedQuote')
      })
    })
  }

  /**
   * Reset the select boxes.
   */
  function resetValuationSelects() {
    const selects = [...nodes.container.querySelectorAll(selectors.valuationSelects)]

    selects.forEach((select) => {
      if (!select.value) {
        return
      }

      select.value = ''
      App.EM.emit('QuoteTool::hideEstimatedQuote')
      App.EM.emit('QuoteTool::hideNoQuote')
    })
  }

  /**
   * Add the entered select box values to global QuoteData object.
   */
  function addSelectValuesToQuoteData() {
    const selects = [...nodes.container.querySelectorAll(selectors.valuationSelects)]

    selects.forEach((select) => {
      App.QuoteData[select.dataset.select] = select.value
    })
  }

  /**
   * Initalise component.
   */
  function init() {
    if (firstInit) {
      setListeners()
      cacheSelectors()
      selectValuationType()
      selectValuationSelects()
    }

    firstInit = false
    App.QuoteData.type = camelCase(nodes.container.getAttribute('instant-quote'))
    showStep(App.QuoteData.step)
  }

  return Object.freeze({
    init,
  })
}
