#! /usr/bin/env node

require('dotenv').config();

const LeanPlugin = require('./plugins/recordtime-lean-plugin');
// const TypePlugin = require('./plugins/recordtime-type-plugin');

const help = require('./lib/help');
const RecordTimeCLI = require('.');

const recordTimeCLI = new RecordTimeCLI({
  help,
  flags: {
    doing: {
      type: 'boolean',
      alias: 'd',
    },
    log: {
      type: 'boolean',
    },
    task: {
      type: 'boolean',
      alias: 't',
    },
    check: {
      type: 'boolean',
      alias: 'c',
    },
  },
  plugins: [
    new LeanPlugin(),
    // new TypePlugin(),
  ],
});

recordTimeCLI.apply();
