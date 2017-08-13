'use strict'

const dashboard = require('./source/dashboard.js')
const argv = require('minimist')(process.argv.slice(2))
const args = {}

if (argv.name) args.name = argv.name
if (argv.port) args.name = argv.port
if (argv.domain) args.name = argv.domain
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

// instead of this, create an empty array, perhaps called "arguments", and then run multiple ifs and simply fill the array with
// the flags and values, if they exist
