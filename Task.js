const AV = require('leanengine');

const { getItem } = require('./utils');

/**
 * 
 * @param {0} state - 任务状态 0-未完成、1-已完成 
 */
module.exports.fetchTasks = async function fetchTasks({ state } = {}) {
  const query = new AV.Query('Todo');
  query.descending('createdAt');
  try {
    const tasks = await query.find();
    return getItem(tasks);
  } catch (err) {
    console.log('err');
  }
}