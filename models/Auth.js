/**
 * @file 注册登录
 * @author ltaoo
 */
const AV = require('leanengine');
const inquirer = require('inquirer');

/**
 * 登录
 */
module.exports.login = async function login() {
  
}

/**
 * 注册
 */
module.exports.register = async function register() {
  try {
    const { username } = await inquirer.prompt([{
      type: 'input',
      // 显示的文案
      message: 'Username',
      // 返回的字段 key
      name: 'username',
    }]);
    const { email } = await inquirer.prompt([{
      type: 'input',
      message: 'Email',
      name: 'email'
    }]);
    const { password } = await inquirer.prompt([{
      type: 'password',
      message: 'Password',
      name: 'password'
    }]);
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    const loginedUser = await user.signUp();
    console.log('Login success !');
  } catch (err) {
    console.log(err);
  }
}

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
