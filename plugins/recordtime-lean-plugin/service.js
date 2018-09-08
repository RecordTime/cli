/**
 * @file 数据存储与读取
 * @author ltaoo
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const AV = require('leanengine');
const signale = require('signale');

const { getItem, format } = require('./utils');

const { error } = signale;

const DEFAULT_BOARD = '@Work';
const TASK_CLASS = 'Task';

// Task 字段及默认值
const TASK_INTERFACE = {
  uid: 0,
  title: 'title',
  desc: 'description',
  isComplete: false,
  board: DEFAULT_BOARD,
  // owner: 'User',
};

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
});

class Service {
  constructor(options) {
    this.options = options;
  }

  get isLogin() {
    return !!this.session;
  }

  get sessionFile() {
    const { appDir } = this.options;
    return path.join(appDir, '.session');
  }

  get session() {
    return this.user.session;
  }

  get user() {
    let content = '';
    const file = this.sessionFile;
    if (fs.existsSync(file)) {
      content = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return content;
  }

  set user(val) {
    try {
      const file = this.sessionFile;
      fs.writeFileSync(file, JSON.stringify(val), 'utf8');
    } catch (err) {
      error(err);
    }
  }

  /**
   * 用户登录
   * @param {string} username
   * @param {string} password
   */
  async login({ username, password }) {
    let loginedUser = {};
    try {
      loginedUser = await AV.User.logIn(username, password);
      this.user = {
        ...loginedUser,
        session: loginedUser._sessionToken,
      };
    } catch (err) {
      error(err.code, err.rawMessage);
    }
    return loginedUser;
  }

  /**
   * 注册
   * @param {*} param0
   */
  async register({ username, password, email }) {
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    try {
      const loginedUser = await user.signUp();
      this.user = {
        ...loginedUser,
        session: loginedUser._sessionToken,
      };
    } catch (err) {
      error(err.code, err.rawMessage);
    }
  }

  /**
   * 获取任务列表
   * @param {State} state - 任务状态 0-未完成、1-已完成
   * @return {[]Task}
   */
  async fetchTasks() {
    const query = new AV.Query(TASK_CLASS);
    const user = AV.Object.createWithoutData('_User', this.user.id);
    query.equalTo('owner', user);
    query.descending('createdAt');
    try {
      const tasks = await query.find({ sessionToken: this.session });
      return getItem(tasks);
    } catch (err) {
      error(err.code, err.rawMessage);
      return Promise.reject(err);
    }
  }

  /**
   * 新增任务
   * @param {number} params.id - id
   * @param {string} params.title - 用来显示的内容
   * @param {string} params.description - 补充描述
   * @param {string} params.board - 分类
   * @param {boolean} params.isComplete - 分类
   * @param {number} params.priority - 优先级
   * @param {boolean} params.isStarred - 是否标志
   * @param {timestamp} params.created - 创建时间
   */
  async createTask(params) {
    const Task = AV.Object.extend(TASK_CLASS);
    const task = new Task();
    Object.keys(TASK_INTERFACE).forEach((key) => {
      task.set(key, params[key] || TASK_INTERFACE[key]);
    });
    try {
      task.set('owner', AV.Object.createWithoutData('_User', this.user.id));
      const createdTask = await task.save(null, { sessionToken: this.session });
      return format(createdTask);
    } catch (err) {
      error(err.code, err.rawMessage);
      return Promise.reject(err);
    }
  }

  /**
   *
   * @param {uid[]} uids
   */
  async updateTasks(checked, unchecked) {
    const objects = [
      ...checked.map((id) => {
        const task = AV.Object.createWithoutData(TASK_CLASS, id);
        task.set('isComplete', true);
        return task;
      }),
      ...unchecked.map((id) => {
        const task = AV.Object.createWithoutData(TASK_CLASS, id);
        task.set('isComplete', false);
        return task;
      }),
    ];
    AV.Object.saveAll(objects, { sessionToken: this.session });
    // .then((res) => {
    //   console.log('update success', res);
    // })
    // .catch((err) => {
    //   console.log('fail', err);
    // });
  }
}

module.exports = Service;
