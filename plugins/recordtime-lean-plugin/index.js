/**
 * @file Lean 插件，在创建任务成功后，向数据库写入一条记录
 * @author ltaoo
 */
const inquirer = require('inquirer');
const signale = require('signale');

const Service = require('./service');
const { NO_PERMISSION_TIP } = require('./constants');

const { error } = signale;

class LeanPlugin {
  constructor(options) {
    this.options = options;
  }

  /**
   * 注册事件
   * @param {RecordTimeCLI} cli
   */
  apply(cli) {
    cli.hooks.init.tap('LeanPlugin', this.beforeInit.bind(this));
    cli.hooks.beforeApply.tap('LeanPlugin', this.beforeExec.bind(this));
  }

  beforeInit(options = {}, core) {
    this.options = {
      appDir: core._storage._mainAppDir,
    };
    this._service = new Service(this.options);

    core.hooks.beforeSaveTask.tap('LeanPlugin', task => ({
      ...task,
      // 多终端唯一 id
      uid: task._id,
      // 表示从命令行创建
      platform: 0,
    }));
    core.hooks.afterSaveTask.tap('LeanPlugin', (task) => {
      console.log('create task');
      this._service.createTask(task)
        .then((res) => {
          // 拿到保存成功后的 objectid，写入本地
          core.updateTask({
            ...task,
            objectid: res._id,
          });
        });
    });
    core.hooks.afterCheckedTasks.tap('LeanPlugin', (ids, checked, unchecked) => {
      const data = core._data;
      const checkedObjectids = checked.map(id => (data[id] || {}).objectid).filter(x => !!x);
      const uncheckedObjectids = unchecked.map(id => (data[id] || {}).objectid).filter(x => !!x);
      this._service.updateTasks(checkedObjectids, uncheckedObjectids);
    });

    core.hooks.beforeSaveLog.tap('LeanPlugin', log => ({
      ...log,
      uid: log.id,
    }));
    core.hooks.afterSaveLog.tap('LeanPlugin', (log) => {
      console.log(log.task, core._data[log.task].objectid);
      this._service.saveLog({
        ...log,
        task: log.task && core._data[log.task].objectid,
      });
    });

    return {
      ...options,
      flags: {
        ...options.flags,
        login: {
          type: 'boolean',
          alias: 'l',
        },
        register: {
          type: 'boolean',
          alias: 'r',
        },
      },
    };
  }

  beforeSaveLog() {

  }

  afterSaveLog() {

  }

  beforeExec(input, flags) {
    if (flags.register) {
      return this.register();
    }
    if (!this._service.isLogin) {
      console.log(NO_PERMISSION_TIP);
      return this.login();
    }
    if (flags.login) {
      return this.login();
    }
    return false;
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
      await this._service.register({ username, password, email });
    } catch (err) {
      error(err);
    }
  }

  // async sync() {
  //   const onlineTasks = await this._service.fetchTasks();
  //   const localTasks = this._core._data;
  //   //
  //   const needDownloadTasks = {};
  //   const needUploadTasks = {};
  //   // 将云端任务与本地任务对比、同步，以 _id 为标志
  //   const onlineKeys = Object.keys(onlineTasks);
  //   console.log('线上任务数为：', onlineKeys.length);
  //   const localKeys = Object.keys(localTasks);
  //   console.log('本地任务数为：', localKeys.length);
  //   const longLen = Math.max(onlineKeys.length, localKeys.length);

  //   let [outer, inner] = [onlineTasks, localTasks];
  //   if (localTasks.length === longLen) {
  //     outer = localTasks;
  //   }
  //   for (let x = 0, y = Object.keys(outer).length; x < y; x += 1) {
  //     const localKey = Object.keys(outer)[x];
  //     const localTask = outer[localKey];

  //     if (localTask.id === undefined) {
  //       needDownloadTasks[onlineKey] = onlineTask;
  //       continue;
  //     }

  //     for (let i = 0, len = Object.keys(inner).length; i < len; i += 1) {
  //       const onlineKey = Object.keys(inner)[i];
  //       const onlineTask = inner[onlineKey];
  //     }
  //   }
  // }
}

module.exports = LeanPlugin;
