const io = require('socket.io-client')
const emoji = require('node-emoji')

module.exports = (opts = {}) => {
  const { name = '(noname)' } = opts
  const { port = 3000 } = opts
  const { domain = 'http://localhost' } = opts
  const { nologs = false } = opts
  const slave = io.connect(`${domain}:${port}/slave`)

  // when a slave successfully connects
  slave.on('connect', () => {
    if (!nologs) console.log(emoji.get('white_check_mark') + ` Slave ${name} has connected to master`)
    slave.emit('join', { name })
  })

  // when a slave receives a tick
  slave.on('tick', (todo) => {
    // each tick is orchestrated by master, and on each tick the slave should
    // poll a) an api, and then submit to master, OR
    // read from a local logfile, maybe geth > log.json
    if (!nologs) console.log(`Slave received a tick from master, asking to: ${todo}`)

    // example, minerate in megahash / second
    const data = { hashrate: Math.floor((Math.random() * 100) + 1) }

    // respond with a tack
    if (!nologs) console.log('slave responds with a tack')
    slave.emit('tack', { data, name })
  })
}
