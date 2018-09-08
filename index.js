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
  if (flags.task) {
    return core.createTask(input);
  }
  core.displayByBoard();
  return core.displayStats();
};

module.exports = recordTimeCLI;
