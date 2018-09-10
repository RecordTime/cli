const {
  Tapable,
  SyncHook,
  SyncBailHook,
} = require('tapable');

function fix(num) {
  if (num.toString().length < 2) {
    return `0${num}`;
  }
  return num;
}

class Timer extends Tapable {
  constructor(options) {
    super();

    this.hooks = {
      startTick: new SyncHook(['time']),
      tick: new SyncHook(['seconds']),
      endTick: new SyncBailHook(['begin', 'end']),
    };

    this._duration = options.duration || options.minutes * 60 * 1000;
    this.timer = null;

    this.begin = null;
    this.end = null;

    process.on('SIGINT', () => {
      // console.log('Got SIGINT.  Press Control-D/Control-C to exit.');
      console.log('sigint');
      process.stderr.write('\u001b[?25h');
      process.exit();
    });
  }

  start() {
    let i = this._duration;
    this.begin = new Date();
    this.hooks.startTick.call(this.begin);
    this.timer = setInterval(() => {
      this.hooks.tick.call(i);
      const seconds = fix(Math.floor((i / 1000) % 60));
      const minutes = fix(Math.floor((i / 1000 / 60) % 60));
      this.render(`${minutes}:${seconds}`);
      i -= 1000;
      if (i === 0) {
        clearInterval(this.timer);
        this.clearLine();
        this.end = new Date();
        this.hooks.endTick.call(this.begin, this.end);
        // if (end) {
        //   this.clearLine();
        // }
      }
    }, 1000);
  }

  render(input) {
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    process.stdout.write('\u001b[?25l');
    process.stdout.write(input);
  }

  clearLine() {
    // process.stdout.clearLine();
    process.stdout.write('\u001b[?25h');
  }
}

module.exports = Timer;
