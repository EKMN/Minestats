const master = require('./js/master.js')
const slave = require('./js/slave.js')

module.exports = {
  master,
  slave
}

/**
 * TODO: out of everything that's in here, module.exports
 * an object that contains a server class, and a client class.
 * API example in another file: const dashboardServer = require('minestats').server(optionalArgs)
 * or dashboardClient = require('minestats').client(optionalArgs)
 */
