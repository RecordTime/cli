const Timer = require('./Timer');

const DEFAULT_MINUTES = 25;

class Tomato extends Timer {
  constructor(options) {
    super(options);

    this._duration = (options.minutes || DEFAULT_MINUTES) * 60 * 1000;
    this.timer = null;
  }
}

module.exports = Tomato;
