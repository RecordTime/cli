/**
 * @file 入口文件
 * @doc https://github.com/klauscfhq/taskbook/blob/master/index.js
 */
const core = require('./lib');

const recordTimeCLI = (input, flags) => {
  const res = core.hooks.BeforeInvoke.call(input, flags);
  if (res) {
    return false;
  }
  core.displayByBoard();
  return core.displayStats();
};

module.exports = recordTimeCLI;
