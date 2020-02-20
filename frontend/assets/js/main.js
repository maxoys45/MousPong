// console.clear()

import EventEmitter from 'event-emitter'

// import Header from './components/header'
// import ToggleNav from './components/toggle-nav'
import MousCover from './components/mous-cover'

window.App = window.App || {}
window.App.EM = new EventEmitter()

document.addEventListener("DOMContentLoaded", () => {
  MousCover().init()

  // ToggleNav().init()
  // Header().init()
})