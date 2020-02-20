/**
 * Mous Cover
 * ------------------------------------------------------------------------------
 * Component for showing and hiding the mous cover on page change.
 *
 * @namespace mousCover
 */
import { on } from '../helpers/utils'
import cssClasses from '../helpers/cssClasses'

/**
 * Global variables
 */
const selectors = {
  cover: '[mous-cover]',
  mainLinks: '[mous-cover-link]',
}

export default () => {

  /**
   * Node selectors
   */
  const nodes = {
    cover: document.querySelector(selectors.cover),
    mainLinks: [...document.querySelectorAll(selectors.mainLinks)],
  }

  /**
   * Set listeners
   */
  function setListeners() {
    nodes.mainLinks.forEach(link => {
      on('click', link, (e) => {
        e.preventDefault()
        pageTransition(link)
      })
    })
  }

  const pageTransition = async (link) => {
    await showCover()

    gotoPage(link)
  }

  /**
   * Hide the mous cover.
   */
  const hideCover = () => {
    setTimeout(() => {
      nodes.cover.classList.remove(cssClasses.active)
    }, 150)
  }

  /**
   * Show the mous cover.
   */
  const showCover = () => {
    nodes.cover.classList.add(cssClasses.active)

    return new Promise(resolve => {
      nodes.cover.ontransitionend = () => {
        resolve(nodes.cover)
      }
    })
  }

  /**
   * Goto the requested page once the animation has played.
   */
  const gotoPage = (link) => {
    window.location.href = link.getAttribute('href')
  }

  /**
   * Initialise component
   */
  function init() {
    setListeners()
    hideCover()
  }

  return Object.freeze({
    init,
  })
}