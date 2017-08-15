'use strict'

const dashboard = require('./source/dashboard.js')
const argv = require('minimist')(process.argv.slice(2))
const args = {}

if (argv.name) args.name = argv.name
if (argv.port) args.port = argv.port
if (argv.domain) args.domain = argv.domain
if (argv.standalone) args.standalone = argv.standalone
if (argv.nologs) args.nologs = true

if (argv.master) {
  dashboard.master(args)
} else if (argv.slave) {
  dashboard.slave(args)
} else {
  console.log('No valid argument specified. Not running anything')
  process.exit(1)
}
