/**
 * @file 数据存储与读取
 * @author ltaoo
 */
require('dotenv').config();
const AV = require('leanengine');

const { getItem } = require('../utils');

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
});

class Storage {
  /**
   * 获取任务列表
   * @param {0} state - 任务状态 0-未完成、1-已完成 
   * @return {[]Task}
   */
  async fetchTasks({ state } = {}) {
    const query = new AV.Query('Todo');
    query.descending('createdAt');
    try {
      const tasks = await query.find();
      return getItem(tasks);
    } catch (err) {
      return [];
    }
  }
}

module.exports = Storage;