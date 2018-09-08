/**
 * @file 真正处理事情的文件
 * @author ltaoo
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/taskbook.js
 */
const {
  Tapable,
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
} = require('tapable');

const Task = require('./task');
const Storage = require('./storage');
const render = require('./render');

const LeanPlugin = require('../plugins/recordtime-lean-plugin');
const TypePlugin = require('../plugins/recordtime-type-plugin');

const DEFAULT_PRIORITY = 1;

class Core extends Tapable {
  constructor() {
    super();
    this._storage = new Storage();

    this.hooks = {
      BeforeInvoke: new SyncBailHook(['input', 'flags']),
      BeforeSaveTask: new SyncWaterfallHook(['task']),
      CreateTask: new SyncHook(['task', 'status']),
    };
    this.initialPlugins(this);
  }

  initialPlugins() {
    const leanPlugin = new LeanPlugin(this);
    const typePlugin = new TypePlugin(this);
    // 注册插件
    leanPlugin.apply(this);
    typePlugin.apply(this);
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

  _save(data) {
    return this._storage.set(data);
  }

  /**
   * 生成 id
   * @param {*} data
   */
  _generateID(data = this._data) {
    const ids = Object.keys(data).map(id => +id);
    const max = (ids.length === 0) ? 0 : Math.max(...ids);
    return max + 1;
  }

  /**
   * 新增任务
   * @param {string[]} input - 会以空格分割为数组
   * @param {string} desc
   */
  createTask(input) {
    const {
      id,
      title,
      board,
      priority,
    } = this._getOptions(input);
    const source = new Task({
      id,
      title,
      board,
      priority,
    });
    // 处理返回的任务数据
    const task = this.hooks.BeforeSaveTask.call(source);
    const data = this._data;
    data[task._id] = task;
    if (this._save(data)) {
      this.hooks.CreateTask.call(task, 'success');
      render.successCreate(task);
      return;
    }
    this.hooks.CreateTask.call(task, 'fail');
    render.createFail(task);
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
  _groupByBoard() {
    const data = this._data;
    const grouped = {};
    Object.keys(data).forEach((id) => {
      const task = data[id];
      grouped[task.board] = (grouped[task.board] || []).concat(task);
    });
    return grouped;
  }

  /**
   * 展示统计数据
   */
  displayStats() {
    render.displayStats(this._getStats());
  }

  /**
   * 获取统计数据
   * @return {number} return.percent - 完成的百分比
   * @return {number} return.complete - 已完成的数量
   * @return {number} return.pending - 未完成的数量
   * @return {number} return.notes - 笔记数
   */
  _getStats() {
    const data = this._data;
    let [complete, pending] = [0, 0, 0];

    Object.keys(data).forEach((id) => {
      if (data[id]._isTask) {
        if (data[id].isComplete) {
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
   * 处理用户输入，得到格式化的字段
   * @param {string} input - 用户输入
   */
  _getOptions(input) {
    const [boards, desc] = [[], []];

    if (input.length === 0) {
      render.missingDesc();
      process.exit(1);
    }

    const id = this._generateID();
    const priority = this._getPriority(input);

    input.forEach((x) => {
      if (!this._isPriorityOpt(x)) {
        return x.startsWith('@') && x.length > 1 ? boards.push(x) : desc.push(x);
      }
      // 计算优先级应该在这里
    });
    const description = desc.join(' ');
    return {
      id,
      title: description,
      priority,
      board: boards[0],
    };
  }
}

module.exports = new Core();
