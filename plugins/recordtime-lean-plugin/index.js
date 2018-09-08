/**
 * @file Lean 插件，在创建任务成功后，向数据库写入一条记录
 * @author ltaoo
 */
const inquirer = require('inquirer');
const signale = require('signale');

const Service = require('./service');

const { error } = signale;

class LeanPlugin {
  constructor(options) {
    this.options = {
      appDir: options._storage._mainAppDir,
    };

    this._service = new Service(this.options);
  }

  async login() {
    try {
      const { username } = await inquirer.prompt([{
        type: 'input',
        message: 'Username',
        name: 'username',
      }]);
      const { password } = await inquirer.prompt([{
        type: 'password',
        message: 'Password',
        name: 'password',
      }]);
      // 调用登录方法去登录，并保存登录状态
      await this._service.login({ username, password });
    } catch (err) {
      error(err.code, err.rawMessage);
    }
  }

  async register() {
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
        name: 'email',
      }]);
      const { password } = await inquirer.prompt([{
        type: 'password',
        message: 'Password',
        name: 'password',
      }]);
      await this._storage.register({ username, password, email });
    } catch (err) {
      error(err);
    }
  }

  apply(storage) {
    storage.hooks.BeforeInvoke.tap('a', () => {
      if (!this._service.isLogin) {
        console.log('check is login, and tip login');
        return this.login();
      }
      return false;
    });
    // 注册事件
    storage.hooks.CreateTask.tap('CreateTaskSuccess', (task) => {
      console.log('plugins', task);
    });
  }
}

module.exports = LeanPlugin;
