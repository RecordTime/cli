const Item = require('./item');

class Log extends Item {
  constructor(options) {
    super(options);

    this.beginTime = options.beginTime;
    this.endTime = options.endTime;

    this.content = options.content;
    this.task = options.taskId;
  }
}

module.exports = Log;
