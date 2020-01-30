/**
 * Quote Tool Container
 * ------------------------------------------------------------------------------
 * Component to determine which quote tool should be used.
 *
 * @namespace quoteToolContainer
 */
import { on, toGbpFormat, camelToCapitalCase } from '../../helpers/utils'
import componentExists from '../../helpers/componentExists'
import cssClasses from '../../helpers/cssClasses'

import SelectService from './select-service'
import Surveys from './surveys'
import Valuations from './valuations'
import LeaseholdValuations from './leasehold-valuations'

import data from './data'

/**
 * Global variables
 */
const selectors = {
  htmlEl: 'html',
  quoteContainer: '[instant-quote="container"]',
  steps: '[data-step]',
  radios: '[instant-quote-input="radio"]',
  estimatedQuoteContainer: '[instant-quote="quote"]',
  estimatedQuoteValue: '[instant-quote="estimated-quote-value"]',
  noQuoteContainer: '[instant-quote="no_quote"]',
  formTriggerBtns: '[instant-quote="form-trigger"]',
  formModal: '[el="contact-modal"]',
  formModalInner: '[el="contact-modal-inner"]',
  formCloseBtn: '[el="close-instant-modal"]',
  formHiddenFields: '[data-instant-hidden-field]',
  formTextarea: '[el="instant-textarea"]',
  // firstStep: '[data-step="1"]',
  // quoteInputs: '[instant-quote-input]',
  // quoteRadios: '[instant-quote-input="radio"]',
  // quoteSelects: '[instant-quote-input="select"]',
}

let quoteContainer = document.querySelector(selectors.quoteContainer)
let nodes = {}
// let currentStepContainers
// let activeStepContainer

export default () => {

  /**
   * Cache the node selectors
   */
  function cacheSelectors() {
    nodes = {
      htmlEl: document.querySelector(selectors.htmlEl),
      estimatedQuoteContainer: quoteContainer.querySelector(selectors.estimatedQuoteContainer),
      estimatedQuoteValue: quoteContainer.querySelector(selectors.estimatedQuoteValue),
      noQuoteContainer: quoteContainer.querySelector(selectors.noQuoteContainer),
      formTriggerBtns: [...quoteContainer.querySelectorAll(selectors.formTriggerBtns)],
      formModal: document.querySelector(selectors.formModal),
      formModalInner: document.querySelector(selectors.formModalInner),
      formCloseBtn: document.querySelector(selectors.formCloseBtn),
      formHiddenFields: [...document.querySelectorAll(selectors.formHiddenFields)],
      formTextarea: document.querySelector(selectors.formTextarea),
    }
  }

  /**
   * Set listeners.
   */
  function setListeners() {
    App.EM.on('QuoteTool::initialise', (choice) => {
      console.log('QuoteTool::initialise', choice)
      loadActiveQuoteTool(choice)
    })

    App.EM.on('QuoteTool::showEstimatedQuote', () => {
      console.log('QuoteTool::showEstimatedQuote')
      calculateEstimatedQuote()
      showEstimatedQuote()
    })

    App.EM.on('QuoteTool::hideEstimatedQuote', () => {
      console.log('QuoteTool::hideEstimatedQuote')
      hideEstimatedQuote()
    })

    App.EM.on('QuoteTool::initaliseNoQuote', (fromStep) => {
      console.log('QuoteTool::initaliseNoQuote')
      App.EM.emit('QuoteTool::hideSteps', fromStep)
      App.EM.emit('QuoteTool::showNoQuote')
    })

    App.EM.on('QuoteTool::showNoQuote', () => {
      console.log('QuoteTool::showNoQuote')
      showNoQuote()
    })

    App.EM.on('QuoteTool::hideNoQuote', () => {
      console.log('QuoteTool::hideNoQuote')
      hideNoQuote()
    })

    App.EM.on('QuoteTool::hideSteps', (fromStep) => {
      console.log('QuoteTool::hideSteps', fromStep)
      hideSteps(fromStep)
    })

    App.EM.on('QuoteTool::resetRadios', () => {
      console.log('QuoteTool::resetRadios')
      resetRadios()
    })

    App.EM.on('QuoteTool::triggerQuoteForm', () => {
      console.log('QuoteTool::triggerQuoteForm')
      populateFormHiddenFields()
      toggleQuoteForm()
      scrollContactModal('top')
    })

    App.EM.on('QuoteTool::closeModal', () => {
      toggleQuoteForm()
    })

    App.EM.on('QuoteTool::textareaFocus', () => {
      scrollContactModal('bottom')
    })

    // App.EM.on('QuoteTool::inputChange', (step, inputChoice) => {
    //   // hideStep(step)
    //   showActiveStep(step + 1, inputChoice)
    // })

    // App.EM.on('QuoteTool::showStep', (step) => {
    //   initialiseStep(step)
    // })
  }

  function setEvents() {
    nodes.formTriggerBtns.forEach(btn => {
      on('click', btn, () => App.EM.emit('QuoteTool::triggerQuoteForm'))
    })

    on('click', nodes.formCloseBtn, () => App.EM.emit('QuoteTool::closeModal'))

    on('click', (event) => {
      if (event.target === nodes.formModal) {
        App.EM.emit('QuoteTool::closeModal')
      }
    })

    on('focus', nodes.formTextarea, () => App.EM.emit('QuoteTool::textareaFocus'))
  }

  /**
   * Load the appropriate quote tool component.
   * @param {String} choice the selected quote type
   */
  function loadActiveQuoteTool(choice) {
    App.EM.emit('QuoteTool::hideSteps')

    switch (choice) {
      case 'surveys':
        Surveys().init()
        break

      case 'valuations':
        Valuations().init()
        break

      case 'leasehold-valuations':
        LeaseholdValuations().init()
        break

      case 'party-wall-matters':
        App.EM.emit('QuoteTool::initaliseNoQuote')
        break

      default:
        SelectService().init()
        break
    }
  }

  /**
   * Reset the quote tool radios.
   */
  function resetRadios() {
    const radios = [...quoteContainer.querySelectorAll(selectors.radios)]

    radios.forEach((radio) => {
      radio.checked = false
    })
  }

  // @TODO: Make radio reset work the same as hiding steps.

  /**
   * Hide steps from the passed parameter, defaulted to all.
   * @param {Number} fromStep the passed step number to hide from
   */
  function hideSteps(fromStep = 1) {
    const steps = [...quoteContainer.querySelectorAll(selectors.steps)]
    let stepsSubset = []

    steps.forEach((step) => {
      if (step.dataset.step >= fromStep) {
        stepsSubset.push(step)
      }
    })

    stepsSubset.forEach((step) => {
      step.classList.remove(cssClasses.active)
    })
  }

  // // function setEvents() {

  // // }

  // function showActiveStep(step, inputChoice) {
  //   console.log(`step = ${step}`)
  //   console.log(`inputChoice = ${inputChoice}`)
  //   currentStepContainers = [...quoteContainer.querySelectorAll(`[data-step="${step}"]`)]

  //   if (inputChoice) {
  //     activeStepContainer = quoteContainer.querySelector(`[data-form-choice="${inputChoice}"][data-step="${step}"]`)
  //   } else {
  //     activeStepContainer = quoteContainer.querySelector(`[data-step="${step}"]`)
  //   }

  //   if (!activeStepContainer) {
  //     return
  //   }

  //   App.EM.emit('QuoteTool::showStep', step)

  //   // @TODO: Hide all steps of differet routes

  //   currentStepContainers.forEach((container) => {
  //     container.classList.remove(cssClasses.active)
  //   })
  //   activeStepContainer.classList.add(cssClasses.active)

  //   console.log(activeStepContainer)
  // }

  // // function hideStep(step) {
  // //   App.EM.emit('QuoteTool::hideStep', step)

  // //   const stepEl = quoteContainer.querySelector(`[data-step="${step}"]`)

  // //   stepEl.classList.remove(cssClasses.active)
  // // }

  // /**
  //  * Set the change events to the inputs in the current step.
  //  * @param {String} step The current step taken from the payload
  //  */
  // function initialiseStep(step) {
  //   const stepInputs = [...activeStepContainer.querySelectorAll(selectors.quoteInputs)]

  //   stepInputs.forEach((input) => {
  //     on('change', input, () => {
  //       if (input.type === 'select-one' && !validateSelectValues(stepInputs)) {
  //         return
  //       }

  //       const inputChoice = input.dataset.choice

  //       App.EM.emit('QuoteTool::inputChange', step, inputChoice)
  //     })
  //   })
  // }

  // // @TODO: This work but if a user then changes their options, it doesn't update

  // /**
  //  * Check each select input has a valid value.
  //  * @param {Object} inputs current step nodes
  //  */
  // function validateSelectValues(inputs) {
  //   let inputValid = true

  //   inputs.forEach((input) => {
  //     if (!input.value) {
  //       inputValid = false
  //     }
  //   })

  //   return inputValid
  // }

  // function showFirstStep() {
  //   nodes.c.firstStep.classList.add(cssClasses.active)

  //   nodes.c.quoteRadios = [...nodes.c.firstStep.querySelectorAll(selectors.quoteRadios)]
  // }

  // function selectchoice(choice) {
  //   if (choice === 'instant') {
  //     // initialiseInstantQuoteForm()
  //   } else if (choice === 'surveys') {
  //     // SurveysQuoteTool(choice, quoteContainer)
  //     // initialiseSpecificQuoteForm(choice)
  //   }
  // }

  // function initialiseInstantQuoteForm() {
  //   nodes.instantQuoteContainer = document.querySelector(selectors.instantQuoteContainer)

  //   nodes.serviceInputs.forEach((input) => {
  //     on('change', input, () => {
  //       if (input.checked) {
  //         showSelectedCategory(input.id)
  //       }
  //     })
  //   })
  // }

  // function showSelectedCategory(category) {
  //   nodes.instantQuoteContainer.dataset.showCategory = category
  // }

  // function initialiseSpecificQuoteForm(type) {
  //   console.log(`specific form: ${type}`)
  // }

  /**
   * Calculate the estimated quote.
   */
  function calculateEstimatedQuote() {
    const quoteEl = nodes.estimatedQuoteValue
    let field
    let value

    if (App.QuoteData.type === 'surveys') {
      field = App.QuoteData.purchasePrice + App.QuoteData.sqm
      value = data[App.QuoteData.type][App.QuoteData.typeVariant][field]

    } else if (App.QuoteData.type === 'valuations') {
      value = data[App.QuoteData.type][App.QuoteData.estimatedValue]

    } else if (App.QuoteData.type === 'leaseholdValuations') {
      if (App.QuoteData.typeVariant === 'leaseExtensions') {
        value = data[App.QuoteData.type][App.QuoteData.typeVariant][App.QuoteData.numberOfBedrooms]

      } else if (App.QuoteData.typeVariant === 'collectiveEnfranchisement') {
        value = data[App.QuoteData.type][App.QuoteData.typeVariant][App.QuoteData.numberOfFlats]
      }
    }

    if (data.premiumPostCodes.includes(App.QuoteData.postcode)) {
      value += data.additionalFee
    }

    App.QuoteData.estimatedValue = value
    quoteEl.innerHTML = toGbpFormat(value)
  }

  /**
   * Show the estimated quote container
   */
  function showEstimatedQuote() {
    nodes.estimatedQuoteContainer.classList.add(cssClasses.active)
  }

  /**
   * Hide the esimated quote container.
   */
  function hideEstimatedQuote() {
    nodes.estimatedQuoteContainer.classList.remove(cssClasses.active)
  }

    /**
   * Show the no price quote container
   */
  function showNoQuote() {
    nodes.noQuoteContainer.classList.add(cssClasses.active)
  }

  /**
   * Hide the esimated quote container.
   */
  function hideNoQuote() {
    nodes.noQuoteContainer.classList.remove(cssClasses.active)
  }

  /**
   * Add the quote values to the hidden fields.
   */
  function populateFormHiddenFields() {
    nodes.formHiddenFields.forEach(field => {
      const val = App.QuoteData[field.dataset.instantHiddenField]

      if (val) {
        if (field.name === 'service' || field.name === 'service_type') {
          field.value = camelToCapitalCase(val)
        } else if (field.name === 'estimated_quote') {
          field.value = toGbpFormat(val)
        } else {
          field.value = val
        }
      }
    })
  }

  /**
   * Toggle the quote form.
   */
  function toggleQuoteForm() {
    nodes.formModal.classList.toggle(cssClasses.active)
    nodes.htmlEl.classList.toggle(cssClasses.locked)
  }

  /**
   * Scroll the contact modal when focusing on the message textarea so Submit button is visible.
   */
  function scrollContactModal(position) {
    if (position === 'top') {
      nodes.formModalInner.scrollTo(0, 0)
    } else if (position === 'bottom') {
      nodes.formModalInner.scrollTo(0, nodes.formModalInner.scrollHeight)
    }
  }

  /**
   * Initialise component
   */
  function init() {
    if (!componentExists('instant-quote="container"')) {
      return
    }

    // on('click', () => { nodes.formModal.classList.toggle(cssClasses.active) })

    setListeners()
    cacheSelectors()
    setEvents()

    App.QuoteData.step = 1
    App.EM.emit('QuoteTool::initialise', quoteContainer.dataset.formChoice)
  }

  return Object.freeze({
    init,
  })
}