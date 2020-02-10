/**
 * Slideshow
 * ------------------------------------------------------------------------------
 * Component for homepage slideshow.
 *
 * @namespace slideshow
 */
import Flickity from 'flickity-imagesloaded'

/**
 * Global variables
 */
const selectors = {
  container: '[js-carousel="container"]',
  slides: '[js-carousel="slide"]',
}

let nodes = {}

export default () => {

  /**
   * Cache the node selectors
   */
  function cacheSelectors() {
    nodes = {
      container: document.querySelector(selectors.container),
      slides: [...document.querySelectorAll(selectors.slides)],
    }
  }

  /**
   * Initiate the flickity carousel
   */
  function initiateCarousel() {
    const carousel = new Flickity(nodes.container, {
      wrapAround: true,
      prevNextButtons: false,
      autoPlay: 5000,
      imagesLoaded: true,
    })
  }

  /**
   * Set the click events
   */
  // function setClickEvents() {
    // // Show corresponding view from js attribute of button
    // [...nodes.navButton].forEach((btn) => {
    //   btn.addEventListener('click', () => {
    //     Mickoin.EM.emit('View::show', btn.getAttribute('main-nav'))
    //     Mickoin.EM.emit(`View::${btn.getAttribute('main-nav')}`)
    //   })
    // })

    // // Show the selected coin view
    // [...nodes.ticker.row].forEach((row) => {
    //   row.addEventListener('click', () => {
    //     Mickoin.EM.emit('View::show', views.coin)
    //     Mickoin.EM.emit('Coin::select', row.dataset.symbol)
    //   })
    // })
  // }

  /**
   * Initialise component
   */
  function init() {
    cacheSelectors()
    // setClickEvents()
    initiateCarousel()
  }

  return Object.freeze({
    init,
  })
}