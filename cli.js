#! /usr/bin/env node

const meow = require('meow');

const help = require('./lib/help');
const recordTimeCLI = require('.');

// 这里是进行支持的参数配置
const cli = meow(help, {
  flags: {
    login: {
      type: 'boolean',
      alias: 'l',
    },
    task: {
      type: 'boolean',
      alias: 't',
    },
  },
});

// 每次输入命令，都是从这里开始
recordTimeCLI(cli.input, cli.flags);
