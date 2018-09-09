/**
 * @file 真正处理事情的文件
 * @author ltaoo
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/taskbook.js
 */
const {
  Tapable,
  SyncHook,
  SyncWaterfallHook,
} = require('tapable');
const notifier = require('node-notifier');
const inquirer = require('inquirer');

const Task = require('./task');
const Log = require('./log');
const Storage = require('./storage');
const render = require('./render');
const open = require('./showApplication');

const DEFAULT_PRIORITY = 1;

class Core extends Tapable {
  constructor() {
    super();
    this._storage = new Storage();

    this.hooks = {
      beforeSaveTask: new SyncWaterfallHook(['task']),
      afterSaveTask: new SyncHook(['task', 'status']),
      // 改变任务状态前
      // beforeCheckTasks: new SyncWaterfallHook(['task']),
      // 改变任务状态后
      afterCheckedTasks: new SyncHook(['ids', 'checked', 'unchecked']),
      // 保存 log 工时
      beforeSaveLog: new SyncWaterfallHook(['log']),
      afterSaveLog: new SyncWaterfallHook(['log']),
    };
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
    this._storage.set(data);
  }

  // ================= Log =================
  parseTime(input) {
    if (!input.includes('-')) {
      return {
        task: input.slice(1),
      };
    }
    const ary = input.slice(1).split('-');
    const beginTime = new Date(new Date().setHours(...ary[0].split(':'), 0));
    const endTime = new Date(new Date().setHours(...ary[1].split(':'), 0));

    return {
      beginTime,
      endTime,
    };
  }

  /**
   * 直接 log
   * @param {[]string} input
   */
  log(input) {
    const log = {};
    const content = [];
    input.forEach((x) => {
      if (x.startsWith('@')) {
        const { beginTime, endTime, task } = this.parseTime(x);
        if (task !== undefined) {
          log.task = task;
        }
        if (beginTime !== undefined) {
          log.beginTime = beginTime;
          log.endTime = endTime;
        }
      } else {
        content.push(x);
      }
    });
    log.content = content.join(' ');

    this.saveLog(log);
  }

  async saveLog({
    content, task, beginTime, endTime,
  }) {
    const logs = this._storage.getLogs();
    const id = this._generateID(logs);

    const log = {
      id,
      beginTime,
      endTime,
      content,
      task,
    };
    logs[id] = log;
    this.hooks.beforeSaveLog.call(log);
    this._storage.setLogs(logs);
    this.hooks.afterSaveLog.call(log);
  }

  fix(num) {
    if (num.toString().length < 2) {
      return `0${num}`;
    }
    return num;
  }

  async startWork() {
    const beginTime = new Date();
    // let i = 1 * 60 * 1000;
    let i = 11000;
    const timer = setInterval(async () => {
      const seconds = this.fix(Math.floor((i / 1000) % 60));
      const minutes = this.fix(Math.floor((i / 1000 / 60) % 60));
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write('\u001b[?25l');
      process.stdout.write(`${minutes}:${seconds}`);
      i -= 1000;
      if (i === 10000) {
        // Object
        notifier.notify({
          title: '欢乐时光就要开始了~',
        });
      }
      if (i <= 0) {
        clearInterval(timer);
        const endTime = new Date();
        open();
        process.stdout.clearLine();
        render.getTomato(`${beginTime.toLocaleTimeString()} ~ ${endTime.toLocaleTimeString()}`);
        process.stdout.write('\u001b[?25h');
        // 弹出关联任务
        this.displayByBoard();
        const { task } = await inquirer.prompt([{
          type: 'input',
          message: 'Task',
          name: 'task',
        }]);
        const { content } = await inquirer.prompt([{
          type: 'input',
          message: 'Content',
          name: 'content',
        }]);
        this.saveLog({
          beginTime, endTime, task, content,
        });
      }
    }, 1000);
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
    const task = this.hooks.beforeSaveTask.call(source);
    const data = this._data;
    data[task._id] = task;
    this._save(data);
    this.hooks.afterSaveTask.call(task, 'success');
    render.successCreate(task);
  }

  /**
   * 选中/取消选中任务
   * @param {id[]} - 任务 id
   */
  checkTasks(ids) {
    const validatingIds = this._validateIDs(ids);
    const data = this._data;

    const [checked, unchecked] = [[], []];

    validatingIds.forEach((id) => {
      data[id].isComplete = !data[id].isComplete;
      if (data[id].isComplete) {
        checked.push(id);
      } else {
        unchecked.push(id);
      }

      this._save(data);
      render.markTasks(checked, 'Checked');
      render.markTasks(unchecked, 'Unchecked');
      this.hooks.afterCheckedTasks.call(ids, checked, unchecked);
    });
  }

  _getIDs(data = this._data) {
    return Object.keys(data).map(id => +id);
  }

  /**
   *
   * @param {id[]} ids
   */
  _removeDuplicates(ids) {
    return [...new Set(ids)];
  }

  /**
   *
   * @param {id[]} inputIDs
   * @param {id[]} existingIDs
   */
  _validateIDs(inputIDs, existingIDs = this._getIDs()) {
    if (inputIDs.length === 0) {
      render.missingID();
      process.exit(1);
    }

    const ids = this._removeDuplicates(inputIDs);
    const validatingIds = ids.filter((id) => {
      if (!existingIDs.includes(+id)) {
        render.invalidID(id);
        return false;
      }
      return true;
    });

    return validatingIds;
  }

  /**
   * 更新本地单个任务
   * @param {Task} updatedTask - 更新后的
   */
  updateTask(updatedTask) {
    if (updatedTask._id === undefined) {
      return;
    }
    const data = this._data;
    data[updatedTask._id] = updatedTask;
    this._save(data);
  }

  /**
   * 新增任务
   * @param {string[]} input - 会以空格分割为数组
   * @param {string} desc
   */
  createLog(input) {
    const {
      id,
      title,
      board,
      priority,
    } = this._getOptions(input);
    const source = new Log({
      id,
      title,
      board,
      priority,
    });
    // 处理返回的任务数据
    const log = this.hooks.beforeSaveLog.call(source);
    const data = this._data;
    data[log._id] = log;
    this._save(data);
    this.hooks.afterSaveLog.call(log);
    render.successCreate(log);
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

    for (let i = 0, l = input.length; i < l; i += 1) {
      const x = input[i];
      if (x.startsWith('@') && x.length > 1) {
        boards.push(x);
      } else {
        desc.push(x);
      }
    }
    const description = desc.join(' ');
    return {
      id,
      title: description,
      priority,
      board: boards[0],
    };
  }
}

module.exports = Core;
