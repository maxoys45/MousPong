/**
 * Quote Tool: Surveys
 * ------------------------------------------------------------------------------
 * Component to control the surveys logic.
 *
 * @namespace quoteToolSurveys
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
  container: '[instant-quote="surveys"]',
  surveyRadios: '[instant-quote-input="radio"]',
  surveySelects: '[instant-quote-input="select"]',
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
    App.EM.on('QuoteTool::surveyRadioChosen', (choice) => {
      console.log('QuoteTool::surveyRadioChosen', choice)

      showStep(App.QuoteData.step + 1)
      scrollToStep(App.QuoteData.step + 1)
    })

    App.EM.on('QuoteTool::surveySelectsChosen', () => {
      console.log('QuoteTool::surveySelectsChosen')
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
   * Show the passed step for the surveys tool.
   * @param {Number} step the step to show
   */
  function showStep(step) {
    currentStepContainer = nodes.container.querySelector(`[data-step="${step}"]`)

    currentStepContainer.classList.add(cssClasses.active)
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
   * Logic for the survey radio buttons
   */
  function selectSurveyType() {
    const inputs = [...nodes.container.querySelectorAll(selectors.surveyRadios)]

    inputs.forEach((input) => {
      on('change', input, () => {
        resetSurveySelects()
        App.QuoteData.typeVariant = camelCase(input.dataset.choice)

        // Roof survey does not have any further options and does not give a quote.
        if (input.dataset.choice === 'roof-survey') {
          App.EM.emit('QuoteTool::initaliseNoQuote', (App.QuoteData.step + 1))

          return
        }

        if (!input.checked) {
          return
        }

        App.EM.emit('QuoteTool::hideNoQuote')
        App.EM.emit('QuoteTool::surveyRadioChosen', input.dataset.choice)
      })
    })
  }

  /**
   * Logic for the survey select boxes, only pass when all fields have an entered value.
   */
  function selectSurveySelects() {
    const selects = [...nodes.container.querySelectorAll(selectors.surveySelects)]

    selects.forEach((select) => {
      on('change', select, () => {
        if (select.type === 'select-one' && !validateInputs(selects)) {
          App.EM.emit('QuoteTool::hideEstimatedQuote')
          App.EM.emit('QuoteTool::hideNoQuote')

          return
        }

        App.EM.emit('QuoteTool::surveySelectsChosen')
        App.EM.emit('QuoteTool::showEstimatedQuote')
      })
    })
  }

  /**
   * Reset the select boxes.
   */
  function resetSurveySelects() {
    const selects = [...nodes.container.querySelectorAll(selectors.surveySelects)]

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
    const selects = [...nodes.container.querySelectorAll(selectors.surveySelects)]

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
      selectSurveyType()
      selectSurveySelects()
    }

    firstInit = false
    App.QuoteData.type = camelCase(nodes.container.getAttribute('instant-quote'))
    showStep(App.QuoteData.step)
  }

  return Object.freeze({
    init,
  })
}
