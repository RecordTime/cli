const inquirer = require('inquirer');

const Task = require('./task');
const Storage = require('./storage');
const render = require('./render');

const DEFAULT_PRIORITY = 1;

class Core {
  constructor() {
    this._storage = new Storage();
  }
  /** 
   * ============== 数据 ==============
   */
  async login() {
    console.log('Please input your username and password');
    try {
      const { username } = await inquirer.prompt([{
        type: 'input',
        message: 'Username',
        name: 'username',
      }]);
      const { password } = await inquirer.prompt([{
        type: 'password',
        message: 'Password',
        name: 'password'
      }]);
      console.log(username, password);
      // 调用登录方法去登录
      const loginedUser = await this._storage.login({ username, password });
      // 将 token 持久化，之后就不用每次登录了
      console.log(loginedUser._sessionToken);
    } catch (err) {
      console.log(err.code, err.rawMessage);
    }
  }
  /**
   * 新增任务
   * @param {string[]} input - 会以空格分割为数组
   * @param {string} desc 
   */
  async createTask(input) {
    console.log('origin input value', input);
    const {
      title,
      board,
      priority,
    } = this._getOptions(input);
    console.log(title, board, priority);
    try {
      const task = await this._storage.createTask({ title, board, priority });
      render.successCreate(task);
    } catch (err) {
      console.error(err.code, err.rawMessage);
      process.exit(1);
    }
  }
  /*
   * 获取任务列表
   * @param {string} title 
   * @param {string} desc 
   */
  async fetchTasks() {
    return await this._storage.fetchTasks();
  }

  /**
   * 从任务列表中遍历出所有 board
   * @return {BoradTitle[]}
   */
  _getBoards() {
    const _data = this.fetchTasks();;
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
    const data = _data || await this.fetchTasks();
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
    const { _data } = this.fetchTasks();
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

  /** 
   * ================= Other ================
   */
  /**
   * 文本是否是优先级标志
   * @param {string} x - 用来判断的字符串
   * @return {boolean}
   */
  _isPriorityOpt(x) {
    return ['p:1', 'p:2', 'p:3'].indexOf(x) > -1;
  }
  /**
   * 从 title 中解析出优先级
   * @param {string} title 
   * @return {PriorityNumber}
   */
  _getPriority(title) {
    const opt = title.find(x => this._isPriorityOpt(x));
    return opt ? opt[opt.length - 1] : DEFAULT_PRIORITY;
  }
  /**
   * 
   * @param {string} input - 用户输入
   */
  _getOptions(input) {
    const [ boards, desc ] = [[], []];

    if (input.length === 0) {
      render.missingDesc();
      process.exit(1);
    }

    const priority = this._getPriority(input);

    input.forEach(x => {
      if (!this._isPriorityOpt(x)) {
        return x.startsWith('@') && x.length > 1 ? boards.push(x) : desc.push(x);
      }
    });
    const description = desc.join(' ');
    return {
      title: description,
      priority,
      board: boards[0],
    };
  }
}

module.exports = new Core();
