// console.clear()

import smoothscroll from 'smoothscroll-polyfill'
import EventEmitter from 'event-emitter'

import About from './templates/about'
import Home from './templates/home'
import Page from './templates/page'

import Header from './components/header'
import ToggleNav from './components/toggle-nav'
import QuoteTool from './components/quote/container'

window.App = window.App || {}
window.App.EM = new EventEmitter()

window.App.QuoteData = {}

document.addEventListener("DOMContentLoaded", () => {
  smoothscroll.polyfill()

  console.log(`pageTemplate=${App.strings.pageTemplate}`)

  switch(App.strings.pageTemplate) {
    case 'home':
      Home().init()
      break

    case 'about':
      About().init()
      break

    case 'page':
      Page().init()
  }

  ToggleNav().init()
  Header().init()
  QuoteTool().init()
})