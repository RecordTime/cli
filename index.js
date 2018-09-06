const inquirer = require('inquirer');
const program = require('commander');

const core = require('./lib');

const recordTimeCLI = (input, flags) => {
  core.displayByBoard();
  // return core.displayStats();
}

module.exports = recordTimeCLI;
