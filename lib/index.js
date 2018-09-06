const  clipboardy = require('clipboardy');

const Task = require('./task');
const Storage = require('./storage');
const render = require('./render');

class Core {
  constructor() {
    this._storage = new Storage();
  }

  async fetch() {
    return await this._storage.fetchTasks();
  }

  /**
   * 从任务列表中遍历出所有 board
   * @return {BoradTitle[]}
   */
  _getBoards() {
    const _data = this.fetch();;
    const originBoards = ['My Board'];
    // 将 task 填充到 boards 中
    Object.keys(_data).forEach(id => {
      const task = _data[id];
      boards.push(...task.boards.filter(board => originBoards.indexOf(board) === -1));
    });

    return originBoards;
  }

  /**
   * 以面板展示各面板下的所有任务
   */
  async displayByBoard() {
    render.displayByBoard(await this._groupByBoard());
  }

  /**
   * 将任务根据 Board 组合
   * @param {Task[]} data - 任务列表
   * @param {Board[]} boards - board 列表
   * @return {BoardTask} {[key: BoardTitle]: Task[]}
   */
  async _groupByBoard(_data, boards = []) {
    const data = _data || await this.fetch();
    const grouped = {};

    if (boards.length === 0) {
      boards = this._getBoards();
    }

    Object.keys(data).forEach(id => {
      boards.forEach(board => {
        if (data[id].boards.includes(board)) {
          // 向面板插入任务
          if (Array.isArray(grouped[board])) {
            return grouped[board].push(data[id]);
          }
          // 初始化这个面板
          grouped[board] = [data[id]];
          return grouped[board];
        }
      });
    });

    return grouped;
  }

  /**
   * 展示统计数据
   */
  displayStats() {
    render.displayStates(this._getStats());
  }

  /**
   * 获取统计数据
   * @return {number} return.percent - 完成的百分比
   * @return {number} return.complete - 已完成的数量
   * @return {number} return.pending - 未完成的数量
   * @return {number} return.notes - 笔记数
   */
  _getStats() {
    const { _data } = this.fetch();
    let [complete, pending, notes] = [0, 0, 0];

    Object.keys(_data).forEach(id => {
      if (_data[id]._isTask) {
        return _data[id].isComplete ? complete++ : pending++;
      }
      return notes++;
    });

    const total = complete + pending;
    const percent = (total === 0) ? 0 : Math.floor(complete * 100 / total);

    return { percent, complete, pending, notes };
  }
}

module.exports = new Core();
