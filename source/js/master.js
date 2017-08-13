const express = require('express')
const app = express()
const server = require('http').createServer(app)
const slave = require('./slave.js')
const io = require('socket.io')(server)
const emoji = require('node-emoji')

module.exports = (opts = {}) => {
  // default settings
  const { port = 3000 } = opts
  const { slavePort = port } = opts
  const { standalone = false } = opts
  const { nologs = false } = opts
  let connectedClients = 0

  const orchestrate = function (refresh) {
    setTimeout(() => {
      if (connectedClients >= 1) {
        if (!nologs) console.log('tick')
        slaves.emit('tick', 'refresh data')
      } else {
        if (!nologs) console.log('No clients online. Skipping tick.')
      }
      orchestrate(refresh)
    }, refresh)
  }

  // host static site
  app.use(express.static('./public'))

  // creates two namespaces, one for slaves, and one for clients
  const slaves = io.of('/slave')
  const clients = io.of('/client')

  slaves.on('connect', (slave) => {
    const slavesOnline = Object.keys(slaves.connected).length

    // when a slave joins
    slave.on('join', (received) => {
      if (!nologs) console.log(emoji.get('a') + ` Master received connection from ${received.name}`)
      if (!nologs) console.log(emoji.get('question') + ` Now running ${slavesOnline} slave${(slavesOnline > 1) ? 's' : ''}`)

      // update clients with data whenever a slave has joined
      clients.emit('update', { UID: slave.id, name: received.name, hashrate: 0 })
    })

    // when a slave has complete its tick operation, it well send back a tack
    slave.on('tack', (received) => {
      // push tack response to clients
      clients.emit('update', { UID: slave.id, hashrate: received.data.hashrate, name: received.name })
    })

    // a client has disconnected
    slave.on('disconnect', () => {
      if (!nologs) console.log(emoji.get('a') + ` Slave ${slave.id} disconnected`)
      clients.emit('slaveDisconnected', slave.id)
    })
  })

  clients.on('connect', (client) => {
    const clientsOnline = Object.keys(clients.connected).length
    connectedClients++

    // inform that a client has connected
    if (!nologs) console.log(emoji.get('b') + ` A client connected. ${clientsOnline} client${(clientsOnline > 1) ? 's' : ''} online.`)

    // ask all slaves to send sitrep.
    // the tick should optimally be trigger by the master thread, and be
    // customisable by a --refresh inSeconds flag.
    slaves.emit('tick', 'pull data')

    // when a client disconnects
    client.on('disconnect', () => {
      connectedClients--
      if (!nologs) console.log(emoji.get('b') + ` A client disconnected.`)
    })
  })

  // start server
  server.listen(port, function () {
    // server details
    const address = (this.address().address === '::') ? 'localhost' : this.address().address
    const port = this.address().port

    // if master also a slave, spawn a slave instance within the process
    if (standalone) {
      slave({ port: slavePort, location: `http://${address}` })
    }

    // starts polling
    orchestrate(10000)

    // log that our server has started
    console.log(emoji.get('checkered_flag') + ` Dashboard master is now running at http://${address}:${port}`)
  })
}
