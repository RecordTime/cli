const core = require('./lib');

const recordTimeCLI = (input, flags) => {
  // 先检查是否登录
  core.login();
  if (flags.task) {
    return core.createTask(input);
  }
  core.displayByBoard();
  // return core.displayStats();
}

module.exports = recordTimeCLI;
