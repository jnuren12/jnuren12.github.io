(function () {
  'use strict'

  var initWidget = {
    key: 'recmenu',
    label: '菜单推荐',
    content: '叉烧滑蛋饭'
  }

  var app = {
    isLoading: true,
    hasRequestPending: false,
    visibleCards: {},
    selectedWidgets: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  }

  /**
   *  =================================
   *  Event listeners for UI components
   *  =================================
   */

  document.getElementById('butAdd').addEventListener('click', function () {
    app.toggleAddDialog(true)
  })

  document.getElementById('butRefresh').addEventListener('click', function () {
    app.updateWidgets()
  })

  document.getElementById('butAddWidget').addEventListener('click', function () {
    var select = document.getElementById('selectWidgetToAdd')
    var selected = select.options[select.selectedIndex]
    var key = selected.value
    var label = selected.textContent
    app.getWidget(key, label)
    app.selectedWidgets.push({key: key, label: label})
    app.saveSelectedWidgets()
    app.toggleAddDialog(false)
  })

  document.getElementById('butAddCancel').addEventListener('click', function () {
    app.toggleAddDialog(false)
  })

  /**
   *  ======================================
   *  Methods for updating and refreshing UI
   *  ======================================
   */

  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container-visible')
    } else {
      app.addDialog.classList.remove('dialog-container-visible')
    }
  }

  app.updateWidgetCard = function (data) {
    var card = app.visibleCards[data.key]
    var pick = data.content
    if (!card) {
      card = app.cardTemplate.cloneNode(true)
      card.classList.remove('cardTemplate')
      card.querySelector('.card-title').textContent = data.label
      card.removeAttribute('hidden')
      app.container.appendChild(card)
      app.visibleCards[data.key] = card
    } else {
      pick = pick[Math.floor(Math.random() * pick.length)]
    }
    card.querySelector('.card-body').textContent = pick
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true)
      app.container.removeAttribute('hidden')
      app.isLoading = false
    }
  }

  /**
   *  =====================
   *  Methods for modelling
   *  =====================
   */

  app.getWidget = function (key, label) {
    var url = 'https://raw.githubusercontent.com/jnuren12/jeezhu-webapp/master/test/'
    url += key + '.json'
    if ('caches' in window) {
      caches.match(url).then(function (response) {
        if (response) {
          response.json().then(function (json) {
            if (app.hasRequestPending) {
              console.log('[App] Widget updated from cache')
              json.key = key
              json.label = label
              app.updateWidgetCard(json)
            }
          })
        }
      })
    }
    app.hasRequestPending = true
    var request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response)
          response.key = key
          response.label = label
          app.hasRequestPending = false
          console.log('[App] Widget updated from network')
          app.updateWidgetCard(response)
        }
      }
    }
    request.open('GET', url)
    request.send()
  }

  app.updateWidgets = function () {
    var keys = Object.keys(app.visibleCards)
    keys.forEach(function (key) {
      app.getWidget(key)
    })
  }
  app.saveSelectedWidgets = function () {
    var selectedWidgets = JSON.stringify(app.selectedWidgets)
    // FIXME: localStorage is not good in production
    localStorage.selectedWidgets = selectedWidgets
  }

  /**
   *  =======================
   *  Code for initialization
   *  =======================
   *
   *  NOTE: localStorage is not good for production applications,
   *    for it is a synchronous API and has serious performance
   *    implications.
   */

  app.selectedWidgets = localStorage.selectedWidgets
  if (app.selectedWidgets) {
    app.selectedWidgets = JSON.parse(app.selectedWidgets)
    app.selectedWidgets.forEach(function (widget) {
      app.getWidget(widget.key, widget.label)
    })
  } else {
    app.updateWidgetCard(initWidget)
    app.selectedWidgets = [
      {key: initWidget.key, label: initWidget.label}
    ]
    app.saveSelectedWidgets()
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(function () {
        console.log('Service worker registered')
      })
  }
})()
