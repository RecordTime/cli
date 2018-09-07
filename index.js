const core = require('./lib');

const recordTimeCLI = (input, flags) => {
  // 先检查是否登录
  // if (!core._storage.isLogin) {
  //   return core.login();
  // }
  if (flags.task) {
    return core.createTask(input);
  }
  if (flags.register) {
    return core.register();
  }
  core.displayByBoard();
  return core.displayStats();
};

module.exports = recordTimeCLI;
