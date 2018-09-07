/**
 * @file 真正处理事情的文件
 * @author ltaoo
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/taskbook.js
 */
const {
  SyncHook,
} = require('tapable');
const inquirer = require('inquirer');
const signale = require('signale');

const Storage = require('./storage');
const render = require('./render');

const { error } = signale;

const DEFAULT_PRIORITY = 1;

class Core {
  constructor() {
    this._storage = new Storage();
    this.hooks = {
      sync: new SyncHook(),
      createTask: new SyncHook(),
    };

    // 注册插件
    this.hooks.createTask.tap('CreateTaskSuccess', (task) => {
      console.log('create task success ????', task);
    });
  }

  /**
   * ============== 数据 ==============
   */
  get _archive() {
    return this._storage.getArchive();
  }

  get _data() {
    return this._storage.get();
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
      await this._storage.login({ username, password });
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
      console.log(err);
    }
  }

  /**
   * 新增任务
   * @param {string[]} input - 会以空格分割为数组
   * @param {string} desc
   */
  async createTask(input) {
    const {
      title,
      board,
      priority,
    } = this._getOptions(input);
    try {
      const task = await this._storage.createTask({ title, board, priority });
      this.hooks.createTask.call(task);
      render.successCreate(task);
    } catch (err) {
      error(err.code, err.rawMessage);
      process.exit(1);
    }
  }

  /*
   * 获取任务列表
   * @param {string} title
   * @param {string} desc
   */
  async fetchTasks() {
    if (!this._data) {
      this._data = await this._storage.fetchTasks();
    }
    return this._data;
  }

  // ================ DISPLAY ================
  /**
   * 以面板展示各面板下的所有任务
   */
  displayByBoard() {
    render.displayByBoard(this._groupByBoard());
  }

  /**
   * 将任务根据 Board 组合
   * @param {Task[]} data - 任务列表
   * @return {BoardTask} {[key: BoardTitle]: Task[]}
   */
  _groupByBoard(data = this._data) {
    const grouped = {};
    Object.keys(data).forEach((prev, id) => {
      const task = data[id];
      grouped[task.board] = (grouped[task.board] || []).concat(task);
    });
    return grouped;
  }

  /**
   * 展示统计数据
   */
  async displayStats() {
    render.displayStats(await this._getStats());
  }

  /**
   * 获取统计数据
   * @return {number} return.percent - 完成的百分比
   * @return {number} return.complete - 已完成的数量
   * @return {number} return.pending - 未完成的数量
   * @return {number} return.notes - 笔记数
   */
  async _getStats() {
    const _data = await this.fetchTasks();
    let [complete, pending] = [0, 0, 0];

    Object.keys(_data).forEach((id) => {
      if (_data[id]._isTask) {
        if (_data[id].isComplete) {
          complete += 1;
        } else {
          pending += 1;
        }
      }
    });

    const total = complete + pending;
    const percent = (total === 0) ? 0 : Math.floor(complete * 100 / total);

    return {
      percent, complete, pending,
    };
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
    const [boards, desc] = [[], []];

    if (input.length === 0) {
      render.missingDesc();
      process.exit(1);
    }

    const priority = this._getPriority(input);

    input.forEach((x) => {
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
