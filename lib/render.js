/**
 * @file 控制数据如何渲染
 * @author ltaoo
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/render.js
 */
const chalk = require('chalk');
const signale = require('signale');

const config = require('../common/config');

signale.config({ displayLabel: false });

const {
  Signale, error, log, pending, success,
} = signale;
const custom = new Signale({
  disabled: false,
  interactive: false,
  stream: process.stdout,
  types: {
    tomato: {
      badge: '🍅',
      color: 'red',
      // label: 'tomato',
    },
  },
});
const {
  blue, green, grey, magenta, red, underline, yellow,
} = chalk;

// 不同优先级展示的颜色，默认是 1
const priorities = { 2: 'yellow', 3: 'red' };

class Render {
  get _configuration() {
    return config.get();
  }

  _colorBoards(boards) {
    return boards.map(x => grey(x).join(' '));
  }

  _isBoardComplete(items) {
    const { tasks, complete, notes } = this._getItemStats(items);
    return tasks === complete && notes === 0;
  }

  /**
   * 展示所有「面板」，面板内是多条任务
   * @param {Board[]} data
   */
  displayByBoard(data) {
    Object.keys(data).forEach((board) => {
      // 如果是已经完成的，并且配置了不展示已完成的任务，就不展示
      // if (this._isBoardComplete(data[board]) && !this._configuration.displayCompleteTasks) {
      //   return;
      // }
      this._displayTitle(board, data[board]);
      data[board].forEach((item) => {
        // 如果当前记录是任务，并且已完成，并且配置了不展示已完成任务
        if (item._isTask && item.isComplete && !this._configuration.displayCompleteTasks) {
          return;
        }
        this._displayItemByBoard(item);
      });
    });
  }

  _getCorrelation(items) {
    const { tasks, complete } = this._getItemStats(items);
    return grey(`${complete}/${tasks}`);
  }

  _getItemStats(items) {
    let [tasks, complete] = [0, 0];

    items.forEach((task) => {
      tasks += 1;
      if (task.isComplete) {
        complete += 1;
      }
    });

    return { tasks, complete };
  }

  _buildTitle(key, items) {
    const title = (key === new Date().toDateString())
      ? `${underline(key)} ${grey('[Today]')}`
      : underline(key);

    const correlation = this._getCorrelation(items);
    return { title, correlation };
  }

  _displayTitle(board, items) {
    const { title: message, correlation: suffix } = this._buildTitle(board, items);
    const titleObj = { prefix: '\n', message, suffix };

    return log(titleObj);
  }

  _displayItemByBoard(item) {
    const { _isTask, isComplete } = item;
    const age = this._getAge(item._timestamp);
    const star = this._getStar(item);

    const prefix = this._buildPrefix(item);
    const message = this._buildMessage(item);
    const suffix = (age.length === 0) ? star : `${age} ${star}`;

    const msgObj = { prefix, message, suffix };

    // 将任务和笔记分开展示，这里就是展示单条记录的方式
    if (_isTask) {
      return isComplete ? success(msgObj) : pending(msgObj);
    }
    // return note(msgObj);
  }

  /**
   * 通过任务的 id 拼接前缀
   * @param {Task} item
   */
  _buildPrefix(item) {
    const prefix = [];

    const { _id } = item;
    // 最长长度为 4，使用空格填充不足四位的情况
    prefix.push(' '.repeat(4 - String(_id).length));
    prefix.push(grey(`${_id}.`));

    return prefix.join(' ');
  }

  /**
   * 拼接任务的正文信息
   * @param {Task} item
   */
  _buildMessage(item) {
    const message = [];

    const { isComplete, title } = item;
    // 优先级
    const priority = parseInt(item.priority, 10);

    if (!isComplete && priority > 1) {
      message.push(underline[priorities[priority]](title));
    } else {
      message.push(isComplete ? grey(title) : title);
    }

    // 在正文后面，根据优先级加上不同数量的感叹号
    if (!isComplete && priority > 1) {
      message.push(priority === 2 ? yellow('(!)') : red('(!!'));
    }

    return message.join(' ');
  }

  /**
   * 计算任务自创建到现在过了多长时间
   */
  _getAge(birthday) {
    const daytime = 24 * 60 * 60 * 1000;
    const age = Math.round(Math.abs((birthday - Date.now()) / daytime));
    return (age === 0) ? '' : grey(`${age}d`);
  }

  /**
   * 根据任务是否被标志过返回 * 或者 空
   * @param {Task} item
   */
  _getStar(item) {
    return item.isStarred ? yellow('*') : '';
  }

  displayStats({
    percent, complete, pending,
  }) {
    // 不展示当前进度概览
    if (!this._configuration.displayProgressOverview) {
      return;
    }

    percent = percent >= 75 ? green(`${percent}%`) : percent >= 50 ? yellow(`${percent}%`) : `${percent}%`;

    const status = [
      `${green(complete)} ${grey('done')}`,
      `${magenta(pending)} ${grey('pending')}`,
    ];

    // 全部任务已完成
    if (complete !== 0 && pending === 0) {
      log({ prefix: '\n', message: 'All done!', suffix: yellow('*') });
    }
    if (pending + complete === 0) {
      log({ prefix: '\n', message: 'Type --help to get started!', suffix: yellow('*') });
    }

    log({ prefix: '\n', message: grey(`${percent} of all tasks complete.`) });
    log({ prefix: '\n', message: status.join(grey(' · ')), suffix: '\n' });
  }

  /**
   * 新增任务成功
   */
  successCreate({ _id }) {
    const [prefix, suffix] = ['\n', grey(_id)];
    const message = 'Created task';
    success({ prefix, message, suffix });
  }

  createFail({ _id }) {
    const [prefix, suffix] = ['\n', grey(_id)];
    const message = 'Create task Failed';
    error({ prefix, message, suffix });
  }

  /**
   *
   * @param {*} ids
   * @param {*} title - Checked/Unchecked/Started/Unstarted
   */
  markTasks(ids, title) {
    if (ids.length === 0) {
      return;
    }
    const [prefix, suffix] = ['\n', grey(ids.join(', '))];
    const message = `${title} ${ids.length > 1 ? 'tasks' : 'task'}`;
    success({ prefix, message, suffix });
  }

  getTomato(input) {
    const [prefix, suffix] = ['\n', grey(input)];
    const message = 'Get!';
    custom.tomato({ prefix, message, suffix });
  }
}

module.exports = new Render();
