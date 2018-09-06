#! /usr/bin/env node

const meow = require('meow');

const help = require('./lib/help');
const recordTimeCLI = require('.');

const cli = meow(help, {

});

// 每次输入命令，都是从这里开始
recordTimeCLI(cli.input, cli.flags);
