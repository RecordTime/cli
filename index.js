require('dotenv').config();
const AV = require('leanengine');
const inquirer = require('inquirer');
const program = require('commander');

const { register, login } = require('./Auth');
const { fetchTasks } = require('./Task');

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
});

program
  .command('register', '注册用户')
  .action(() => {
    console.log('Welcome Register, Please Input some information about you ~');
    register();
  });
program
  .command('login', '登录')
  .action(() => {
    login();
  });
// 列出 Task
program
  .command('tasks')
  .description('列出当前未完成任务')
  .option("-s, --setup_mode [mode]", "Which setup mode to use")
  .option('-a, --all', '获取所有任务')
  .option('-c, --complete', '获取已完成任务')
  /**
   * @param {Commander | String} env - tasks 后面如果存在 [env]，这里就是对应的值，否则就是 Commander
   * @param {Options} - options 如果存在 [env]，就是单个 option 的值，否则就是 undefined
   */
  .action(async function(env, options) {
    const tasks = await fetchTasks();
    console.log(tasks);
  });

program.parse(process.argv);