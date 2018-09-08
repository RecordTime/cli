/**
 * @file Lean 插件，在创建任务成功后，向数据库写入一条记录
 * @author ltaoo
 */
const inquirer = require('inquirer');
const signale = require('signale');

const Service = require('./service');

const { error } = signale;

class LeanPlugin {
  constructor(core) {
    this._core = core;
    this.options = {
      appDir: core._storage._mainAppDir,
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
    storage.hooks.BeforeInvoke.tap('LeanPlugin', () => {
      if (!this._service.isLogin) {
        console.log('check is login, and tip login');
        return this.login();
      }
      return false;
    });
    storage.hooks.BeforeSaveTask.tap('LeanPlugin', task => ({
      ...task,
      // 多终端唯一 id
      uid: task.id,
      // 表示从命令行创建
      platform: 0,
    }));
    storage.hooks.AfterSaveTask.tap('LeanPlugin', (task) => {
      this._service.createTask(task);
    });
  }

  async sync() {
    const onlineTasks = await this._service.fetchTasks();
    const localTasks = this._core._data;
    //
    const needDownloadTasks = {};
    const needUploadTasks = {};
    // 将云端任务与本地任务对比、同步，以 _id 为标志
    const onlineKeys = Object.keys(onlineTasks);
    console.log('线上任务数为：', onlineKeys.length);
    const localKeys = Object.keys(localTasks);
    console.log('本地任务数为：', localKeys.length);
    const longLen = Math.max(onlineKeys.length, localKeys.length);

    let [outer, inner] = [onlineTasks, localTasks];
    if (localTasks.length === longLen) {
      outer = localTasks;
    }
    for (let x = 0, y = Object.keys(outer).length; x < y; x += 1) {
      const localKey = Object.keys(outer)[x];
      const localTask = outer[localKey];

      if (localTask.id === undefined) {
        needDownloadTasks[onlineKey] = onlineTask;
        continue;
      }

      for (let i = 0, len = Object.keys(inner).length; i < len; i += 1) {
        const onlineKey = Object.keys(inner)[i];
        const onlineTask = inner[onlineKey];
      }
    }
  }
}

module.exports = LeanPlugin;
