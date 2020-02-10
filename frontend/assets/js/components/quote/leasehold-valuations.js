/**
 * Quote Tool: Leasehold Valuations
 * ------------------------------------------------------------------------------
 * Component to control the leasehold valuations logic.
 *
 * @namespace quoteToolLeaseholdValuations
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
  container: '[instant-quote="leasehold-valuations"]',
  leaseholdRadios: '[instant-quote-input="radio"]',
  leaseholdSelects: '[instant-quote-input="select"]',
}

let quoteContainer = document.querySelector(selectors.quoteContainer)
let nodes
let currentStepContainer
let firstInit = true

export default() => {

  /**
   * Set the event bus listeners.
   */
  function setListeners() {
    App.EM.on('QuoteTool::leaseholdRadioChosen', (choice) => {
      console.log('QuoteTool::leaseholdRadioChosen', choice)

      selectLeaseholdSelects(choice)
      hideStep(App.QuoteData.step + 1, choice)
      showStep(App.QuoteData.step + 1, choice)
      scrollToStep(App.QuoteData.step + 1)
    })

    App.EM.on('QuoteTool::leaseholdSelectsChosen', (choice) => {
      console.log('QuoteTool::leaseholdSelectsChosen')
      addSelectValuesToQuoteData(choice)
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
   * Show the passed step for the leasehold tool.
   * @param {Number} step the step to show
   */
  function showStep(step, choice = null) {
    if (choice) {
      currentStepContainer = nodes.container.querySelector(`[data-step="${step}"][leasehold-type="${choice}"]`)

    } else {
      currentStepContainer = nodes.container.querySelector(`[data-step="${step}"]`)
    }

    currentStepContainer.classList.add(cssClasses.active)
  }

  function hideStep(step, choice) {
    const other = nodes.container.querySelector(`[data-step="${step}"]:not([leasehold-type="${choice}"])`)

    other.classList.remove(cssClasses.active)
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
   * Logic for the leasehold radio buttons
   */
  function selectLeaseholdType() {
    const inputs = [...nodes.container.querySelectorAll(selectors.leaseholdRadios)]

    inputs.forEach((input) => {
      on('change', input, () => {
        resetLeaseholdSelects()
        App.QuoteData.typeVariant = camelCase(input.dataset.choice)

        if (!input.checked) {
          return
        }

        App.EM.emit('QuoteTool::hideNoQuote')
        App.EM.emit('QuoteTool::leaseholdRadioChosen', input.dataset.choice)
      })
    })
  }

  /**
   * Logic for the leasehold select boxes, only pass when all fields have an entered value.
   */
  function selectLeaseholdSelects(choice) {
    console.log(choice)
    const selects = [...nodes.container.querySelector(`[leasehold-type="${choice}"]`).querySelectorAll(selectors.leaseholdSelects)]

    selects.forEach((select) => {
      on('change', select, () => {
        if (select.type === 'select-one' && !validateInputs(selects)) {
          App.EM.emit('QuoteTool::hideEstimatedQuote')
          App.EM.emit('QuoteTool::hideNoQuote')

          return
        }

        // We can't give a quote for a house lease extension or 7+ flats in block
        if (!checkValidSelectValue(selects)) {
          App.EM.emit('QuoteTool::initaliseNoQuote', (App.QuoteData.step + 2))

          return
        }

        App.EM.emit('QuoteTool::leaseholdSelectsChosen', choice)
        App.EM.emit('QuoteTool::hideNoQuote')
        App.EM.emit('QuoteTool::showEstimatedQuote')
      })
    })
  }

  /**
   * Reset the select boxes.
   */
  function resetLeaseholdSelects() {
    const selects = [...nodes.container.querySelectorAll(selectors.leaseholdSelects)]

    selects.forEach((select) => {
      if (!select.value) {
        return
      }

      select.value = ''
      App.EM.emit('QuoteTool::hideEstimatedQuote')
      App.EM.emit('QuoteTool::hideNoQuote')
    })
  }

  function checkValidSelectValue(selects) {
    let validInput = true

    selects.forEach(select => {
      if (select.options[select.selectedIndex].value === '*') {
        validInput = false
      }
    })

    return validInput
  }

  /**
   * Add the entered select box values to global QuoteData object.
   */
  function addSelectValuesToQuoteData(choice) {
    const selects = [...nodes.container.querySelector(`[leasehold-type="${choice}"]`).querySelectorAll(selectors.leaseholdSelects)]

    selects.forEach((select) => {
      App.QuoteData[select.dataset.select] = select.value
    })
  }

  /**
   * Initialise the component.
   */
  function init() {
    if (firstInit) {
      setListeners()
      cacheSelectors()
      selectLeaseholdType()
    }

    firstInit = false
    App.QuoteData.type = camelCase(nodes.container.getAttribute('instant-quote'))
    showStep(App.QuoteData.step)
  }

  return Object.freeze({
    init,
  })
}
