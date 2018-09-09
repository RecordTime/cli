/**
 * @file 入口文件
 * @doc https://github.com/klauscfhq/taskbook/blob/master/index.js
 */
const { Tapable, SyncBailHook } = require('tapable');
const meow = require('meow');
const Core = require('./lib');

class RecordTimeCLI extends Tapable {
  constructor(options) {
    super();

    this.hooks = {
      init: new SyncBailHook(['options', 'core']),
      beforeApply: new SyncBailHook(['input', 'flags']),
    };

    this.initialPlugins(options.plugins);

    this.core = new Core();
    this.options = this.hooks.init.call(options, this.core);
  }

  /**
   * 遍历传入的插件并注册事件
   * @param {Plugin[]} plugins
   */
  initialPlugins(plugins) {
    for (let i = 0, l = plugins.length; i < l; i += 1) {
      plugins[i].apply(this);
    }
  }

  apply() {
    const { core } = this;
    const { help, flags: flagsConfig } = this.options;
    const { input, flags } = meow(help, { flags: flagsConfig });
    const over = this.hooks.beforeApply.call(input, flags);
    if (over) {
      return false;
    }
    if (flags.doing) {
      return core.startWork();
    }
    if (flags.task) {
      return core.createTask(input);
    }
    if (flags.check) {
      return core.checkTasks(input);
    }
    core.displayByBoard();
    return core.displayStats();
  }
}

module.exports = RecordTimeCLI;
