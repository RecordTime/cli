/**
 * @file 数据存储与读取
 * @author ltaoo
 */
require('dotenv').config();
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
  /**
   * 
   * @param {string} username 
   * @param {string} password 
   */
  async login({ username, password }) {
    const loginedUser = await AV.User.logIn(username, password);
    console.log(loginedUser);
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
    const createdTask = await task.save(null, { sessionToken: '7iokx50qqc34yi1gve3o8t1qh' });
    console.log('created task', createdTask);
    return FormData(createdTask) ;
  }
}

module.exports = Storage;