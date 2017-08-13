import * as io from 'socket.io-client'
import _ from 'lodash'
import Noty from 'noty'
import Vue from 'vue'
import draggable from 'vuedraggable'

// connects to our client namespace.
const socket = io.connect('/client')

// exposes sockets and lodash to window namespace
window.sockets = []
window._ = _
window.Vue = Vue

// when client receives an update from master
socket.on('update', (received) => {
  // if UID key-value pair doesn't already exist on our sockets-array
  if (!_.find(window.sockets, { UID: received.UID })) {
    new Noty({
      text: received.name + ' connected.',
      type: 'success',
      progressbar: true,
      timeout: 2000,
      animation: {
        open: 'animated bounceInRight',
        close: 'animated bounceOutRight'
      }
    }).show()

    // first-time push this item to our sockets-list
    window.sockets.push(received)
  } else {
    // find the right index for received UID
    const index = _.findIndex(window.sockets, { UID: received.UID })

    // push the refreshed data to that index
    window.sockets[index] = received
  }
  // update our app-instance with new data
  app.servers = window.sockets
  // force update the DOM (it does not know when object-properties change)
  app.update()
})

// when client connects to master
socket.on('connect', () => {
  // todo logic
})

// when master is disconnected from client
socket.on('disconnect', () => {
  // clear sockets as server has lost track of correct UIDs
  window.sockets = []
  app.servers = []

  new Noty({
    text: 'Lost connection to master.',
    type: 'info',
    progressbar: true,
    timeout: 2000,
    animation: {
      open: 'animated bounceInRight',
      close: 'animated bounceOutRight'
    }
  }).show()
})

// when client receives a slaveDisconnect notice from master
socket.on('slaveDisconnected', (UID) => {
  const index = _.findIndex(window.sockets, { UID: UID })

  if (index > -1) {
    new Noty({
      text: window.sockets[index].name + ' disconnected.',
      type: 'error',
      progressbar: true,
      timeout: 2000,
      animation: {
        open: 'animated bounceInRight',
        close: 'animated bounceOutRight'
      }
    }).show()

    console.log(`${UID} disconnected`)
    console.log(`found matching UID in sockets at index ${index}`)

    // remove the item from arrays
    window.sockets.splice(index, 1)
    app.servers = window.sockets
    // also remove all found elements with this UID from DOM
  }
})

// starts our  vue app
const app = new Vue({
  el: '#app',
  data: {
    servers: []
  },
  methods: {
    update () {
      this.$forceUpdate()
    }
  },
  components: {
    draggable
  }
})
// exposes our app
window.app = app
