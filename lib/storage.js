/**
 * @file 数据存储与读取
 * @author ltaoo
 */
require('dotenv').config();
const fs = require('fs');
const os = require('os');
const path = require('path');
const AV = require('leanengine');

const { getItem, format } = require('../utils');

const DEFAULT_BOARD = 'Work';
const TASK_CLASS = 'Task';

// Task 字段及默认值
const TASK_INTERFACE = {
  title: 'title',
  desc: 'description',
  isComplete: false,
  board: DEFAULT_BOARD,
};

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
});

class Storage {
  get isLogin() {
    return !!this.session;
  }
  get sessionFile() {
    return path.join(os.homedir(), '.recordtimerc');
  }
  get session() {
    let content = '';
    const file = this.sessionFile;
    if (fs.existsSync(file)) {
      content = fs.readFileSync(file, 'utf8');
    }
    return content;
  }
  set session(val) {
    try {
      console.log(val);
      const file = this.sessionFile;
      fs.writeFileSync(file, val, 'utf8');
    } catch (err) {
      console.log(err);
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
      this.session = loginedUser._sessionToken;
    } catch (err) {
      console.log(err.code, err.rawMessage);
    }
    return loginedUser;
  }
  /**
   * 获取任务列表
   * @param {State} state - 任务状态 0-未完成、1-已完成 
   * @return {[]Task}
   */
  async fetchTasks({ state } = {}) {
    const query = new AV.Query(TASK_CLASS);
    query.descending('createdAt');
    try {
      const tasks = await query.find();
      return getItem(tasks);
    } catch (err) {
      return [];
    }
  }

  /**
   * 新增任务
   * @param {string} params.title - 用来显示的内容
   * @param {string} params.description - 补充描述
   * @param {string} params.board - 分类
   */
  async createTask(params) {
    const Task = AV.Object.extend(TASK_CLASS);
    const task = new Task();
    Object.keys(TASK_INTERFACE).forEach(key => {
      task.set(key, params[key] || TASK_INTERFACE[key]);
    });
    const createdTask = await task.save(null, { sessionToken: this.session });
    console.log('created task', createdTask);
    return FormData(createdTask) ;
  }
}

module.exports = Storage;